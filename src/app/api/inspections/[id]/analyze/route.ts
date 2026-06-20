import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isInspectionLocked, lockedResponse } from "@/lib/inspection-lock";
import {
  analyzeFullInspection,
  analyzeInspectionPhoto,
  calculateInspectionScores,
  generateFollowUpPhotoRequests,
} from "@/lib/ai/functions";
import {
  analyzeMechanicalVideo,
  aggregateMechanical,
  buildMechanicalItemAnalysis,
} from "@/lib/ai/mechanical";
import { analyzeEngineAudio, audioModelMime } from "@/lib/ai/engine-audio";
import { getModelKnowledge } from "@/lib/ai/model-knowledge";
import { isAIConfigured, mediaWithinLimit } from "@/lib/ai/client";
import { isStripeConfigured } from "@/lib/billing";
import { rateLimit } from "@/lib/rate-limit";
import { logActivity } from "@/lib/activity";
import { getServerLocale } from "@/lib/i18n-server";
import { STORAGE_BUCKETS } from "@/lib/constants";
import type {
  DetectedIssue,
  InspectionPhoto,
  MechanicalCheckItem,
  PhotoAnalysisResult,
  Severity,
} from "@/types";

export const runtime = "nodejs";
// Heavy step: deep photo analysis + deferred video analysis run here (in
// parallel). Give the function a generous budget so it never times out.
export const maxDuration = 300;

const BUCKET =
  process.env.STORAGE_BUCKET_INSPECTION_PHOTOS || "inspection-photos";
const MECH_BUCKET = process.env.STORAGE_BUCKET_MECHANICAL || STORAGE_BUCKETS.mechanical;
const AUDIO_BUCKET = process.env.STORAGE_BUCKET_ENGINE_AUDIO || STORAGE_BUCKETS.engineAudio;

// Run the deferred engine-sound analysis (Gemini) captured during the wizard.
// Kept out of the per-step flow so recording the engine sound is instant.
async function processDeferredEngineAudio(
  supabase: Awaited<ReturnType<typeof createClient>>,
  sessionId: string,
  language: string,
) {
  const { data: row } = await supabase
    .from("engine_audio_checks")
    .select("*")
    .eq("inspection_session_id", sessionId)
    .neq("analysis_status", "completed")
    .maybeSingle();
  if (!row?.storage_path) return;

  try {
    const ext = row.storage_path.split(".").pop()?.toLowerCase() ?? null;
    const mime = audioModelMime(row.mime_type, ext);
    let audioBase64: string | null = null;
    if (mime) {
      const { data: blob } = await supabase.storage.from(AUDIO_BUCKET).download(row.storage_path);
      if (blob) {
        const b64 = Buffer.from(await blob.arrayBuffer()).toString("base64");
        if (mediaWithinLimit(b64)) audioBase64 = b64;
      }
    }
    const analysis = await analyzeEngineAudio({
      audioBase64,
      mimeType: audioBase64 ? mime : null,
      durationSeconds: row.duration_seconds ?? 0,
      language,
    });
    await supabase
      .from("engine_audio_checks")
      .update({
        analysis_status: "completed",
        engine_audio_score: analysis.engine_audio_score,
        startup_quality_score: analysis.startup_quality_score,
        idle_stability_score: analysis.idle_stability_score,
        mechanical_noise_score: analysis.mechanical_noise_score,
        belt_chain_noise_score: analysis.belt_chain_noise_score,
        exhaust_noise_score: analysis.exhaust_noise_score,
        confidence_score: analysis.confidence_score,
        risk_level: analysis.risk_level,
        recommendation: analysis.recommendation,
        ai_analysis: analysis,
        detected_sounds: analysis.detected_sounds,
        seller_questions: analysis.seller_questions,
        mechanic_questions: analysis.mechanic_questions,
      })
      .eq("id", row.id);
  } catch (err) {
    console.error("Deferred engine-audio analysis failed:", err);
  }
}

// Run the deferred Gemini analysis for any video mechanical checks captured
// during the wizard (kept out of the per-step flow to keep it snappy), then
// re-aggregate the session's mechanical score.
async function processDeferredMechanicalVideos(
  supabase: Awaited<ReturnType<typeof createClient>>,
  sessionId: string,
  language: string,
) {
  const { data: rows } = await supabase
    .from("mechanical_checks")
    .select("*")
    .eq("inspection_session_id", sessionId)
    .eq("media_type", "video")
    .eq("analysis_status", "pending");
  const pending = (rows ?? []) as MechanicalCheckItem[];
  if (pending.length === 0) return;

  await Promise.all(
    pending.map(async (item) => {
      try {
        const path = item.video_storage_path;
        if (!path) return;
        const ext = path.split(".").pop()?.toLowerCase() ?? null;
        const mime = audioModelMime(null, ext);
        if (!mime) return;
        const { data: blob } = await supabase.storage.from(MECH_BUCKET).download(path);
        if (!blob) return;
        const b64 = Buffer.from(await blob.arrayBuffer()).toString("base64");
        if (!mediaWithinLimit(b64)) return;

        const ai = await analyzeMechanicalVideo(b64, mime, item.point_code, language);
        const analysis = buildMechanicalItemAnalysis(
          item.point_code,
          (item.observations as Record<string, boolean> | null) ?? null,
          ai,
          { locale: language, analyzed: true },
        );
        await supabase
          .from("mechanical_checks")
          .update({
            analysis_status: "completed",
            ai_analysis: analysis,
            detected_issues: analysis.detected_issues,
            score: analysis.score,
            severity: analysis.severity,
            confidence: analysis.confidence,
          })
          .eq("id", item.id);
      } catch (err) {
        console.error("Deferred mechanical video analysis failed:", err);
      }
    }),
  );

  // Re-aggregate the session mechanical score from the enriched items.
  const { data: items } = await supabase
    .from("mechanical_checks")
    .select("*")
    .eq("inspection_session_id", sessionId);
  const section = aggregateMechanical((items ?? []) as MechanicalCheckItem[]);
  await supabase
    .from("inspection_sessions")
    .update({
      mechanical_score: section?.mechanical_score ?? null,
      mechanical_risk_level: section?.risk_level ?? null,
      mechanical_recommendation: section?.recommendation ?? null,
    })
    .eq("id", sessionId);
}

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

  if (await isInspectionLocked(supabase, sessionId)) return lockedResponse();

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

  // Pay-per-inspection gate. In demo mode (no Stripe) nothing to enforce;
  // when payments are live, the inspection must be paid before any AI runs.
  if (isStripeConfigured() && session.payment_status !== "paid") {
    return NextResponse.json(
      { error: "This inspection hasn't been paid for yet.", code: "payment_required" },
      { status: 402 },
    );
  }
  // Never run a paid analysis on the deterministic demo engine.
  if (isStripeConfigured() && !isAIConfigured()) {
    return NextResponse.json(
      { error: "AI analysis is temporarily unavailable. Please try again later.", code: "ai_unavailable" },
      { status: 503 },
    );
  }

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

  const language = await getServerLocale();

  await supabase
    .from("inspection_sessions")
    .update({ status: "analysis_in_progress" })
    .eq("id", sessionId);

  // Analyze all photos IN PARALLEL (fresh signed URL each), plus the deferred
  // mechanical videos — concurrently — so the report screen isn't a long
  // sequential wait.
  const photoResultsRaw = await Promise.all(
    usable.map(async (photo) => {
      const { data: signed } = await supabase.storage
        .from(BUCKET)
        .createSignedUrl(photo.storage_path!, 3600);
      if (!signed?.signedUrl || !photo.photo_point_code) return null;

      const analysis = await analyzeInspectionPhoto(
        signed.signedUrl,
        photo.photo_point_code,
        language,
      );

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

      return analysis;
    }),
  );
  const results: PhotoAnalysisResult[] = photoResultsRaw.filter(
    (r): r is PhotoAnalysisResult => r !== null,
  );

  // Enrich the deferred media analyses (mechanical videos + engine sound) now,
  // concurrently — this is the "generating report" wait.
  await Promise.all([
    processDeferredMechanicalVideos(supabase, sessionId, language),
    processDeferredEngineAudio(supabase, sessionId, language),
  ]);

  // Global analysis + scores, enriched with model knowledge when available.
  const vehicle = (session as { vehicles?: unknown }).vehicles ?? {};
  const knowledge = await getModelKnowledge(supabase, vehicle as never);
  const global = await analyzeFullInspection(vehicle as never, results, language);
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
