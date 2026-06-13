"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Camera,
  CheckCircle2,
  ImageUp,
  Info,
  RefreshCw,
  SkipForward,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PhotoQualityStatus } from "@/components/photo-quality-status";
import { DisclaimerBanner } from "@/components/disclaimer-banner";
import { PHOTO_POINTS, REQUIRED_PHOTO_COUNT } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { toast } from "@/lib/toast";
import { AnalyzingOverlay } from "@/components/analyzing-overlay";
import type { InspectionPhoto, PhotoPointCode, QualityStatus } from "@/types";

interface PhotoState {
  status: QualityStatus;
  imageUrl: string | null;
  feedback: string | null;
  uploading: boolean;
  error: string | null;
}

function initialState(photos: InspectionPhoto[]): Record<string, PhotoState> {
  const map: Record<string, PhotoState> = {};
  for (const p of PHOTO_POINTS) {
    const existing = photos.find((x) => x.photo_point_code === p.code);
    map[p.code] = {
      status: existing?.quality_status ?? "pending",
      imageUrl: existing?.image_url ?? null,
      feedback: existing?.quality_feedback ?? null,
      uploading: false,
      error: null,
    };
  }
  return map;
}

export function HiddenDamageScanner({
  sessionId,
  initialPhotos,
}: {
  sessionId: string;
  initialPhotos: InspectionPhoto[];
}) {
  const router = useRouter();
  const [states, setStates] = useState(() => initialState(initialPhotos));
  const [activeCode, setActiveCode] = useState<PhotoPointCode>(
    PHOTO_POINTS.find(
      (p) => initialState(initialPhotos)[p.code].status === "pending",
    )?.code ?? PHOTO_POINTS[0].code,
  );
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzeError, setAnalyzeError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const active = PHOTO_POINTS.find((p) => p.code === activeCode)!;
  const activeIndex = PHOTO_POINTS.findIndex((p) => p.code === activeCode);

  const completed = useMemo(
    () =>
      PHOTO_POINTS.filter((p) =>
        ["passed", "skipped"].includes(states[p.code].status),
      ).length,
    [states],
  );
  const passed = useMemo(
    () => PHOTO_POINTS.filter((p) => states[p.code].status === "passed").length,
    [states],
  );
  const allDone = completed === REQUIRED_PHOTO_COUNT;

  function setState(code: string, patch: Partial<PhotoState>) {
    setStates((prev) => ({ ...prev, [code]: { ...prev[code], ...patch } }));
  }

  async function upload(file: File) {
    setState(activeCode, { uploading: true, error: null });
    const fd = new FormData();
    fd.append("file", file);
    fd.append("photo_point_code", activeCode);
    try {
      const res = await fetch(`/api/inspections/${sessionId}/photos`, {
        method: "POST",
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Upload failed.");
      setState(activeCode, {
        uploading: false,
        status: data.photo.quality_status,
        imageUrl: data.imageUrl ?? data.photo.image_url,
        feedback: data.photo.quality_feedback,
      });
      // Auto-advance on success.
      if (data.photo.quality_status === "passed") {
        toast.success("Photo looks good.");
        advance();
      } else if (data.photo.quality_status === "needs_retake") {
        toast.error("This photo needs a retake.");
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Upload failed.";
      setState(activeCode, { uploading: false, error: msg });
      toast.error(msg);
    }
  }

  async function skip() {
    setState(activeCode, { uploading: true, error: null });
    const res = await fetch(`/api/inspections/${sessionId}/photos`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ photo_point_code: activeCode }),
    });
    if (res.ok) {
      setState(activeCode, { uploading: false, status: "skipped", imageUrl: null });
      advance();
    } else {
      setState(activeCode, { uploading: false, error: "Could not skip." });
    }
  }

  function advance() {
    const next = PHOTO_POINTS.find(
      (p, i) => i > activeIndex && states[p.code].status === "pending",
    );
    if (next) setActiveCode(next.code);
  }

  async function runAnalysis() {
    setAnalyzing(true);
    setAnalyzeError(null);
    const res = await fetch(`/api/inspections/${sessionId}/analyze`, {
      method: "POST",
    });
    const data = await res.json();
    if (!res.ok) {
      const msg = data.error ?? "Analysis failed.";
      setAnalyzeError(msg);
      toast.error(msg);
      setAnalyzing(false);
      return;
    }
    toast.success("Analysis complete.");
    router.push(`/inspections/${sessionId}/analysis`);
  }

  const activeState = states[activeCode];

  return (
    <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
      {analyzing && <AnalyzingOverlay />}
      {/* Progress rail */}
      <div className="space-y-3">
        <EightPhotoProgress states={states} activeCode={activeCode} onSelect={setActiveCode} />
        <div className="rounded-lg border p-3 text-center text-sm">
          <span className="font-semibold">
            {completed}/{REQUIRED_PHOTO_COUNT}
          </span>{" "}
          <span className="text-muted-foreground">photos completed</span>
        </div>
      </div>

      {/* Active step */}
      <div className="space-y-4">
        <Card>
          <CardContent className="space-y-4 p-6">
            <div className="flex items-center justify-between">
              <div>
                <Badge variant="accent" className="mb-2">
                  Photo {active.order_index} / {REQUIRED_PHOTO_COUNT}
                </Badge>
                <h2 className="text-xl font-bold">{active.title}</h2>
              </div>
              <PhotoQualityStatus status={activeState.status} />
            </div>

            <p className="text-sm">{active.instruction}</p>

            <div className="flex gap-2 rounded-md bg-accent/5 p-3 text-xs text-muted-foreground">
              <Info className="mt-0.5 size-4 shrink-0 text-accent" />
              <span>
                <strong className="text-foreground">Why it matters: </strong>
                {active.why_it_matters}
              </span>
            </div>

            {/* Preview / placeholder */}
            <div className="relative flex aspect-video items-center justify-center overflow-hidden rounded-lg border bg-muted">
              {activeState.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={activeState.imageUrl}
                  alt={active.title}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                  <Camera className="size-10" />
                  <span className="text-sm">{active.title} — example placeholder</span>
                </div>
              )}
              {activeState.uploading && (
                <div className="absolute inset-0 flex items-center justify-center bg-background/70">
                  <RefreshCw className="size-6 animate-spin text-primary" />
                </div>
              )}
            </div>

            {activeState.status === "needs_retake" && activeState.feedback && (
              <div className="rounded-md border border-risk-moderate/40 bg-risk-moderate/10 p-3 text-sm text-risk-moderate">
                {activeState.feedback}
              </div>
            )}
            {activeState.error && (
              <p className="text-sm text-destructive">{activeState.error}</p>
            )}

            {/* Actions */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/heic,image/webp"
              capture="environment"
              hidden
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) upload(f);
                e.target.value = "";
              }}
            />
            <div className="flex flex-wrap gap-2">
              <Button onClick={() => fileInputRef.current?.click()} disabled={activeState.uploading}>
                <Camera className="size-4" />
                {activeState.imageUrl ? "Retake photo" : "Take photo"}
              </Button>
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={activeState.uploading}
              >
                <ImageUp className="size-4" /> Upload from gallery
              </Button>
              <Button variant="ghost" onClick={skip} disabled={activeState.uploading}>
                <SkipForward className="size-4" /> I can&apos;t take this photo
              </Button>
            </div>
          </CardContent>
        </Card>

        <DisclaimerBanner />

        <div className="flex items-center justify-between rounded-lg border p-4">
          <div className="text-sm text-muted-foreground">
            {allDone
              ? passed > 0
                ? "All photos completed. You can run the analysis."
                : "All photos were skipped — analysis needs at least one usable photo."
              : `Complete all ${REQUIRED_PHOTO_COUNT} photos to run the analysis.`}
          </div>
          <Button onClick={runAnalysis} disabled={!allDone || passed === 0 || analyzing}>
            {analyzing ? "Analyzing…" : "Run AI analysis"}
          </Button>
        </div>
        {analyzeError && <p className="text-sm text-destructive">{analyzeError}</p>}
      </div>
    </div>
  );
}

function EightPhotoProgress({
  states,
  activeCode,
  onSelect,
}: {
  states: Record<string, PhotoState>;
  activeCode: PhotoPointCode;
  onSelect: (code: PhotoPointCode) => void;
}) {
  return (
    <div className="space-y-1">
      {PHOTO_POINTS.map((p) => {
        const st = states[p.code];
        const done = ["passed", "skipped"].includes(st.status);
        return (
          <button
            key={p.code}
            onClick={() => onSelect(p.code)}
            className={cn(
              "flex w-full items-center gap-3 rounded-md border px-3 py-2 text-left text-sm transition-colors",
              p.code === activeCode
                ? "border-primary bg-primary/5"
                : "hover:bg-secondary",
            )}
          >
            <span
              className={cn(
                "inline-flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
                st.status === "passed"
                  ? "bg-risk-low text-white"
                  : st.status === "skipped"
                    ? "bg-muted-foreground text-white"
                    : st.status === "needs_retake"
                      ? "bg-risk-moderate text-white"
                      : "bg-muted text-muted-foreground",
              )}
            >
              {done ? <CheckCircle2 className="size-4" /> : p.order_index}
            </span>
            <span className="flex-1 truncate">{p.title}</span>
          </button>
        );
      })}
    </div>
  );
}
