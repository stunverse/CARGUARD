import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isInspectionLocked, lockedResponse } from "@/lib/inspection-lock";
import { rateLimit } from "@/lib/rate-limit";
import { logActivity } from "@/lib/activity";
import { PHOTO_POINTS, STORAGE_BUCKETS } from "@/lib/constants";
import type { PhotoPointCode } from "@/types";

export const runtime = "nodejs";

const BUCKET = process.env.STORAGE_BUCKET_INSPECTION_PHOTOS || STORAGE_BUCKETS.inspectionPhotos;

// POST /api/inspections/[id]/photos
// The browser uploads the (compressed) photo directly to Storage, then
// calls this with the storage path. We sign it, quality-check, store the row.
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

  const rl = rateLimit(`photo:${user.id}`, { limit: 60, windowMs: 60_000 });
  if (!rl.allowed) {
    return NextResponse.json(
      { error: `Too many uploads. Try again in ${rl.retryAfterSeconds}s.` },
      { status: 429 },
    );
  }

  const body = await request.json().catch(() => null);
  const code = body?.photo_point_code as PhotoPointCode | undefined;
  const storagePath = body?.storage_path as string | undefined;

  if (!code || !storagePath) {
    return NextResponse.json({ error: "photo_point_code and storage_path are required." }, { status: 400 });
  }
  if (!PHOTO_POINTS.some((p) => p.code === code)) {
    return NextResponse.json({ error: "Invalid photo_point_code." }, { status: 400 });
  }
  if (!storagePath.startsWith(`${user.id}/`)) {
    return NextResponse.json({ error: "Invalid storage path." }, { status: 403 });
  }

  const { data: session } = await supabase
    .from("inspection_sessions")
    .select("id")
    .eq("id", sessionId)
    .single();
  if (!session) return NextResponse.json({ error: "Inspection not found." }, { status: 404 });

  const { data: signed } = await supabase.storage.from(BUCKET).createSignedUrl(storagePath, 3600);
  const imageUrl = signed?.signedUrl ?? null;

  // No per-step AI here — keep capture INSTANT. The photo is accepted on upload
  // and the full vision analysis (which also judges usability) runs in the final
  // /analyze step, like videos and engine sound.
  const qualityStatus = "passed";

  const point = PHOTO_POINTS.find((p) => p.code === code)!;
  const { data: pointRow } = await supabase
    .from("inspection_photo_points")
    .select("id")
    .eq("code", code)
    .single();

  await supabase
    .from("inspection_photos")
    .delete()
    .eq("inspection_session_id", sessionId)
    .eq("photo_point_code", code);

  const { data: photo, error: insErr } = await supabase
    .from("inspection_photos")
    .insert({
      user_id: user.id,
      inspection_session_id: sessionId,
      photo_point_id: pointRow?.id ?? null,
      photo_point_code: code,
      image_url: imageUrl,
      storage_path: storagePath,
      original_file_name: body?.original_file_name ?? null,
      mime_type: body?.mime_type ?? null,
      file_size: body?.file_size ?? null,
      upload_status: "uploaded",
      quality_status: qualityStatus,
      quality_feedback: null,
      ai_quality_check: null,
    })
    .select()
    .single();

  if (insErr) return NextResponse.json({ error: insErr.message }, { status: 500 });

  await logActivity(supabase, {
    userId: user.id,
    sessionId,
    action: "photo_quality_checked",
    description: `${point.title}: ${qualityStatus}`,
    metadata: { code, qualityStatus },
  });

  return NextResponse.json({ photo, imageUrl });
}

// PUT — mark a photo point as skipped.
export async function PUT(
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

  const { photo_point_code: code } = await request.json();
  if (!PHOTO_POINTS.some((p) => p.code === code)) {
    return NextResponse.json({ error: "Invalid photo_point_code." }, { status: 400 });
  }

  await supabase
    .from("inspection_photos")
    .delete()
    .eq("inspection_session_id", sessionId)
    .eq("photo_point_code", code);

  const { data: photo, error } = await supabase
    .from("inspection_photos")
    .insert({
      user_id: user.id,
      inspection_session_id: sessionId,
      photo_point_code: code,
      upload_status: "pending",
      quality_status: "skipped",
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ photo });
}
