import { NextResponse, type NextRequest } from "next/server";
import { randomBytes } from "crypto";
import { createClient } from "@/lib/supabase/server";
import { generateFinalReport, engineAudioToReportSection } from "@/lib/report";
import {
  analyzeFullInspection,
  calculateInspectionScores,
} from "@/lib/ai/functions";
import { getModelKnowledge } from "@/lib/ai/model-knowledge";
import { aggregateMechanical } from "@/lib/ai/mechanical";
import { getVehicleHistory } from "@/lib/vehicle-history";
import { computeOverall } from "@/lib/score";
import { createAdminClient } from "@/lib/supabase/admin";
import { checkReportQuota } from "@/lib/quota";
import { logActivity } from "@/lib/activity";
import {
  riskLevelToRecommendation,
  scoreToRiskLevel,
} from "@/lib/constants";
import { MECHANICAL_RISK_COPY } from "@/lib/mechanical";
import { getServerLocale } from "@/lib/i18n-server";
import type { InspectionPhoto, MechanicalCheckItem, PhotoAnalysisResult } from "@/types";

// POST /api/inspections/[id]/report — assemble + persist the final report.
export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: sessionId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: session } = await supabase
    .from("inspection_sessions")
    .select("*, vehicles(*)")
    .eq("id", sessionId)
    .single();
  if (!session) return NextResponse.json({ error: "Inspection not found." }, { status: 404 });

  // Enforce the monthly report quota — but allow regenerating an existing
  // report for this session without consuming another unit.
  const { data: existingReport } = await supabase
    .from("inspection_reports")
    .select("id")
    .eq("inspection_session_id", sessionId)
    .maybeSingle();
  if (!existingReport) {
    const quota = await checkReportQuota(supabase, user.id);
    if (!quota.allowed) {
      return NextResponse.json(
        {
          error: `You have reached your monthly report limit (${quota.used}/${quota.limit}) on the ${quota.plan} plan. Upgrade to generate more reports.`,
          code: "quota_exceeded",
        },
        { status: 402 },
      );
    }
  }

  const { data: photos } = await supabase
    .from("inspection_photos")
    .select("*")
    .eq("inspection_session_id", sessionId);
  const photoList = (photos ?? []) as InspectionPhoto[];

  const results: PhotoAnalysisResult[] = photoList
    .map((p) => p.ai_analysis)
    .filter(Boolean) as PhotoAnalysisResult[];

  if (results.length === 0) {
    return NextResponse.json(
      { error: "Run the analysis before generating a report." },
      { status: 400 },
    );
  }

  const language = await getServerLocale();
  const vehicle = (session as { vehicles?: unknown }).vehicles ?? {};
  const knowledge = await getModelKnowledge(supabase, vehicle as never);
  const scores = calculateInspectionScores(results, knowledge.model_risk_score);
  const global = await analyzeFullInspection(vehicle as never, results, language);
  if (knowledge.matched) {
    global.model_risk_score = knowledge.model_risk_score;
    global.suspicious_points = [
      ...global.suspicious_points,
      ...knowledge.vigilance_points,
    ];
    global.questions_to_ask_seller = Array.from(
      new Set([
        ...global.questions_to_ask_seller,
        ...knowledge.extra_seller_questions,
      ]),
    );
  }

  // Attach the latest completed engine-audio analysis, if any (optional module).
  const { data: audioCheck } = await supabase
    .from("engine_audio_checks")
    .select("*")
    .eq("inspection_session_id", sessionId)
    .eq("analysis_status", "completed")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  const engineAudio = engineAudioToReportSection(audioCheck as never);

  // Attach the engine & mechanical check, if performed.
  const { data: mechItems } = await supabase
    .from("mechanical_checks")
    .select("*")
    .eq("inspection_session_id", sessionId);
  const mechItemList = (mechItems ?? []) as MechanicalCheckItem[];
  const mechanical = aggregateMechanical(mechItemList as never);

  // Free vehicle history (US NHTSA recalls + complaints). Best-effort.
  const v = vehicle as { vin?: string; make?: string; model?: string; year?: number };
  const vehicleHistory = await getVehicleHistory({
    vin: v.vin,
    make: v.make,
    model: v.model,
    year: v.year,
  });

  // Confirmed salvage / total-loss from a purchased per-VIN report (if any).
  let salvageTitle = false;
  if (v.vin) {
    try {
      const { data: purchase } = await supabase
        .from("vin_report_purchases")
        .select("id")
        .eq("user_id", user.id)
        .eq("vin", v.vin.toUpperCase())
        .eq("status", "paid")
        .maybeSingle();
      if (purchase) {
        const admin = createAdminClient();
        const { data: vr } = await admin
          .from("vin_reports")
          .select("data")
          .eq("vin", v.vin.toUpperCase())
          .maybeSingle();
        salvageTitle = Boolean((vr?.data as { salvage_or_total_loss?: boolean })?.salvage_or_total_loss);
      }
    } catch (e) {
      console.error("salvage lookup skipped:", e);
    }
  }

  // --- Overall score + confidence across ALL modules ---
  const photoConfidences = results
    .map((r) => r.confidence)
    .filter((c): c is number => c != null);
  const photoConfidence = photoConfidences.length
    ? Math.round(photoConfidences.reduce((a, b) => a + b, 0) / photoConfidences.length)
    : 50;
  const mechConfidences = mechItemList
    .filter((m) => m.analysis_status === "completed" && m.confidence != null)
    .map((m) => m.confidence as number);
  const mechConfidence = mechConfidences.length
    ? Math.round(mechConfidences.reduce((a, b) => a + b, 0) / mechConfidences.length)
    : null;

  const overall = computeOverall({
    photoScore: scores.accident_repair_score,
    photoConfidence,
    mechanicalScore: mechanical?.mechanical_score ?? null,
    mechanicalConfidence: mechConfidence,
    history: vehicleHistory,
    salvageTitle,
  });

  // Augment the photo-based summary so it also covers the engine/mechanical
  // module and the vehicle history.
  const summaryParts: string[] = [global.global_summary];
  if (mechanical) {
    summaryParts.push(
      `Engine & mechanical checks scored ${mechanical.mechanical_score}/100 (${MECHANICAL_RISK_COPY[mechanical.risk_level]}). ${mechanical.summary}`,
    );
  }
  if (salvageTitle) {
    summaryParts.push(
      "A purchased VIN history report indicates a salvage or total-loss record — treat this vehicle with strong caution and confirm with a professional.",
    );
  }
  if (vehicleHistory?.matched) {
    summaryParts.push(
      `Vehicle history (NHTSA, model-level): ${vehicleHistory.recall_count} recall(s) and ${vehicleHistory.complaints_count} consumer complaint(s) reported for this make/model/year.`,
    );
  }
  global.global_summary = summaryParts.filter(Boolean).join(" ");

  const report = generateFinalReport({
    vehicle: vehicle as never,
    photos: photoList,
    global,
    globalScore: overall.score,
    engineAudio,
    mechanical,
    vehicleHistory,
    overallConfidence: overall.confidence,
  });

  if (engineAudio) {
    await logActivity(supabase, {
      userId: user.id,
      sessionId,
      action: "engine_audio_added_to_report",
    });
  }
  if (mechanical) {
    await logActivity(supabase, {
      userId: user.id,
      sessionId,
      action: "mechanical_added_to_report",
    });
  }

  const shareToken = randomBytes(16).toString("hex");

  // Upsert the report (one per session for the MVP).
  await supabase
    .from("inspection_reports")
    .delete()
    .eq("inspection_session_id", sessionId);

  const { data: saved, error } = await supabase
    .from("inspection_reports")
    .insert({
      user_id: user.id,
      inspection_session_id: sessionId,
      report_content: report,
      share_token: shareToken,
      is_public: false,
    })
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await supabase
    .from("inspection_sessions")
    .update({
      status: "report_generated",
      final_report: report,
      ai_summary: global.global_summary,
      global_score: overall.score,
      risk_level: scoreToRiskLevel(overall.score),
      recommendation: riskLevelToRecommendation(scoreToRiskLevel(overall.score)),
    })
    .eq("id", sessionId);

  await logActivity(supabase, {
    userId: user.id,
    sessionId,
    action: "report_generated",
    description: `Report ${saved.id} generated`,
  });

  return NextResponse.json({ report: saved, content: report });
}
