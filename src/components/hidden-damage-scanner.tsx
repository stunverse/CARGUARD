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
import { CaptureGuide, hasCaptureGuide } from "@/components/capture-guide";
import { PHOTO_POINTS, REQUIRED_PHOTO_COUNT, STORAGE_BUCKETS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { toast } from "@/lib/toast";
import { compressImage, getUserId, uploadToStorage } from "@/lib/upload";
import { AnalyzingOverlay } from "@/components/analyzing-overlay";
import { useI18n } from "@/components/i18n-provider";
import { localizedPhotoPoint } from "@/lib/content-i18n";
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
  const { locale, t } = useI18n();
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
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const active = PHOTO_POINTS.find((p) => p.code === activeCode)!;
  const activeLoc = localizedPhotoPoint(active, locale);
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
    try {
      const userId = await getUserId();
      if (!userId) throw new Error(t("ui.signIn"));
      const compressed = await compressImage(file);
      const path = `${userId}/${sessionId}/${activeCode}.jpg`;
      await uploadToStorage(STORAGE_BUCKETS.inspectionPhotos, path, compressed);

      const res = await fetch(`/api/inspections/${sessionId}/photos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          photo_point_code: activeCode,
          storage_path: path,
          original_file_name: file.name,
          mime_type: compressed.type,
          file_size: compressed.size,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? t("ui.uploadFailed"));
      setState(activeCode, {
        uploading: false,
        status: data.photo.quality_status,
        imageUrl: data.imageUrl ?? data.photo.image_url,
        feedback: data.photo.quality_feedback,
      });
      // Auto-advance on success.
      if (data.photo.quality_status === "passed") {
        toast.success(t("scan.photoGood"));
        advance();
      } else if (data.photo.quality_status === "needs_retake") {
        toast.error(t("scan.needsRetake"));
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : t("ui.uploadFailed");
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
      setState(activeCode, { uploading: false, error: t("scan.couldNotSkip") });
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
      const msg = data.error ?? t("scan.analysisFailed");
      setAnalyzeError(msg);
      toast.error(msg);
      setAnalyzing(false);
      return;
    }
    toast.success(t("scan.analysisComplete"));
    router.push(`/inspections/${sessionId}/analysis`);
  }

  const activeState = states[activeCode];

  return (
    <div className="space-y-6">
      {analyzing && <AnalyzingOverlay />}
      {/* Progress (horizontal strip) */}
      <div>
        <EightPhotoProgress states={states} activeCode={activeCode} onSelect={setActiveCode} />
        <div className="mt-2 text-center text-sm">
          <span className="font-semibold">
            {completed}/{REQUIRED_PHOTO_COUNT}
          </span>{" "}
          <span className="text-muted-foreground">{t("scan.photosCompleted")}</span>
        </div>
      </div>

      {/* Active step */}
      <div className="space-y-4">
        <Card>
          <CardContent className="space-y-4 p-6">
            <div className="flex items-center justify-between">
              <div>
                <Badge variant="accent" className="mb-2">
                  {t("scan.photo")} {active.order_index} / {REQUIRED_PHOTO_COUNT}
                </Badge>
                <h2 className="text-xl font-bold">{activeLoc.title}</h2>
              </div>
              <PhotoQualityStatus status={activeState.status} />
            </div>

            <p className="text-sm">{activeLoc.instruction}</p>

            <div className="flex gap-2 rounded-md bg-accent/5 p-3 text-xs text-muted-foreground">
              <Info className="mt-0.5 size-4 shrink-0 text-accent" />
              <span>
                <strong className="text-foreground">{t("scan.whyMatters")} </strong>
                {activeLoc.why}
              </span>
            </div>

            {/* Preview / placeholder */}
            <div className="relative flex aspect-video items-center justify-center overflow-hidden rounded-lg border bg-muted">
              {activeState.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={activeState.imageUrl}
                  alt={activeLoc.title}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex flex-col items-center gap-2 p-3 text-muted-foreground">
                  {hasCaptureGuide(activeCode) ? (
                    <div className="w-40 sm:w-48">
                      <CaptureGuide code={activeCode} />
                    </div>
                  ) : (
                    <Camera className="size-10" />
                  )}
                  <span className="text-sm">{activeLoc.title} {t("scan.examplePlaceholder")}</span>
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
              hidden
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) upload(f);
                e.target.value = "";
              }}
            />
            <input
              ref={galleryInputRef}
              type="file"
              accept="image/jpeg,image/png,image/heic,image/webp"
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
                {activeState.imageUrl ? t("scan.retakePhoto") : t("scan.takePhoto")}
              </Button>
              <Button
                variant="outline"
                onClick={() => galleryInputRef.current?.click()}
                disabled={activeState.uploading}
              >
                <ImageUp className="size-4" /> {t("scan.uploadGallery")}
              </Button>
              <Button variant="ghost" onClick={skip} disabled={activeState.uploading}>
                <SkipForward className="size-4" /> {t("scan.cantTake")}
              </Button>
            </div>
          </CardContent>
        </Card>

        <DisclaimerBanner />

        <div className="flex items-center justify-between rounded-lg border p-4">
          <div className="text-sm text-muted-foreground">
            {allDone
              ? passed > 0
                ? t("scan.allDone")
                : t("scan.allSkipped")
              : `${t("scan.completeAllPre")} ${REQUIRED_PHOTO_COUNT} ${t("scan.completeAllPost")}`}
          </div>
          <Button onClick={runAnalysis} disabled={!allDone || passed === 0 || analyzing}>
            {analyzing ? t("scan.analyzing") : t("scan.runAnalysis")}
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
  const { locale } = useI18n();
  return (
    <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
      {PHOTO_POINTS.map((p) => {
        const st = states[p.code];
        const done = ["passed", "skipped"].includes(st.status);
        const active = p.code === activeCode;
        return (
          <button
            key={p.code}
            onClick={() => onSelect(p.code)}
            aria-label={`${p.order_index}. ${localizedPhotoPoint(p, locale).title}`}
            className={cn(
              "flex shrink-0 flex-col items-center gap-1 rounded-xl border px-3 py-2 transition-colors",
              active ? "border-primary bg-primary/5" : "hover:bg-secondary",
            )}
          >
            <span
              className={cn(
                "inline-flex size-7 items-center justify-center rounded-full text-xs font-semibold",
                st.status === "passed"
                  ? "bg-risk-low text-white"
                  : st.status === "skipped"
                    ? "bg-muted-foreground text-white"
                    : st.status === "needs_retake"
                      ? "bg-risk-moderate text-white"
                      : active
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground",
              )}
            >
              {done ? <CheckCircle2 className="size-4" /> : p.order_index}
            </span>
            <span
              className={cn(
                "text-[10px] font-medium",
                active ? "text-primary" : "text-muted-foreground",
              )}
            >
              {p.order_index}
            </span>
          </button>
        );
      })}
    </div>
  );
}
