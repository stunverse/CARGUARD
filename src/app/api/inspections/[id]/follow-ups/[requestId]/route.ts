import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { analyzeFollowUpPhoto } from "@/lib/ai/functions";
import { rateLimit } from "@/lib/rate-limit";
import { logActivity } from "@/lib/activity";
import { ALLOWED_IMAGE_TYPES, MAX_IMAGE_BYTES } from "@/lib/constants";

const BUCKET =
  process.env.STORAGE_BUCKET_INSPECTION_PHOTOS || "inspection-photos";

// POST — upload + analyze a follow-up close-up photo.
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; requestId: string }> },
) {
  const { id: sessionId, requestId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const rl = rateLimit(`followup:${user.id}`, { limit: 30, windowMs: 60_000 });
  if (!rl.allowed) {
    return NextResponse.json(
      { error: `Too many uploads. Try again in ${rl.retryAfterSeconds}s.` },
      { status: 429 },
    );
  }

  const form = await request.formData();
  const file = form.get("file") as File | null;
  if (!file) return NextResponse.json({ error: "file is required." }, { status: 400 });
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return NextResponse.json({ error: "Unsupported file type." }, { status: 400 });
  }
  if (file.size > MAX_IMAGE_BYTES) {
    return NextResponse.json({ error: "File is too large (max 15MB)." }, { status: 400 });
  }

  const { data: reqRow } = await supabase
    .from("follow_up_photo_requests")
    .select("*")
    .eq("id", requestId)
    .single();
  if (!reqRow) return NextResponse.json({ error: "Request not found." }, { status: 404 });

  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const storagePath = `${user.id}/${sessionId}/followup-${requestId}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  const { error: upErr } = await supabase.storage
    .from(BUCKET)
    .upload(storagePath, buffer, { contentType: file.type, upsert: true });
  if (upErr) return NextResponse.json({ error: upErr.message }, { status: 500 });

  const { data: signed } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(storagePath, 3600);

  const analysis = signed?.signedUrl
    ? await analyzeFollowUpPhoto(signed.signedUrl, reqRow.target_area ?? reqRow.title)
    : null;

  const { data: updated, error } = await supabase
    .from("follow_up_photo_requests")
    .update({
      status: "analyzed",
      image_url: signed?.signedUrl ?? null,
      storage_path: storagePath,
      ai_analysis: analysis,
    })
    .eq("id", requestId)
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await logActivity(supabase, {
    userId: user.id,
    sessionId,
    action: "photo_analyzed",
    description: `Follow-up photo analyzed: ${reqRow.title}`,
  });

  return NextResponse.json({ request: updated, analysis });
}

// PUT — skip a follow-up request.
export async function PUT(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; requestId: string }> },
) {
  const { requestId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { error } = await supabase
    .from("follow_up_photo_requests")
    .update({ status: "skipped" })
    .eq("id", requestId);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
