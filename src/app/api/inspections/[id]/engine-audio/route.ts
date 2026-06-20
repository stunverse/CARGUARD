import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isInspectionLocked, lockedResponse } from "@/lib/inspection-lock";
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

  if (await isInspectionLocked(supabase, sessionId)) return lockedResponse();

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

  // Keep the upload INSTANT: no AI here. The full engine-sound analysis (Gemini)
  // is deferred to the final /analyze step, like photos and mechanical videos.
  // We only do a free, deterministic length check for an early retake hint.
  const tooShort = durationSeconds > 0 && durationSeconds < 8;
  const qualityStatus = tooShort ? "needs_retake" : "passed";

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
      duration_seconds: durationSeconds || null,
      file_url: signed?.signedUrl ?? null,
      storage_path: storagePath,
      upload_status: "uploaded",
      quality_status: qualityStatus,
      // Analysis is deferred to /analyze.
      analysis_status: "pending",
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

  return NextResponse.json({ check: saved, qualityStatus });
}
