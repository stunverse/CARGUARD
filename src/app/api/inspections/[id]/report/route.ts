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
import { buildVehicleSpecs } from "@/lib/vehicle-specs";
import { assessMileage } from "@/lib/mileage-check";
import { getSafetyRating } from "@/lib/safety-rating";
import { deriveTitleFlags } from "@/lib/title-flags";
import { fetchEuTitleFlags } from "@/lib/providers/eu-history";
import { estimateMarketValue } from "@/lib/market-value";
import { buildDocumentsSection, documentsRatio, isUsCountry } from "@/lib/documents";
import { isVehicleDbConfigured, vdbMarketValue } from "@/lib/providers/vehicle-databases";
import { computeOverall } from "@/lib/score";
import { isAIConfigured } from "@/lib/ai/client";
import { isStripeConfigured } from "@/lib/billing";
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

  // Pay-per-inspection gate (no-op in demo mode without Stripe).
  if (isStripeConfigured() && session.payment_status !== "paid") {
    return NextResponse.json(
      { error: "This inspection hasn't been paid for yet.", code: "payment_required" },
      { status: 402 },
    );
  }
  // Don't sell a report produced by the deterministic demo engine.
  if (isStripeConfigured() && !isAIConfigured()) {
    return NextResponse.json(
      { error: "AI is temporarily unavailable — your report can't be generated right now.", code: "ai_unavailable" },
      { status: 503 },
    );
  }

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

  // Confirmed salvage / total-loss + odometer records from a purchased per-VIN
  // report (if any).
  let salvageTitle = false;
  let odometerReadings: { date?: string | null; mileage?: number | null }[] = [];
  let titleFlags = null as Awaited<ReturnType<typeof deriveTitleFlags>>;
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
        const vrData = (vr?.data ?? null) as
          | (Partial<import("@/types").VinHistoryReport> & {
              odometer_readings?: { date?: string; mileage?: string }[];
            })
          | null;
        salvageTitle = Boolean(vrData?.salvage_or_total_loss);
        odometerReadings = (vrData?.odometer_readings ?? []).map((o) => ({
          date: o.date ?? null,
          mileage: o.mileage != null ? Number(String(o.mileage).replace(/[^\d]/g, "")) : null,
        }));
        titleFlags = deriveTitleFlags(vrData);
      }
    } catch (e) {
      console.error("salvage lookup skipped:", e);
    }
  }

  // No US title record? Try an EU history provider (no-op until configured).
  if (!titleFlags) {
    titleFlags = await fetchEuTitleFlags({
      vin: v.vin ?? null,
      country: (vehicle as { country?: string }).country ?? null,
    });
  }

  // Specifications & equipment (VIN decode + provided data) — US + EU.
  const specifications = await buildVehicleSpecs(vehicle as never, v.vin);

  // Mileage consistency / odometer-rollback heuristic — US + EU.
  const veh = vehicle as { year?: number; mileage?: number; currency?: string; country?: string };
  const mileageCheck = assessMileage({
    mileage: veh.mileage ?? null,
    year: veh.year ?? null,
    currency: veh.currency ?? null,
    odometerReadings,
  });

  // Safety rating — NHTSA NCAP (US) now; EU provider later. Best-effort.
  const safety = await getSafetyRating({
    year: v.year ?? null,
    make: v.make ?? null,
    model: v.model ?? null,
    country: veh.country ?? null,
  });

  // Market value: heuristic everywhere; real provider value for US vehicles.
  const askingPrice = (vehicle as { asking_price?: number }).asking_price ?? null;
  let marketValue = estimateMarketValue({
    askingPrice,
    mileage: veh.mileage ?? null,
    year: veh.year ?? null,
    currency: veh.currency ?? null,
  });
  if (
    isVehicleDbConfigured() &&
    v.vin &&
    (isUsCountry(veh.country) || (veh.currency ?? "").toUpperCase() === "USD")
  ) {
    const real = await vdbMarketValue({ vin: v.vin, mileage: veh.mileage ?? null, askingPrice });
    if (real) marketValue = real;
  }

  // Supporting documents the buyer photographed (maintenance, registration…).
  const { data: docRows } = await supabase
    .from("inspection_documents")
    .select("doc_type")
    .eq("inspection_session_id", sessionId);
  const documents = buildDocumentsSection(
    (docRows ?? []).map((d) => d.doc_type as string),
    veh.country ?? null,
  );
  const docRatio = documentsRatio(documents);

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
    documentsRatio: docRatio,
    documentsProvided: documents?.provided_count ?? 0,
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
  if (documents) {
    summaryParts.push(
      documents.provided_count > 0
        ? `Supporting documents: ${documents.provided_count}/${documents.relevant_count} provided (${documents.key_provided}/${documents.key_total} key documents), which strengthens confidence in this assessment.`
        : "No supporting documents (maintenance records, registration, etc.) were provided — confidence is limited accordingly.",
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
    specifications,
    mileageCheck,
    safety,
    titleFlags,
    marketValue,
    documents,
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
