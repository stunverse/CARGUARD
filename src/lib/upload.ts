"use client";

// Client-side upload helpers. Files go DIRECTLY to Supabase Storage from
// the browser (RLS allows each user to write under their own {user_id}/…
// prefix), which bypasses the serverless request-body size limit. The
// server is then called with the storage path only.

import { createClient } from "@/lib/supabase/client";

export async function getUserId(): Promise<string | null> {
  const supabase = createClient();
  const { data } = await supabase.auth.getUser();
  return data.user?.id ?? null;
}

// Resize/compress an image to keep uploads small (and AI cheaper/faster).
// Non-images and undecodable formats are returned unchanged.
export async function compressImage(
  file: File,
  maxDim = 1600,
  quality = 0.82,
): Promise<File> {
  if (!file.type.startsWith("image/")) return file;
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, maxDim / Math.max(bitmap.width, bitmap.height));
    const w = Math.max(1, Math.round(bitmap.width * scale));
    const h = Math.max(1, Math.round(bitmap.height * scale));
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.drawImage(bitmap, 0, 0, w, h);
    const blob: Blob | null = await new Promise((res) =>
      canvas.toBlob((b) => res(b), "image/jpeg", quality),
    );
    if (!blob) return file;
    return new File([blob], file.name.replace(/\.\w+$/, "") + ".jpg", { type: "image/jpeg" });
  } catch {
    return file; // e.g. HEIC the browser can't decode — upload as-is.
  }
}

// Extract still frames from a captured video so the vision model can analyze
// it (OpenAI vision takes images, not video). Runs entirely in the browser
// via <video> + <canvas>. Samples `count` frames evenly across the clip.
// Returns [] on any failure so the caller can still save the video.
export async function extractVideoFrames(file: File, count = 3): Promise<File[]> {
  if (!file.type.startsWith("video/")) return [];
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const video = document.createElement("video");
    video.preload = "auto";
    video.muted = true;
    video.playsInline = true;
    video.src = url;

    const done = (frames: File[]) => {
      URL.revokeObjectURL(url);
      resolve(frames);
    };

    const seek = (t: number) =>
      new Promise<void>((res) => {
        const onSeeked = () => {
          video.removeEventListener("seeked", onSeeked);
          res();
        };
        video.addEventListener("seeked", onSeeked);
        video.currentTime = t;
      });

    video.onloadedmetadata = async () => {
      const duration = video.duration;
      if (!duration || !isFinite(duration) || !video.videoWidth) return done([]);
      try {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) return done([]);
        const frames: File[] = [];
        for (let i = 1; i <= count; i++) {
          await seek((duration * i) / (count + 1));
          const scale = Math.min(1, 1280 / Math.max(video.videoWidth, video.videoHeight));
          canvas.width = Math.max(1, Math.round(video.videoWidth * scale));
          canvas.height = Math.max(1, Math.round(video.videoHeight * scale));
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const blob: Blob | null = await new Promise((res) =>
            canvas.toBlob((b) => res(b), "image/jpeg", 0.8),
          );
          if (blob) frames.push(new File([blob], `frame-${i}.jpg`, { type: "image/jpeg" }));
        }
        done(frames);
      } catch {
        done([]);
      }
    };
    video.onerror = () => done([]);
  });
}

export function fileExt(file: File): string {
  if (file.type.startsWith("image/")) return "jpg";
  const fromName = file.name.split(".").pop()?.toLowerCase();
  if (fromName && fromName.length <= 5) return fromName;
  if (file.type.includes("webm")) return "webm";
  if (file.type.includes("mp4")) return "mp4";
  if (file.type.includes("quicktime")) return "mov";
  if (file.type.includes("pdf")) return "pdf";
  return "bin";
}

// Upload a file to a bucket at the given path (overwrites). Throws on error.
export async function uploadToStorage(bucket: string, path: string, file: File): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.storage
    .from(bucket)
    .upload(path, file, { upsert: true, contentType: file.type || undefined });
  if (error) throw new Error(error.message);
}
