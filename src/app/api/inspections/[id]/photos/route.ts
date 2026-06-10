import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { checkPhotoQuality } from "@/lib/ai/functions";
import { rateLimit } from "@/lib/rate-limit";
import { logActivity } from "@/lib/activity";
import {
  ALLOWED_IMAGE_TYPES,
  MAX_IMAGE_BYTES,
  PHOTO_POINTS,
} from "@/lib/constants";
import type { PhotoPointCode } from "@/types";

const BUCKET =
  process.env.STORAGE_BUCKET_INSPECTION_PHOTOS || "inspection-photos";

// POST /api/inspections/[id]/photos — upload one photo + run quality check.
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

  // Rate limit photo uploads (each runs an AI quality check).
  const rl = rateLimit(`photo:${user.id}`, { limit: 40, windowMs: 60_000 });
  if (!rl.allowed) {
    return NextResponse.json(
      { error: `Too many uploads. Try again in ${rl.retryAfterSeconds}s.` },
      { status: 429, headers: { "Retry-After": String(rl.retryAfterSeconds) } },
    );
  }

  const form = await request.formData();
  const file = form.get("file") as File | null;
  const code = form.get("photo_point_code") as PhotoPointCode | null;

  if (!file || !code) {
    return NextResponse.json({ error: "file and photo_point_code are required." }, { status: 400 });
  }
  if (!PHOTO_POINTS.some((p) => p.code === code)) {
    return NextResponse.json({ error: "Invalid photo_point_code." }, { status: 400 });
  }
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return NextResponse.json({ error: "Unsupported file type." }, { status: 400 });
  }
  if (file.size > MAX_IMAGE_BYTES) {
    return NextResponse.json({ error: "File is too large (max 15MB)." }, { status: 400 });
  }

  // Ownership check (RLS would block anyway, but fail fast with a clear error).
  const { data: session } = await supabase
    .from("inspection_sessions")
    .select("id, user_id")
    .eq("id", sessionId)
    .single();
  if (!session) return NextResponse.json({ error: "Inspection not found." }, { status: 404 });

  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const storagePath = `${user.id}/${sessionId}/${code}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  const { error: upErr } = await supabase.storage
    .from(BUCKET)
    .upload(storagePath, buffer, { contentType: file.type, upsert: true });
  if (upErr) {
    return NextResponse.json(
      { error: `Upload failed: ${upErr.message}` },
      { status: 500 },
    );
  }

  // Signed URL for the AI to read (1 hour).
  const { data: signed } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(storagePath, 3600);
  const imageUrl = signed?.signedUrl ?? null;

  // Quality control.
  const quality = imageUrl
    ? await checkPhotoQuality(imageUrl, code)
    : null;
  const qualityStatus = quality
    ? quality.is_usable && quality.matches_requested_angle
      ? "passed"
      : "needs_retake"
    : "pending";

  const point = PHOTO_POINTS.find((p) => p.code === code)!;
  const { data: pointRow } = await supabase
    .from("inspection_photo_points")
    .select("id")
    .eq("code", code)
    .single();

  // Upsert by (session, code): delete then insert keeps it simple.
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
      original_file_name: file.name,
      mime_type: file.type,
      file_size: file.size,
      upload_status: "uploaded",
      quality_status: qualityStatus,
      quality_feedback: quality?.retake_instructions || null,
      ai_quality_check: quality,
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

  return NextResponse.json({ photo, quality, imageUrl });
}

// PUT /api/inspections/[id]/photos — mark a photo point as skipped
// ("I can't take this photo"). Skipped photos reduce analysis coverage.
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
