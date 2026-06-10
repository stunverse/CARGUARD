import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { checkEngineAudioQuality, audioModelFormat } from "@/lib/ai/engine-audio";
import { rateLimit } from "@/lib/rate-limit";
import { logActivity } from "@/lib/activity";
import {
  ALLOWED_AUDIO_TYPES,
  ALLOWED_VIDEO_TYPES,
  MAX_AUDIO_BYTES,
  MAX_VIDEO_BYTES,
} from "@/lib/constants";

export const runtime = "nodejs";

const BUCKET = process.env.STORAGE_BUCKET_ENGINE_AUDIO || "engine-audio";

// POST /api/inspections/[id]/engine-audio — upload audio/video + quality check.
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
    return NextResponse.json(
      { error: `Too many uploads. Try again in ${rl.retryAfterSeconds}s.` },
      { status: 429 },
    );
  }

  const form = await request.formData();
  const file = form.get("file") as File | null;
  const durationSeconds = Number(form.get("duration_seconds") ?? 0) || 0;
  if (!file) return NextResponse.json({ error: "file is required." }, { status: 400 });

  const isAudio = ALLOWED_AUDIO_TYPES.includes(file.type);
  const isVideo = ALLOWED_VIDEO_TYPES.includes(file.type);
  if (!isAudio && !isVideo) {
    return NextResponse.json({ error: "Unsupported file type." }, { status: 400 });
  }
  const maxBytes = isVideo ? MAX_VIDEO_BYTES : MAX_AUDIO_BYTES;
  if (file.size > maxBytes) {
    return NextResponse.json(
      { error: `File is too large (max ${isVideo ? "100MB" : "25MB"}).` },
      { status: 400 },
    );
  }

  // Ownership check (RLS also enforces this).
  const { data: session } = await supabase
    .from("inspection_sessions")
    .select("id, vehicle_id")
    .eq("id", sessionId)
    .single();
  if (!session) return NextResponse.json({ error: "Inspection not found." }, { status: 404 });

  const ext = file.name.split(".").pop()?.toLowerCase() || (isVideo ? "mp4" : "mp3");
  const buffer = Buffer.from(await file.arrayBuffer());

  // Create the row first to get a stable id for the storage path.
  const { data: created, error: insErr } = await supabase
    .from("engine_audio_checks")
    .insert({
      user_id: user.id,
      inspection_session_id: sessionId,
      vehicle_id: session.vehicle_id,
      original_file_name: file.name,
      file_type: isVideo ? "video" : "audio",
      mime_type: file.type,
      file_size: file.size,
      duration_seconds: durationSeconds || null,
      upload_status: "pending",
    })
    .select()
    .single();
  if (insErr) return NextResponse.json({ error: insErr.message }, { status: 500 });

  const storagePath = `${user.id}/${sessionId}/${created.id}.${ext}`;
  const { error: upErr } = await supabase.storage
    .from(BUCKET)
    .upload(storagePath, buffer, { contentType: file.type, upsert: true });
  if (upErr) {
    await supabase
      .from("engine_audio_checks")
      .update({ upload_status: "failed" })
      .eq("id", created.id);
    return NextResponse.json({ error: `Upload failed: ${upErr.message}` }, { status: 500 });
  }

  const { data: signed } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(storagePath, 3600);

  await logActivity(supabase, {
    userId: user.id,
    sessionId,
    action: "engine_audio_uploaded",
    description: file.name,
  });

  // Quality check (real only for WAV/MP3; otherwise cautious demo result).
  const fmt = audioModelFormat(file.type, ext);
  const quality = await checkEngineAudioQuality({
    audioBase64: fmt ? buffer.toString("base64") : null,
    format: fmt,
    durationSeconds,
  });
  const qualityStatus = quality.is_usable
    ? quality.retake_required
      ? "needs_retake"
      : "passed"
    : "needs_retake";

  const { data: updated } = await supabase
    .from("engine_audio_checks")
    .update({
      file_url: signed?.signedUrl ?? null,
      storage_path: storagePath,
      upload_status: "uploaded",
      quality_status: qualityStatus,
      audio_quality_score: quality.audio_quality_score,
      ai_quality_check: quality,
      duration_seconds: quality.duration_seconds || durationSeconds || null,
    })
    .eq("id", created.id)
    .select()
    .single();

  await logActivity(supabase, {
    userId: user.id,
    sessionId,
    action: "engine_audio_quality_checked",
    description: `Quality: ${qualityStatus}`,
  });

  return NextResponse.json({ check: updated, quality });
}
