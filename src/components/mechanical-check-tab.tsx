"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Camera,
  CheckCircle2,
  CheckCircle,
  Info,
  Upload,
  Video,
  Wrench,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DisclaimerBanner } from "@/components/disclaimer-banner";
import { RiskScoreCircle } from "@/components/risk-indicators";
import { MediaCapture, type CaptureMode } from "@/components/media-capture";
import {
  MECHANICAL_DISCLAIMER,
  MECHANICAL_POINTS,
  MECHANICAL_RISK_COPY,
} from "@/lib/mechanical";
import { cn } from "@/lib/utils";
import { toast } from "@/lib/toast";
import { STORAGE_BUCKETS } from "@/lib/constants";
import { compressImage, fileExt, getUserId, uploadToStorage } from "@/lib/upload";
import type {
  MechanicalCheckItem,
  MechanicalPoint,
  Severity,
} from "@/types";

const sevBadge: Record<Severity, "low" | "moderate" | "high" | "critical" | "secondary"> = {
  none: "low",
  low: "low",
  moderate: "moderate",
  high: "high",
  critical: "critical",
};

export function MechanicalCheckTab({
  sessionId,
  initialItems,
  mechanicalScore,
  mechanicalRisk,
}: {
  sessionId: string;
  initialItems: MechanicalCheckItem[];
  mechanicalScore: number | null;
  mechanicalRisk: string | null;
}) {
  const byCode = useMemo(() => {
    const m = new Map<string, MechanicalCheckItem>();
    for (const it of initialItems) m.set(it.point_code, it);
    return m;
  }, [initialItems]);

  const completed = initialItems.filter(
    (i) => i.analysis_status === "completed" || i.quality_status === "skipped",
  ).length;

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="flex flex-col items-center gap-4 p-6 sm:flex-row">
          <RiskScoreCircle score={mechanicalScore} label="Mechanical score" />
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <Wrench className="size-5 text-accent" />
              <h2 className="text-lg font-bold">Engine &amp; Mechanical Check</h2>
            </div>
            <p className="text-sm text-muted-foreground">
              Optional but recommended. Complete the guided checks below — tick
              what you observe and add a photo/video where asked. {completed}/
              {MECHANICAL_POINTS.length} done.
            </p>
            {mechanicalRisk && (
              <Badge variant="secondary">
                {MECHANICAL_RISK_COPY[mechanicalRisk as keyof typeof MECHANICAL_RISK_COPY] ?? mechanicalRisk}
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {MECHANICAL_POINTS.map((point) => (
        <StepCard
          key={point.code}
          sessionId={sessionId}
          point={point}
          initial={byCode.get(point.code) ?? null}
        />
      ))}

      <DisclaimerBanner text={MECHANICAL_DISCLAIMER} />
    </div>
  );
}

function StepCard({
  sessionId,
  point,
  initial,
}: {
  sessionId: string;
  point: MechanicalPoint;
  initial: MechanicalCheckItem | null;
}) {
  const router = useRouter();
  const docsRef = useRef<HTMLInputElement>(null);

  // Captured media (in-app camera/mic).
  const [primaryFile, setPrimaryFile] = useState<File | null>(null);
  const [secondaryFile, setSecondaryFile] = useState<File | null>(null);
  const [capture, setCapture] = useState<null | { slot: "primary" | "secondary"; mode: CaptureMode }>(null);

  const [obs, setObs] = useState<Record<string, boolean>>(
    (initial?.observations as Record<string, boolean>) ?? {},
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ score: number; severity: Severity; suspicious: string[] } | null>(
    initial?.score != null
      ? {
          score: initial.score,
          severity: (initial.severity ?? "none") as Severity,
          suspicious: initial.ai_analysis?.suspicious_observations ?? [],
        }
      : null,
  );
  const [skipped, setSkipped] = useState(initial?.quality_status === "skipped");

  function toggle(key: string) {
    setObs((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  async function save() {
    setSaving(true);
    setError(null);
    let data: { analysis: { score: number; severity: Severity; suspicious_observations?: string[] }; error?: string };
    try {
      const userId = await getUserId();
      if (!userId) throw new Error("Please sign in again.");
      const base = `${userId}/${sessionId}/${point.code}`;

      const upImg = async (f: File, suffix: string) => {
        const isImg = f.type.startsWith("image/");
        const out = isImg ? await compressImage(f) : f;
        const path = `${base}${suffix}.${fileExt(out)}`;
        await uploadToStorage(STORAGE_BUCKETS.mechanical, path, out);
        return path;
      };

      const payload: Record<string, unknown> = { observations: obs };
      if (primaryFile) payload.primary_path = await upImg(primaryFile, "");
      if (secondaryFile) payload.secondary_path = await upImg(secondaryFile, "-2");
      if (point.media_type === "docs") {
        const docs = Array.from(docsRef.current?.files ?? []);
        const docPaths: string[] = [];
        for (let i = 0; i < docs.length; i++) docPaths.push(await upImg(docs[i], `-doc${i}`));
        payload.doc_paths = docPaths;
      }

      const res = await fetch(`/api/inspections/${sessionId}/mechanical/${point.code}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Save failed.");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Could not save this check.";
      setError(msg);
      toast.error(msg);
      setSaving(false);
      return;
    }
    setSaving(false);
    toast.success(`${point.title} saved.`);
    setSkipped(false);
    setResult({
      score: data.analysis.score,
      severity: data.analysis.severity,
      suspicious: data.analysis.suspicious_observations ?? [],
    });
    router.refresh();
  }

  async function skip() {
    setSaving(true);
    await fetch(`/api/inspections/${sessionId}/mechanical/${point.code}`, { method: "PUT" });
    setSaving(false);
    setSkipped(true);
    setResult(null);
    router.refresh();
  }

  const captureMode: CaptureMode = point.media_type === "video" ? "video" : "photo";

  return (
    <Card className={cn(result && "border-accent/30")}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between gap-2 text-base">
          <span>
            {point.order_index}. {point.title}
            {!point.required && <span className="ml-2 text-xs font-normal text-muted-foreground">(optional)</span>}
          </span>
          {skipped ? (
            <Badge variant="secondary">Skipped</Badge>
          ) : result ? (
            <Badge variant={sevBadge[result.severity]}>{result.score}/100</Badge>
          ) : null}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm">{point.instruction}</p>
        <div className="flex gap-2 rounded-md bg-accent/5 p-2 text-xs text-muted-foreground">
          <Info className="mt-0.5 size-4 shrink-0 text-accent" />
          <span>{point.why_it_matters}</span>
        </div>

        {/* Media capture (in-app camera / mic) */}
        {point.media_type === "docs" ? (
          <div>
            <p className="mb-1 text-xs font-medium">Upload invoices / logbook photos</p>
            <input ref={docsRef} type="file" accept="image/*,application/pdf" multiple className="text-xs" />
          </div>
        ) : point.media_type === "photo_pair" ? (
          <div className="grid grid-cols-2 gap-2">
            <CaptureTile
              label="Ignition ON / engine OFF"
              file={primaryFile}
              icon={Camera}
              onClick={() => setCapture({ slot: "primary", mode: "photo" })}
            />
            <CaptureTile
              label="Engine running"
              file={secondaryFile}
              icon={Camera}
              onClick={() => setCapture({ slot: "secondary", mode: "photo" })}
            />
          </div>
        ) : point.media_type !== "questionnaire" ? (
          <CaptureTile
            label={point.media_type === "video" ? "Film (video + sound)" : "Take a photo"}
            file={primaryFile}
            icon={point.media_type === "video" ? Video : Camera}
            onClick={() => setCapture({ slot: "primary", mode: captureMode })}
            full
          />
        ) : null}

        {/* Observations */}
        <div className="space-y-1.5">
          <p className="text-xs font-semibold text-muted-foreground">What did you observe?</p>
          {point.observations.map((o) => (
            <label key={o.key} className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={!!obs[o.key]} onChange={() => toggle(o.key)} />
              <span className={o.kind === "good" ? "text-risk-low" : undefined}>{o.label}</span>
            </label>
          ))}
        </div>

        {result && result.suspicious.length > 0 && (
          <div className="rounded-md border border-risk-moderate/40 bg-risk-moderate/10 p-2 text-xs text-risk-moderate">
            {result.suspicious.join(" · ")}
          </div>
        )}
        {error && <p className="text-sm text-destructive">{error}</p>}

        <div className="flex gap-2">
          <Button size="sm" onClick={save} disabled={saving}>
            {result ? <CheckCircle2 className="size-4" /> : <Upload className="size-4" />}
            {saving ? "Saving…" : result ? "Update" : "Save check"}
          </Button>
          <Button size="sm" variant="ghost" onClick={skip} disabled={saving}>
            {point.required ? "I can't do this" : "Skip"}
          </Button>
        </div>
      </CardContent>

      {capture && (
        <MediaCapture
          mode={capture.mode}
          title={`${point.order_index}. ${point.title}`}
          onClose={() => setCapture(null)}
          onCapture={(file) => {
            if (capture.slot === "primary") setPrimaryFile(file);
            else setSecondaryFile(file);
          }}
        />
      )}
    </Card>
  );
}

function CaptureTile({
  label,
  file,
  icon: Icon,
  onClick,
  full = false,
}: {
  label: string;
  file: File | null;
  icon: React.ComponentType<{ className?: string }>;
  onClick: () => void;
  full?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 rounded-xl border border-dashed p-3 text-left text-sm transition-colors hover:bg-secondary",
        file ? "border-risk-low/50 bg-risk-low/5" : "border-[#E5E7EB]",
        full && "w-full",
      )}
    >
      <span
        className={cn(
          "flex size-9 shrink-0 items-center justify-center rounded-lg",
          file ? "bg-risk-low/15 text-risk-low" : "bg-[rgba(229,9,20,0.10)] text-[#E50914]",
        )}
      >
        {file ? <CheckCircle className="size-5" aria-hidden /> : <Icon className="size-5" aria-hidden />}
      </span>
      <span className="min-w-0">
        <span className="block font-medium text-[#111827]">{file ? "Captured — tap to retake" : label}</span>
        {!file && <span className="block text-xs text-muted-foreground">Tap to open the camera</span>}
      </span>
    </button>
  );
}
