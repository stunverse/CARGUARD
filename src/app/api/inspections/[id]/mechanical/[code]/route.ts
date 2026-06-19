import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isInspectionLocked, lockedResponse } from "@/lib/inspection-lock";
import {
  analyzeMechanicalPhoto,
  analyzeMechanicalVideo,
  aggregateMechanical,
  buildMechanicalItemAnalysis,
} from "@/lib/ai/mechanical";
import { audioModelMime } from "@/lib/ai/engine-audio";
import { mediaFitsInline } from "@/lib/ai/client";
import { MECHANICAL_POINTS } from "@/lib/mechanical";
import { rateLimit } from "@/lib/rate-limit";
import { logActivity } from "@/lib/activity";
import { STORAGE_BUCKETS } from "@/lib/constants";
import { getServerLocale } from "@/lib/i18n-server";
import type { MechanicalCheckItem, MechanicalPointCode } from "@/types";

export const runtime = "nodejs";

const BUCKET = process.env.STORAGE_BUCKET_MECHANICAL || STORAGE_BUCKETS.mechanical;

async function signed(
  supabase: Awaited<ReturnType<typeof createClient>>,
  path: string,
): Promise<string | null> {
  const { data } = await supabase.storage.from(BUCKET).createSignedUrl(path, 3600);
  return data?.signedUrl ?? null;
}

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

// POST — save one mechanical item. The browser uploads media directly to
// Storage and sends the path(s) here.
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
    return NextResponse.json({ error: "Too many uploads. Try again shortly." }, { status: 429 });
  }

  const { data: session } = await supabase
    .from("inspection_sessions")
    .select("id, vehicle_id")
    .eq("id", sessionId)
    .single();
  if (!session) return NextResponse.json({ error: "Inspection not found." }, { status: 404 });
  if (await isInspectionLocked(supabase, sessionId)) return lockedResponse();

  const body = await request.json().catch(() => ({}));
  const observations = (body?.observations ?? {}) as Record<string, boolean>;
  const primaryPath = body?.primary_path as string | undefined;
  const secondaryPath = body?.secondary_path as string | undefined;
  const docPaths = (body?.doc_paths ?? []) as string[];
  const framePaths = (body?.frame_paths ?? []) as string[];
  const primaryMime = (body?.primary_mime as string) ?? "";

  const own = (p?: string) => !p || p.startsWith(`${user.id}/`);
  if (!own(primaryPath) || !own(secondaryPath) || !docPaths.every(own) || !framePaths.every(own)) {
    return NextResponse.json({ error: "Invalid storage path." }, { status: 403 });
  }

  const isPhoto = point.media_type === "photo" || point.media_type === "photo_pair";
  const isVideo = point.media_type === "video";

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

  const imageUrlsForAi: string[] = [];
  if (primaryPath) {
    const url = await signed(supabase, primaryPath);
    if (isVideo) {
      update.video_url = url;
      update.video_storage_path = primaryPath;
    } else {
      update.image_url = url;
      update.storage_path = primaryPath;
      if (isPhoto && url) imageUrlsForAi.push(url);
    }
  }
  if (secondaryPath) {
    const url = await signed(supabase, secondaryPath);
    update.image_url_2 = url;
    update.storage_path_2 = secondaryPath;
    if (isPhoto && url) imageUrlsForAi.push(url);
  }
  if (docPaths.length) {
    const urls: string[] = [];
    for (const p of docPaths) {
      const u = await signed(supabase, p);
      if (u) urls.push(u);
    }
    update.doc_urls = urls;
  }

  const locale = await getServerLocale();

  // AI pass: full video (images + soundtrack) → Gemini; photos → Claude vision.
  let ai = null;
  let analyzed = false;
  if (isVideo && primaryPath) {
    const ext = primaryPath.split(".").pop()?.toLowerCase() ?? null;
    const videoMime = audioModelMime(primaryMime, ext);
    if (videoMime) {
      const { data: blob } = await supabase.storage.from(BUCKET).download(primaryPath);
      if (blob) {
        const b64 = Buffer.from(await blob.arrayBuffer()).toString("base64");
        if (mediaFitsInline(b64)) {
          ai = await analyzeMechanicalVideo(b64, videoMime, code as MechanicalPointCode, locale);
          analyzed = true;
        }
      }
    }
  } else if (imageUrlsForAi.length) {
    ai = await analyzeMechanicalPhoto(imageUrlsForAi, code as MechanicalPointCode, locale);
    analyzed = true;
  }

  const analysis = buildMechanicalItemAnalysis(code as MechanicalPointCode, observations, ai, {
    locale,
    analyzed,
  });
  update.ai_analysis = analysis;
  update.detected_issues = analysis.detected_issues;
  update.score = analysis.score;
  update.severity = analysis.severity;
  update.confidence = analysis.confidence;

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

// PUT — skip a mechanical item.
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

  if (await isInspectionLocked(supabase, sessionId)) return lockedResponse();

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
