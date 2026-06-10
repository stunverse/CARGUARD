import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  analyzeFullInspection,
  analyzeInspectionPhoto,
  calculateInspectionScores,
  generateFollowUpPhotoRequests,
} from "@/lib/ai/functions";
import { getModelKnowledge } from "@/lib/ai/model-knowledge";
import { rateLimit } from "@/lib/rate-limit";
import { logActivity } from "@/lib/activity";
import type {
  DetectedIssue,
  InspectionPhoto,
  PhotoAnalysisResult,
  Severity,
} from "@/types";

const BUCKET =
  process.env.STORAGE_BUCKET_INSPECTION_PHOTOS || "inspection-photos";

function worstSeverity(issues: DetectedIssue[]): Severity {
  const order: Severity[] = ["none", "low", "moderate", "high", "critical"];
  let worst: Severity = "none";
  for (const i of issues) {
    if (order.indexOf(i.severity) > order.indexOf(worst)) worst = i.severity;
  }
  return worst;
}

// POST /api/inspections/[id]/analyze — analyze all usable photos + aggregate.
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

  // Rate limit: full-inspection analysis is the most expensive AI action.
  const rl = rateLimit(`analyze:${user.id}`, { limit: 10, windowMs: 60_000 });
  if (!rl.allowed) {
    return NextResponse.json(
      { error: `Too many analyses. Try again in ${rl.retryAfterSeconds}s.` },
      { status: 429, headers: { "Retry-After": String(rl.retryAfterSeconds) } },
    );
  }

  const { data: session } = await supabase
    .from("inspection_sessions")
    .select("*, vehicles(*)")
    .eq("id", sessionId)
    .single();
  if (!session) return NextResponse.json({ error: "Inspection not found." }, { status: 404 });

  const { data: photos } = await supabase
    .from("inspection_photos")
    .select("*")
    .eq("inspection_session_id", sessionId);

  const usable = (photos ?? []).filter(
    (p: InspectionPhoto) =>
      p.quality_status === "passed" && p.storage_path,
  ) as InspectionPhoto[];

  if (usable.length === 0) {
    return NextResponse.json(
      { error: "No usable photos to analyze. Please upload and pass quality control first." },
      { status: 400 },
    );
  }

  await supabase
    .from("inspection_sessions")
    .update({ status: "analysis_in_progress" })
    .eq("id", sessionId);

  // Analyze each photo (fresh signed URL).
  const results: PhotoAnalysisResult[] = [];
  for (const photo of usable) {
    const { data: signed } = await supabase.storage
      .from(BUCKET)
      .createSignedUrl(photo.storage_path!, 3600);
    if (!signed?.signedUrl || !photo.photo_point_code) continue;

    const analysis = await analyzeInspectionPhoto(
      signed.signedUrl,
      photo.photo_point_code,
    );
    results.push(analysis);

    await supabase
      .from("inspection_photos")
      .update({
        analysis_status: "completed",
        ai_analysis: analysis,
        detected_issues: analysis.detected_issues,
        severity: worstSeverity(analysis.detected_issues),
        confidence: analysis.confidence,
      })
      .eq("id", photo.id);

    await logActivity(supabase, {
      userId: user.id,
      sessionId,
      action: "photo_analyzed",
      description: `${photo.photo_point_code} analyzed`,
    });
  }

  // Global analysis + scores, enriched with model knowledge when available.
  const vehicle = (session as { vehicles?: unknown }).vehicles ?? {};
  const knowledge = await getModelKnowledge(supabase, vehicle as never);
  const global = await analyzeFullInspection(vehicle as never, results);
  const scores = calculateInspectionScores(results, knowledge.model_risk_score);

  // Merge model-specific vigilance points and seller questions.
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

  // Persist follow-up photo requests.
  const followUps = generateFollowUpPhotoRequests(results);
  if (followUps.length) {
    await supabase.from("follow_up_photo_requests").insert(
      followUps.map((f) => ({
        user_id: user.id,
        inspection_session_id: sessionId,
        title: f.title,
        instruction: f.instruction,
        reason: f.reason,
        target_area: f.target_area,
        status: "requested",
      })),
    );
    await logActivity(supabase, {
      userId: user.id,
      sessionId,
      action: "follow_up_photo_requested",
      description: `${followUps.length} follow-up photo(s) suggested`,
    });
  }

  await supabase
    .from("inspection_sessions")
    .update({
      status: "analysis_completed",
      global_score: scores.global_score,
      accident_repair_score: global.accident_repair_score,
      alignment_score: global.alignment_score,
      paint_tone_score: global.paint_tone_score,
      symmetry_score: global.symmetry_score,
      bumpers_lights_score: global.bumpers_lights_score,
      overall_consistency_score: global.overall_consistency_score,
      model_risk_score: global.model_risk_score,
      recommendation: global.recommendation,
      risk_level: global.risk_level,
      ai_summary: global.global_summary,
      final_report: null,
    })
    .eq("id", sessionId);

  await logActivity(supabase, {
    userId: user.id,
    sessionId,
    action: "global_analysis_completed",
    description: `Risk: ${global.risk_level}, score ${scores.global_score}`,
  });

  return NextResponse.json({ global, scores, followUps: followUps.length });
}
