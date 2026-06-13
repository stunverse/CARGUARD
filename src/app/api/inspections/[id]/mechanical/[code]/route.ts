import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  analyzeMechanicalPhoto,
  aggregateMechanical,
  buildMechanicalItemAnalysis,
} from "@/lib/ai/mechanical";
import { MECHANICAL_POINTS } from "@/lib/mechanical";
import { rateLimit } from "@/lib/rate-limit";
import { logActivity } from "@/lib/activity";
import {
  ALLOWED_IMAGE_TYPES,
  ALLOWED_VIDEO_TYPES,
  MAX_IMAGE_BYTES,
  MAX_VIDEO_BYTES,
} from "@/lib/constants";
import type { MechanicalCheckItem, MechanicalPointCode } from "@/types";

export const runtime = "nodejs";

const BUCKET = process.env.STORAGE_BUCKET_MECHANICAL || "mechanical-media";
const DOC_TYPES = [...ALLOWED_IMAGE_TYPES, "application/pdf"];

async function uploadFile(
  supabase: Awaited<ReturnType<typeof createClient>>,
  path: string,
  file: File,
) {
  const buffer = Buffer.from(await file.arrayBuffer());
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, buffer, { contentType: file.type, upsert: true });
  if (error) throw new Error(error.message);
  const { data } = await supabase.storage.from(BUCKET).createSignedUrl(path, 3600);
  return data?.signedUrl ?? null;
}

// Recompute the unified mechanical score on the session.
async function recomputeSession(
  supabase: Awaited<ReturnType<typeof createClient>>,
  sessionId: string,
) {
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

// POST /api/inspections/[id]/mechanical/[code] — save one mechanical item.
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; code: string }> },
) {
  const { id: sessionId, code } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const point = MECHANICAL_POINTS.find((p) => p.code === code);
  if (!point) return NextResponse.json({ error: "Unknown check." }, { status: 400 });

  const rl = rateLimit(`mechanical:${user.id}`, { limit: 60, windowMs: 60_000 });
  if (!rl.allowed) {
    return NextResponse.json(
      { error: `Too many uploads. Try again in ${rl.retryAfterSeconds}s.` },
      { status: 429 },
    );
  }

  const { data: session } = await supabase
    .from("inspection_sessions")
    .select("id, vehicle_id")
    .eq("id", sessionId)
    .single();
  if (!session) return NextResponse.json({ error: "Inspection not found." }, { status: 404 });

  const form = await request.formData();
  const observations = JSON.parse((form.get("observations") as string) || "{}") as Record<string, boolean>;

  const update: Partial<MechanicalCheckItem> & Record<string, unknown> = {
    user_id: user.id,
    inspection_session_id: sessionId,
    vehicle_id: session.vehicle_id,
    point_code: code as MechanicalPointCode,
    media_type: point.media_type,
    observations,
    upload_status: "uploaded",
    quality_status: "passed",
    analysis_status: "completed",
  };

  const ext = (f: File) => f.name.split(".").pop()?.toLowerCase() || "bin";
  const imageUrlsForAi: string[] = [];

  try {
    if (point.media_type === "photo" || point.media_type === "photo_pair") {
      const file = form.get("file") as File | null;
      if (file) {
        if (!ALLOWED_IMAGE_TYPES.includes(file.type)) throw new Error("Unsupported image type.");
        if (file.size > MAX_IMAGE_BYTES) throw new Error("Image too large (max 15MB).");
        const path = `${user.id}/${sessionId}/${code}.${ext(file)}`;
        update.image_url = await uploadFile(supabase, path, file);
        update.storage_path = path;
        if (update.image_url) imageUrlsForAi.push(update.image_url);
      }
      if (point.media_type === "photo_pair") {
        const file2 = form.get("file2") as File | null;
        if (file2) {
          if (!ALLOWED_IMAGE_TYPES.includes(file2.type)) throw new Error("Unsupported image type.");
          const path2 = `${user.id}/${sessionId}/${code}-2.${ext(file2)}`;
          update.image_url_2 = await uploadFile(supabase, path2, file2);
          update.storage_path_2 = path2;
          if (update.image_url_2) imageUrlsForAi.push(update.image_url_2);
        }
      }
    } else if (point.media_type === "video") {
      const file = form.get("file") as File | null;
      if (file) {
        if (!ALLOWED_VIDEO_TYPES.includes(file.type)) throw new Error("Unsupported video type.");
        if (file.size > MAX_VIDEO_BYTES) throw new Error("Video too large (max 100MB).");
        const path = `${user.id}/${sessionId}/${code}-video.${ext(file)}`;
        update.video_url = await uploadFile(supabase, path, file);
        update.video_storage_path = path;
        update.mime_type = file.type;
      }
    } else if (point.media_type === "docs") {
      const files = form.getAll("files") as File[];
      const urls: string[] = [];
      let n = 0;
      for (const f of files) {
        if (!DOC_TYPES.includes(f.type)) continue;
        if (f.size > MAX_IMAGE_BYTES) continue;
        const path = `${user.id}/${sessionId}/${code}-doc${n}.${ext(f)}`;
        const url = await uploadFile(supabase, path, f);
        if (url) urls.push(url);
        n += 1;
      }
      update.doc_urls = urls;
    }
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Upload failed." },
      { status: 400 },
    );
  }

  // AI vision on photos; observation-driven otherwise.
  const ai =
    imageUrlsForAi.length > 0
      ? await analyzeMechanicalPhoto(imageUrlsForAi, code as MechanicalPointCode)
      : null;
  const analysis = buildMechanicalItemAnalysis(code as MechanicalPointCode, observations, ai);
  update.ai_analysis = analysis;
  update.detected_issues = analysis.detected_issues;
  update.score = analysis.score;
  update.severity = analysis.severity;
  update.confidence = analysis.confidence;

  // Upsert by (session, code).
  await supabase
    .from("mechanical_checks")
    .delete()
    .eq("inspection_session_id", sessionId)
    .eq("point_code", code);
  const { data: saved, error } = await supabase
    .from("mechanical_checks")
    .insert(update)
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await recomputeSession(supabase, sessionId);
  await logActivity(supabase, {
    userId: user.id,
    sessionId,
    action: "mechanical_item_saved",
    description: `${point.title}: score ${analysis.score}`,
  });

  return NextResponse.json({ item: saved, analysis });
}

// PUT — skip a mechanical item ("I can't do this check").
export async function PUT(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; code: string }> },
) {
  const { id: sessionId, code } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await supabase
    .from("mechanical_checks")
    .delete()
    .eq("inspection_session_id", sessionId)
    .eq("point_code", code);
  const { data: saved, error } = await supabase
    .from("mechanical_checks")
    .insert({
      user_id: user.id,
      inspection_session_id: sessionId,
      point_code: code,
      quality_status: "skipped",
      analysis_status: "pending",
    })
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await logActivity(supabase, {
    userId: user.id,
    sessionId,
    action: "mechanical_item_skipped",
    description: code,
  });
  return NextResponse.json({ item: saved });
}
