import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isInspectionLocked, lockedResponse } from "@/lib/inspection-lock";
import { analyzeEngineAudio, audioModelMime } from "@/lib/ai/engine-audio";
import { mediaFitsInline } from "@/lib/ai/client";
import { rateLimit } from "@/lib/rate-limit";
import { logActivity } from "@/lib/activity";
import { getServerLocale } from "@/lib/i18n-server";

export const runtime = "nodejs";

const BUCKET = process.env.STORAGE_BUCKET_ENGINE_AUDIO || "engine-audio";

// POST /api/inspections/[id]/engine-audio/[checkId]/analyze
export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; checkId: string }> },
) {
  const { id: sessionId, checkId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (await isInspectionLocked(supabase, sessionId)) return lockedResponse();

  const rl = rateLimit(`engine-audio-analyze:${user.id}`, { limit: 10, windowMs: 60_000 });
  if (!rl.allowed) {
    return NextResponse.json(
      { error: `Too many analyses. Try again in ${rl.retryAfterSeconds}s.` },
      { status: 429 },
    );
  }

  const { data: check } = await supabase
    .from("engine_audio_checks")
    .select("*")
    .eq("id", checkId)
    .single();
  if (!check) return NextResponse.json({ error: "Audio check not found." }, { status: 404 });
  if (!check.storage_path) {
    return NextResponse.json({ error: "No uploaded audio to analyze." }, { status: 400 });
  }

  await supabase
    .from("engine_audio_checks")
    .update({ analysis_status: "analyzing" })
    .eq("id", checkId);
  await logActivity(supabase, {
    userId: user.id,
    sessionId,
    action: "engine_audio_analysis_started",
  });

  // Download the file bytes only when the format is model-compatible.
  const ext = check.storage_path.split(".").pop()?.toLowerCase() ?? null;
  const mediaMime = audioModelMime(check.mime_type, ext);
  let audioBase64: string | null = null;
  if (mediaMime) {
    const { data: blob } = await supabase.storage
      .from(BUCKET)
      .download(check.storage_path);
    if (blob) {
      const b64 = Buffer.from(await blob.arrayBuffer()).toString("base64");
      if (mediaFitsInline(b64)) audioBase64 = b64;
    }
  }

  const analysis = await analyzeEngineAudio({
    audioBase64,
    mimeType: audioBase64 ? mediaMime : null,
    durationSeconds: check.duration_seconds ?? 0,
    language: await getServerLocale(),
  });

  const { data: updated, error } = await supabase
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
    .eq("id", checkId)
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await logActivity(supabase, {
    userId: user.id,
    sessionId,
    action: "engine_audio_analysis_completed",
    description: `Engine audio score ${analysis.engine_audio_score} (${analysis.risk_level})`,
  });

  return NextResponse.json({ check: updated, analysis });
}
