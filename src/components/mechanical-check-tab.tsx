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
  MECHANICAL_POINTS,
  MECHANICAL_RISK_COPY,
} from "@/lib/mechanical";
import { cn } from "@/lib/utils";
import { toast } from "@/lib/toast";
import { STORAGE_BUCKETS } from "@/lib/constants";
import { compressImage, fileExt, getUserId, uploadToStorage } from "@/lib/upload";
import { useI18n } from "@/components/i18n-provider";
import { MECH_RISK_FR, localizedMechPoint, pick } from "@/lib/content-i18n";
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
  const { locale, t } = useI18n();
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
          <RiskScoreCircle score={mechanicalScore} label={t("mct.score")} />
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <Wrench className="size-5 text-accent" />
              <h2 className="text-lg font-bold">{t("mct.title")}</h2>
            </div>
            <p className="text-sm text-muted-foreground">
              {t("mct.introPre")} {completed}/{MECHANICAL_POINTS.length} {t("mct.done")}
            </p>
            {mechanicalRisk && (
              <Badge variant="secondary">
                {pick(locale, mechanicalRisk, MECH_RISK_FR, MECHANICAL_RISK_COPY)}
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

      <DisclaimerBanner text={t("mct.disclaimer")} />
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
  const { locale, t } = useI18n();
  const router = useRouter();
  const loc = localizedMechPoint(point, locale);
  const docsRef = useRef<HTMLInputElement>(null);

  // Captured media (in-app camera/mic).
  const [primaryFile, setPrimaryFile] = useState<File | null>(null);
  const [secondaryFile, setSecondaryFile] = useState<File | null>(null);
  const [capture, setCapture] = useState<null | { slot: "primary" | "secondary"; mode: CaptureMode }>(null);

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

  async function save() {
    setSaving(true);
    setError(null);
    let data: { analysis: { score: number; severity: Severity; suspicious_observations?: string[] }; error?: string };
    try {
      const userId = await getUserId();
      if (!userId) throw new Error(t("ui.signIn"));
      const base = `${userId}/${sessionId}/${point.code}`;

      const upImg = async (f: File, suffix: string) => {
        const isImg = f.type.startsWith("image/");
        const out = isImg ? await compressImage(f) : f;
        const path = `${base}${suffix}.${fileExt(out)}`;
        await uploadToStorage(STORAGE_BUCKETS.mechanical, path, out);
        return path;
      };

      const payload: Record<string, unknown> = { observations: {} };
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
      if (!res.ok) throw new Error(data.error ?? t("mct.saveFailed"));
    } catch (e) {
      const msg = e instanceof Error ? e.message : t("mct.couldNotSave");
      setError(msg);
      toast.error(msg);
      setSaving(false);
      return;
    }
    setSaving(false);
    toast.success(`${loc.title} ${t("mct.savedSuffix")}`);
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

  const captureMode: CaptureMode =
    point.media_type === "video" || point.media_type === "questionnaire" ? "video" : "photo";

  return (
    <Card className={cn(result && "border-accent/30")}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between gap-2 text-base">
          <span>
            {point.order_index}. {loc.title}
            {!point.required && <span className="ml-2 text-xs font-normal text-muted-foreground">{t("mct.optional")}</span>}
          </span>
          {skipped ? (
            <Badge variant="secondary">{t("ui.skipped")}</Badge>
          ) : result ? (
            <Badge variant={sevBadge[result.severity]}>{result.score}/100</Badge>
          ) : null}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm">{loc.instruction}</p>
        <div className="flex gap-2 rounded-md bg-accent/5 p-2 text-xs text-muted-foreground">
          <Info className="mt-0.5 size-4 shrink-0 text-accent" />
          <span>{loc.why}</span>
        </div>

        {/* Media capture (in-app camera / mic) */}
        {point.media_type === "docs" ? (
          <div>
            <p className="mb-1 text-xs font-medium">{t("mct.uploadDocs")}</p>
            <input ref={docsRef} type="file" accept="image/*,application/pdf" multiple className="text-xs" />
          </div>
        ) : point.media_type === "photo_pair" ? (
          <div className="grid grid-cols-2 gap-2">
            <CaptureTile
              label={t("mct.ignitionOn")}
              file={primaryFile}
              icon={Camera}
              onClick={() => setCapture({ slot: "primary", mode: "photo" })}
            />
            <CaptureTile
              label={t("mct.engineRunning")}
              file={secondaryFile}
              icon={Camera}
              onClick={() => setCapture({ slot: "secondary", mode: "photo" })}
            />
          </div>
        ) : (
          <CaptureTile
            label={captureMode === "video" ? t("mct.film") : t("mct.takePhoto")}
            file={primaryFile}
            icon={captureMode === "video" ? Video : Camera}
            onClick={() => setCapture({ slot: "primary", mode: captureMode })}
            full
          />
        )}

        {result && result.suspicious.length > 0 && (
          <div className="rounded-md border border-risk-moderate/40 bg-risk-moderate/10 p-2 text-xs text-risk-moderate">
            {result.suspicious.join(" · ")}
          </div>
        )}
        {error && <p className="text-sm text-destructive">{error}</p>}

        <div className="flex gap-2">
          <Button size="sm" onClick={save} disabled={saving}>
            {result ? <CheckCircle2 className="size-4" /> : <Upload className="size-4" />}
            {saving ? t("ui.saving") : result ? t("mct.update") : t("mct.saveCheck")}
          </Button>
          <Button size="sm" variant="ghost" onClick={skip} disabled={saving}>
            {point.required ? t("mct.cantDo") : t("ui.skip")}
          </Button>
        </div>
      </CardContent>

      {capture && (
        <MediaCapture
          mode={capture.mode}
          title={`${point.order_index}. ${loc.title}`}
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
  const { t } = useI18n();
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
        <span className="block font-medium text-[#111827]">{file ? t("mct.captured") : label}</span>
        {!file && <span className="block text-xs text-muted-foreground">{t("mct.tapOpenCamera")}</span>}
      </span>
    </button>
  );
}
