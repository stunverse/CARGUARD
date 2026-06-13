"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Camera, CircleStop, Mic, Upload, Video, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export type CaptureMode = "photo" | "video" | "audio";

// In-app camera / microphone capture (live preview + MediaRecorder).
// Falls back to a file picker when the device camera/mic is unavailable.
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
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  const [ready, setReady] = useState(false);
  const [recording, setRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [error, setError] = useState<string | null>(null);

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
            : { audio: mode === "video", video: { facingMode: "environment" } };
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
        setReady(true);
      } catch {
        setError(
          "Camera/microphone not available or permission denied. You can upload a file instead.",
        );
      }
    }
    start();
    return () => {
      cancelled = true;
      stop();
    };
  }, [mode, stop]);

  // Recording timer.
  useEffect(() => {
    if (!recording) return;
    const id = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [recording]);

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
      0.9,
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
      const ext = mode === "audio" ? "webm" : "webm";
      onCapture(new File([blob], `recording-${Date.now()}.${ext}`, { type: mime }));
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
        <button onClick={() => { stop(); onClose(); }} aria-label="Close" className="p-1">
          <X className="size-6" aria-hidden />
        </button>
      </div>

      {/* Preview */}
      <div className="relative flex flex-1 items-center justify-center overflow-hidden">
        {error ? (
          <div className="px-8 text-center text-white/90">
            <p className="text-sm">{error}</p>
            <Button
              variant="outline"
              className="mt-4 bg-white"
              onClick={() => fileRef.current?.click()}
            >
              <Upload className="size-4" /> Upload a file
            </Button>
          </div>
        ) : mode === "audio" ? (
          <div className="flex flex-col items-center gap-3 text-white">
            <span className="flex size-24 items-center justify-center rounded-full bg-white/10">
              <Mic className={recording ? "size-12 animate-pulse text-[#FF2A2A]" : "size-12"} aria-hidden />
            </span>
            <span className="text-sm">{recording ? "Recording…" : "Ready to record"}</span>
          </div>
        ) : (
          // eslint-disable-next-line jsx-a11y/media-has-caption
          <video ref={videoRef} playsInline muted className="h-full w-full object-cover" />
        )}

        {recording && (
          <div className="absolute left-4 top-4 flex items-center gap-2 rounded-full bg-black/60 px-3 py-1 text-sm text-white">
            <span className="size-2 animate-pulse rounded-full bg-[#FF2A2A]" /> {mm}:{ss}
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-6 px-6 pb-[calc(env(safe-area-inset-bottom)+24px)] pt-5">
        {!error && mode === "photo" && (
          <button
            onClick={capturePhoto}
            disabled={!ready}
            aria-label="Take photo"
            className="flex size-20 items-center justify-center rounded-full border-4 border-white/70 bg-white/10 text-white transition active:scale-95 disabled:opacity-40"
          >
            <Camera className="size-8" aria-hidden />
          </button>
        )}
        {!error && (mode === "video" || mode === "audio") && (
          <button
            onClick={recording ? stopRecording : startRecording}
            disabled={!ready}
            aria-label={recording ? "Stop recording" : "Start recording"}
            className="flex size-20 items-center justify-center rounded-full border-4 border-white/70 text-white transition active:scale-95 disabled:opacity-40"
            style={{ background: recording ? "#111" : "#E50914" }}
          >
            {recording ? <CircleStop className="size-9" aria-hidden /> : mode === "video" ? <Video className="size-8" aria-hidden /> : <Mic className="size-8" aria-hidden />}
          </button>
        )}
        {!error && !recording && (
          <button
            onClick={() => fileRef.current?.click()}
            aria-label="Upload a file instead"
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
