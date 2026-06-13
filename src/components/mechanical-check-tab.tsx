"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  Info,
  Upload,
  Wrench,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DisclaimerBanner } from "@/components/disclaimer-banner";
import { RiskScoreCircle } from "@/components/risk-indicators";
import {
  MECHANICAL_DISCLAIMER,
  MECHANICAL_POINTS,
  MECHANICAL_RISK_COPY,
} from "@/lib/mechanical";
import { cn } from "@/lib/utils";
import { toast } from "@/lib/toast";
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
  const fileRef = useRef<HTMLInputElement>(null);
  const file2Ref = useRef<HTMLInputElement>(null);
  const docsRef = useRef<HTMLInputElement>(null);

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
    const fd = new FormData();
    fd.append("observations", JSON.stringify(obs));
    if (point.media_type === "photo" || point.media_type === "photo_pair" || point.media_type === "video") {
      const f = fileRef.current?.files?.[0];
      if (f) fd.append("file", f);
    }
    if (point.media_type === "photo_pair") {
      const f2 = file2Ref.current?.files?.[0];
      if (f2) fd.append("file2", f2);
    }
    if (point.media_type === "docs") {
      for (const f of Array.from(docsRef.current?.files ?? [])) fd.append("files", f);
    }
    const res = await fetch(`/api/inspections/${sessionId}/mechanical/${point.code}`, {
      method: "POST",
      body: fd,
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) {
      setError(data.error ?? "Save failed.");
      toast.error(data.error ?? "Could not save this check.");
      return;
    }
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

  const accept =
    point.media_type === "video"
      ? "video/mp4,video/quicktime,video/webm"
      : point.media_type === "docs"
        ? "image/*,application/pdf"
        : "image/jpeg,image/png,image/heic,image/webp";

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

        {/* Media inputs */}
        {point.media_type !== "questionnaire" && (
          <div className="flex flex-wrap gap-2">
            {point.media_type === "photo_pair" ? (
              <>
                <label className="flex-1">
                  <span className="mb-1 block text-xs font-medium">Ignition ON / engine OFF</span>
                  <input ref={fileRef} type="file" accept={accept} capture="environment" className="text-xs" />
                </label>
                <label className="flex-1">
                  <span className="mb-1 block text-xs font-medium">Engine running</span>
                  <input ref={file2Ref} type="file" accept={accept} capture="environment" className="text-xs" />
                </label>
              </>
            ) : point.media_type === "docs" ? (
              <input ref={docsRef} type="file" accept={accept} multiple className="text-xs" />
            ) : (
              <input
                ref={fileRef}
                type="file"
                accept={accept}
                capture="environment"
                className="text-xs"
              />
            )}
          </div>
        )}

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
    </Card>
  );
}
