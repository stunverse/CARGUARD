import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { checkEngineAudioQuality, audioModelFormat } from "@/lib/ai/engine-audio";
import { rateLimit } from "@/lib/rate-limit";
import { logActivity } from "@/lib/activity";
import { STORAGE_BUCKETS } from "@/lib/constants";

export const runtime = "nodejs";

const BUCKET = process.env.STORAGE_BUCKET_ENGINE_AUDIO || STORAGE_BUCKETS.engineAudio;

// POST — the browser uploads the recording directly to Storage and sends
// the path; we sign it, quality-check, and store the row (one per session).
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: sessionId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const rl = rateLimit(`engine-audio:${user.id}`, { limit: 15, windowMs: 60_000 });
  if (!rl.allowed) {
    return NextResponse.json({ error: "Too many uploads. Try again shortly." }, { status: 429 });
  }

  const body = await request.json().catch(() => ({}));
  const storagePath = body?.storage_path as string | undefined;
  const mimeType = (body?.mime_type as string) ?? "";
  const fileType = (body?.file_type as string) ?? "audio";
  const durationSeconds = Number(body?.duration_seconds ?? 0) || 0;
  if (!storagePath || !storagePath.startsWith(`${user.id}/`)) {
    return NextResponse.json({ error: "Invalid storage path." }, { status: 400 });
  }

  const { data: session } = await supabase
    .from("inspection_sessions")
    .select("id, vehicle_id")
    .eq("id", sessionId)
    .single();
  if (!session) return NextResponse.json({ error: "Inspection not found." }, { status: 404 });

  const { data: signed } = await supabase.storage.from(BUCKET).createSignedUrl(storagePath, 3600);

  // Quality check: only for model-compatible formats (download bytes server-side).
  const ext = storagePath.split(".").pop()?.toLowerCase() ?? null;
  const fmt = audioModelFormat(mimeType, ext);
  let audioBase64: string | null = null;
  if (fmt) {
    const { data: blob } = await supabase.storage.from(BUCKET).download(storagePath);
    if (blob) audioBase64 = Buffer.from(await blob.arrayBuffer()).toString("base64");
  }
  const quality = await checkEngineAudioQuality({ audioBase64, format: fmt, durationSeconds });
  const qualityStatus = quality.is_usable
    ? quality.retake_required
      ? "needs_retake"
      : "passed"
    : "needs_retake";

  // One engine-audio per session.
  await supabase.from("engine_audio_checks").delete().eq("inspection_session_id", sessionId);

  const { data: saved, error } = await supabase
    .from("engine_audio_checks")
    .insert({
      user_id: user.id,
      inspection_session_id: sessionId,
      vehicle_id: session.vehicle_id,
      original_file_name: body?.original_file_name ?? null,
      file_type: fileType,
      mime_type: mimeType,
      duration_seconds: quality.duration_seconds || durationSeconds || null,
      file_url: signed?.signedUrl ?? null,
      storage_path: storagePath,
      upload_status: "uploaded",
      quality_status: qualityStatus,
      audio_quality_score: quality.audio_quality_score,
      ai_quality_check: quality,
    })
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await logActivity(supabase, {
    userId: user.id,
    sessionId,
    action: "engine_audio_uploaded",
    description: `Quality: ${qualityStatus}`,
  });

  return NextResponse.json({ check: saved, quality });
}
