"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Camera,
  CircleStop,
  Mic,
  Upload,
  Video,
  X,
  Zap,
  ZapOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/components/i18n-provider";

export type CaptureMode = "photo" | "video" | "audio";

// Non-standard camera capabilities (focus/zoom/torch) aren't in the TS DOM
// lib, so we type them loosely and feature-detect at runtime.
interface CamCaps {
  zoom?: { min: number; max: number; step: number };
  torch?: boolean;
  focusMode?: string[];
  pointsOfInterest?: boolean;
}

function applyAdvanced(track: MediaStreamTrack, set: Record<string, unknown>) {
  return track
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .applyConstraints({ advanced: [set] } as any)
    .catch(() => {});
}

export function MediaCapture({
  mode,
  title,
  onCapture,
  onClose,
}: {
  mode: CaptureMode;
  title: string;
  onCapture: (file: File) => void;
  onClose: () => void;
}) {
  const { t } = useI18n();
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  const [ready, setReady] = useState(false);
  const [recording, setRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const [caps, setCaps] = useState<CamCaps>({});
  const [zoom, setZoom] = useState<number | null>(null);
  const [torch, setTorch] = useState(false);
  const [focusRing, setFocusRing] = useState<{ x: number; y: number } | null>(null);

  const stop = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function start() {
      try {
        const constraints: MediaStreamConstraints =
          mode === "audio"
            ? { audio: true }
            : {
                audio: mode === "video",
                video: {
                  facingMode: { ideal: "environment" },
                  width: { ideal: 1920 },
                  height: { ideal: 1080 },
                },
              };
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current && mode !== "audio") {
          videoRef.current.srcObject = stream;
          await videoRef.current.play().catch(() => {});
        }

        // Inspect camera capabilities (focus/zoom/torch).
        if (mode !== "audio") {
          const track = stream.getVideoTracks()[0];
          const c = (track.getCapabilities?.() ?? {}) as unknown as CamCaps & {
            zoom?: { min: number; max: number; step: number };
          };
          const detected: CamCaps = {
            zoom: c.zoom,
            torch: Boolean((c as { torch?: boolean }).torch),
            focusMode: (c as { focusMode?: string[] }).focusMode,
            pointsOfInterest: "pointsOfInterest" in c,
          };
          setCaps(detected);
          // Prefer continuous autofocus when available.
          if (detected.focusMode?.includes("continuous")) {
            applyAdvanced(track, { focusMode: "continuous" });
          }
          if (detected.zoom) setZoom(detected.zoom.min);
        }
        setReady(true);
      } catch {
        setError(t("cap.cameraError"));
      }
    }
    start();
    return () => {
      cancelled = true;
      stop();
    };
  }, [mode, stop]);

  useEffect(() => {
    if (!recording) return;
    const id = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [recording]);

  // Tap-to-focus.
  function handleFocusTap(e: React.MouseEvent<HTMLVideoElement>) {
    const track = streamRef.current?.getVideoTracks()[0];
    const video = videoRef.current;
    if (!track || !video) return;
    const rect = video.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    setFocusRing({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    setTimeout(() => setFocusRing(null), 800);
    if (caps.focusMode?.includes("single-shot") || caps.pointsOfInterest) {
      applyAdvanced(track, {
        focusMode: caps.focusMode?.includes("single-shot") ? "single-shot" : "continuous",
        pointsOfInterest: [{ x, y }],
      });
    }
  }

  function changeZoom(value: number) {
    setZoom(value);
    const track = streamRef.current?.getVideoTracks()[0];
    if (track) applyAdvanced(track, { zoom: value });
  }

  function toggleTorch() {
    const track = streamRef.current?.getVideoTracks()[0];
    if (!track) return;
    const next = !torch;
    setTorch(next);
    applyAdvanced(track, { torch: next });
  }

  function capturePhoto() {
    const video = videoRef.current;
    if (!video) return;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    canvas.getContext("2d")?.drawImage(video, 0, 0, canvas.width, canvas.height);
    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        onCapture(new File([blob], `capture-${Date.now()}.jpg`, { type: "image/jpeg" }));
        stop();
        onClose();
      },
      "image/jpeg",
      0.92,
    );
  }

  function startRecording() {
    if (!streamRef.current) return;
    chunksRef.current = [];
    const mime = mode === "audio" ? "audio/webm" : "video/webm";
    const rec = new MediaRecorder(streamRef.current);
    rec.ondataavailable = (e) => e.data.size > 0 && chunksRef.current.push(e.data);
    rec.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: mime });
      onCapture(new File([blob], `recording-${Date.now()}.webm`, { type: mime }));
      stop();
      onClose();
    };
    rec.start();
    recorderRef.current = rec;
    setRecording(true);
    setSeconds(0);
  }

  function stopRecording() {
    recorderRef.current?.stop();
    setRecording(false);
  }

  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");

  return (
    <div className="fixed inset-0 z-[95] flex flex-col bg-black">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 pt-[calc(env(safe-area-inset-top)+12px)] pb-3 text-white">
        <span className="text-sm font-semibold">{title}</span>
        <div className="flex items-center gap-3">
          {caps.torch && !error && mode !== "audio" && (
            <button onClick={toggleTorch} aria-label={t("cap.toggleFlash")} className="p-1">
              {torch ? <Zap className="size-6 text-yellow-300" /> : <ZapOff className="size-6" />}
            </button>
          )}
          <button onClick={() => { stop(); onClose(); }} aria-label={t("cap.close")} className="p-1">
            <X className="size-6" aria-hidden />
          </button>
        </div>
      </div>

      {/* Preview */}
      <div className="relative flex flex-1 items-center justify-center overflow-hidden">
        {error ? (
          <div className="px-8 text-center text-white/90">
            <p className="text-sm">{error}</p>
            <Button variant="outline" className="mt-4 bg-white" onClick={() => fileRef.current?.click()}>
              <Upload className="size-4" /> {t("cap.uploadFile")}
            </Button>
          </div>
        ) : mode === "audio" ? (
          <div className="flex flex-col items-center gap-3 text-white">
            <span className="flex size-24 items-center justify-center rounded-full bg-white/10">
              <Mic className={recording ? "size-12 animate-pulse text-[#FF2A2A]" : "size-12"} aria-hidden />
            </span>
            <span className="text-sm">{recording ? t("cap.recording") : t("cap.readyToRecord")}</span>
          </div>
        ) : (
          <>
            {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
            <video
              ref={videoRef}
              playsInline
              muted
              onClick={handleFocusTap}
              className="h-full w-full object-cover"
            />
            {focusRing && (
              <span
                className="pointer-events-none absolute size-16 -translate-x-1/2 -translate-y-1/2 animate-ping rounded-full border-2 border-white/90"
                style={{ left: focusRing.x, top: focusRing.y }}
              />
            )}
            {ready && (
              <p className="pointer-events-none absolute bottom-2 left-1/2 -translate-x-1/2 rounded-full bg-black/40 px-3 py-1 text-xs text-white/80">
                {t("cap.tapFocus")}
              </p>
            )}
          </>
        )}

        {recording && (
          <div className="absolute left-4 top-4 flex items-center gap-2 rounded-full bg-black/60 px-3 py-1 text-sm text-white">
            <span className="size-2 animate-pulse rounded-full bg-[#FF2A2A]" /> {mm}:{ss}
          </div>
        )}
      </div>

      {/* Zoom slider */}
      {!error && caps.zoom && zoom != null && (
        <div className="flex items-center gap-3 px-6 pb-1 text-white">
          <span className="text-xs">{t("cap.zoom")}</span>
          <input
            type="range"
            min={caps.zoom.min}
            max={caps.zoom.max}
            step={caps.zoom.step || 0.1}
            value={zoom}
            onChange={(e) => changeZoom(Number(e.target.value))}
            className="flex-1 accent-[#E50914]"
            aria-label={t("cap.zoom")}
          />
          <span className="w-8 text-right text-xs">{zoom.toFixed(1)}×</span>
        </div>
      )}

      {/* Controls */}
      <div className="flex items-center justify-center gap-6 px-6 pb-[calc(env(safe-area-inset-bottom)+24px)] pt-4">
        {!error && mode === "photo" && (
          <button
            onClick={capturePhoto}
            disabled={!ready}
            aria-label={t("cap.takePhoto")}
            className="flex size-20 items-center justify-center rounded-full border-4 border-white/70 bg-white/10 text-white transition active:scale-95 disabled:opacity-40"
          >
            <Camera className="size-8" aria-hidden />
          </button>
        )}
        {!error && (mode === "video" || mode === "audio") && (
          <button
            onClick={recording ? stopRecording : startRecording}
            disabled={!ready}
            aria-label={recording ? t("cap.stopRecording") : t("cap.startRecording")}
            className="flex size-20 items-center justify-center rounded-full border-4 border-white/70 text-white transition active:scale-95 disabled:opacity-40"
            style={{ background: recording ? "#111" : "#E50914" }}
          >
            {recording ? <CircleStop className="size-9" aria-hidden /> : mode === "video" ? <Video className="size-8" aria-hidden /> : <Mic className="size-8" aria-hidden />}
          </button>
        )}
        {!error && !recording && (
          <button
            onClick={() => fileRef.current?.click()}
            aria-label={t("cap.useUpload")}
            className="flex size-12 items-center justify-center rounded-full bg-white/15 text-white"
          >
            <Upload className="size-5" aria-hidden />
          </button>
        )}
      </div>

      <input
        ref={fileRef}
        type="file"
        accept={mode === "photo" ? "image/*" : mode === "video" ? "video/*" : "audio/*"}
        hidden
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) {
            onCapture(f);
            stop();
            onClose();
          }
        }}
      />
    </div>
  );
}
