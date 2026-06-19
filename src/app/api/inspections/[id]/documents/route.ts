import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isInspectionLocked, lockedResponse } from "@/lib/inspection-lock";
import { DOCUMENT_TYPES } from "@/lib/documents";
import { STORAGE_BUCKETS } from "@/lib/constants";
import { rateLimit } from "@/lib/rate-limit";
import { logActivity } from "@/lib/activity";

export const runtime = "nodejs";

const BUCKET = process.env.STORAGE_BUCKET_DOCUMENTS || STORAGE_BUCKETS.documents;
const VALID = new Set(DOCUMENT_TYPES.map((d) => d.code));

// GET — list the doc_types already provided (for resuming the wizard).
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: sessionId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data } = await supabase
    .from("inspection_documents")
    .select("doc_type, image_url")
    .eq("inspection_session_id", sessionId);
  return NextResponse.json({ documents: data ?? [] });
}

// POST — save one document (browser uploads to Storage, sends the path).
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

  const rl = rateLimit(`documents:${user.id}`, { limit: 60, windowMs: 60_000 });
  if (!rl.allowed) {
    return NextResponse.json({ error: "Too many uploads. Try again shortly." }, { status: 429 });
  }

  const body = await request.json().catch(() => ({}));
  const docType = body?.doc_type as string;
  const storagePath = body?.storage_path as string | undefined;
  const mimeType = (body?.mime_type as string) ?? null;
  const fileSize = (body?.file_size as number) ?? null;

  if (!docType || !VALID.has(docType)) {
    return NextResponse.json({ error: "Unknown document type." }, { status: 400 });
  }
  if (!storagePath || !storagePath.startsWith(`${user.id}/`)) {
    return NextResponse.json({ error: "Invalid storage path." }, { status: 403 });
  }

  const { data: session } = await supabase
    .from("inspection_sessions")
    .select("id, vehicle_id")
    .eq("id", sessionId)
    .single();
  if (!session) return NextResponse.json({ error: "Inspection not found." }, { status: 404 });

  const { data: signed } = await supabase.storage.from(BUCKET).createSignedUrl(storagePath, 3600);

  await supabase
    .from("inspection_documents")
    .delete()
    .eq("inspection_session_id", sessionId)
    .eq("doc_type", docType);

  const { data: saved, error } = await supabase
    .from("inspection_documents")
    .insert({
      user_id: user.id,
      inspection_session_id: sessionId,
      doc_type: docType,
      storage_path: storagePath,
      image_url: signed?.signedUrl ?? null,
      mime_type: mimeType,
      file_size: fileSize,
    })
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await logActivity(supabase, {
    userId: user.id,
    sessionId,
    action: "document_uploaded",
    description: docType,
  });

  return NextResponse.json({ document: saved });
}

// DELETE — remove a provided document.
export async function DELETE(
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

  const docType = new URL(request.url).searchParams.get("doc_type");
  if (!docType) return NextResponse.json({ error: "doc_type required" }, { status: 400 });

  await supabase
    .from("inspection_documents")
    .delete()
    .eq("inspection_session_id", sessionId)
    .eq("doc_type", docType);
  return NextResponse.json({ ok: true });
}
