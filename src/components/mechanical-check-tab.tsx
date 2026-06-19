"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Camera,
  CheckCircle2,
  CheckCircle,
  FileText,
  Info,
  Plus,
  Upload,
  Video,
  Wrench,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DisclaimerBanner } from "@/components/disclaimer-banner";
import { RiskScoreCircle } from "@/components/risk-indicators";
import { CaptureGuide, hasCaptureGuide } from "@/components/capture-guide";
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
  locked = false,
}: {
  sessionId: string;
  initialItems: MechanicalCheckItem[];
  mechanicalScore: number | null;
  mechanicalRisk: string | null;
  locked?: boolean;
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
          locked={locked}
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
  locked = false,
}: {
  sessionId: string;
  point: MechanicalPoint;
  initial: MechanicalCheckItem | null;
  locked?: boolean;
}) {
  const { locale, t } = useI18n();
  const router = useRouter();
  const loc = localizedMechPoint(point, locale);
  const docsRef = useRef<HTMLInputElement>(null);

  // Captured media (in-app camera/mic).
  const [primaryFile, setPrimaryFile] = useState<File | null>(null);
  const [secondaryFile, setSecondaryFile] = useState<File | null>(null);
  const camRef = useRef<HTMLInputElement>(null);
  const libRef = useRef<HTMLInputElement>(null);
  const slotRef = useRef<"primary" | "secondary">("primary");
  function openCapture(slot: "primary" | "secondary", source: "cam" | "lib") {
    slotRef.current = slot;
    (source === "cam" ? camRef : libRef).current?.click();
  }
  function onCaptured(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (f) (slotRef.current === "primary" ? setPrimaryFile : setSecondaryFile)(f);
    e.target.value = "";
  }

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ score: number; severity: Severity; suspicious: string[]; summary: string | null } | null>(
    initial?.score != null
      ? {
          score: initial.score,
          severity: (initial.severity ?? "none") as Severity,
          suspicious: initial.ai_analysis?.suspicious_observations ?? [],
          summary: initial.ai_analysis?.summary ?? null,
        }
      : null,
  );
  const [skipped, setSkipped] = useState(initial?.quality_status === "skipped");

  // Maintenance "docs" check: accumulate several photos/files incrementally
  // (the native multi-file input can't add more after the first selection,
  // especially when capturing one photo at a time on mobile).
  const [docFiles, setDocFiles] = useState<{ file: File; url: string | null }[]>([]);
  function addDocs(list: FileList | null) {
    if (!list || !list.length) return;
    const next = Array.from(list).map((f) => ({
      file: f,
      url: f.type.startsWith("image/") ? URL.createObjectURL(f) : null,
    }));
    setDocFiles((prev) => [...prev, ...next]);
  }
  function removeDoc(i: number) {
    setDocFiles((prev) => {
      const u = prev[i]?.url;
      if (u) URL.revokeObjectURL(u);
      return prev.filter((_, idx) => idx !== i);
    });
  }
  function clearDocs() {
    setDocFiles((prev) => {
      prev.forEach((d) => d.url && URL.revokeObjectURL(d.url));
      return [];
    });
  }

  async function save() {
    setSaving(true);
    setError(null);
    let data: { analysis: { score: number; severity: Severity; suspicious_observations?: string[]; summary?: string | null }; error?: string };
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
      if (primaryFile) {
        payload.primary_path = await upImg(primaryFile, "");
        // Video checks: the full clip (with its soundtrack) is sent to the
        // media model server-side, so just pass along the MIME type.
        payload.primary_mime = primaryFile.type;
      }
      if (secondaryFile) payload.secondary_path = await upImg(secondaryFile, "-2");
      if (point.media_type === "docs") {
        const docPaths: string[] = [];
        for (let i = 0; i < docFiles.length; i++) docPaths.push(await upImg(docFiles[i].file, `-doc${i}`));
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
      summary: data.analysis.summary ?? null,
    });
    clearDocs();
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

  const captureMode =
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

        {!locked && hasCaptureGuide(point.code) && (
          <div className="mx-auto w-40 sm:w-48">
            <CaptureGuide code={point.code} />
          </div>
        )}

        {/* Media capture — hidden once the report is generated (read-only). */}
        {!locked && (point.media_type === "docs" ? (
          <div>
            <p className="mb-2 text-xs font-medium">{t("mct.uploadDocs")}</p>
            <input
              ref={docsRef}
              type="file"
              accept="image/*,application/pdf"
              multiple
              hidden
              onChange={(e) => {
                addDocs(e.target.files);
                e.target.value = "";
              }}
            />
            <div className="flex flex-wrap gap-2">
              {docFiles.map((d, i) => (
                <div key={i} className="relative size-16 overflow-hidden rounded-lg border border-[#E5E7EB] bg-secondary">
                  {d.url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={d.url} alt="" className="size-full object-cover" />
                  ) : (
                    <span className="flex size-full items-center justify-center text-[#6B7280]">
                      <FileText className="size-6" />
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => removeDoc(i)}
                    aria-label={t("ui.skip")}
                    className="absolute right-0.5 top-0.5 flex size-5 items-center justify-center rounded-full bg-black/60 text-white"
                  >
                    <X className="size-3" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => docsRef.current?.click()}
                className="flex size-16 flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-[#E5E7EB] text-[#6B7280] transition-colors hover:bg-secondary"
              >
                <Plus className="size-5" />
                <span className="text-[10px] font-medium">{t("mct.addDocs")}</span>
              </button>
            </div>
            {docFiles.length > 0 && (
              <p className="mt-1.5 text-xs text-muted-foreground">
                {docFiles.length} {t("mct.docsSelected")}
              </p>
            )}
          </div>
        ) : point.media_type === "photo_pair" ? (
          <div className="grid grid-cols-2 gap-2">
            <CaptureTile
              label={t("mct.ignitionOn")}
              file={primaryFile}
              icon={Camera}
              onClick={() => openCapture("primary", "cam")}
            />
            <CaptureTile
              label={t("mct.engineRunning")}
              file={secondaryFile}
              icon={Camera}
              onClick={() => openCapture("secondary", "cam")}
            />
          </div>
        ) : (
          <CaptureTile
            label={captureMode === "video" ? t("mct.film") : t("mct.takePhoto")}
            file={primaryFile}
            icon={captureMode === "video" ? Video : Camera}
            onClick={() => openCapture("primary", "cam")}
            full
          />
        ))}

        {!locked && point.media_type !== "docs" && (
          <>
            <input
              ref={camRef}
              type="file"
              accept={captureMode === "video" ? "video/*" : "image/*"}
              hidden
              onChange={onCaptured}
            />
            <input
              ref={libRef}
              type="file"
              accept={captureMode === "video" ? "video/*" : "image/*"}
              hidden
              onChange={onCaptured}
            />
            <button
              type="button"
              onClick={() => openCapture("primary", "lib")}
              className="flex w-full items-center justify-center gap-1.5 py-1.5 text-xs font-medium text-muted-foreground"
            >
              <Upload className="size-3.5" aria-hidden /> {t("cap.useUpload")}
            </button>
          </>
        )}

        {result?.summary && (
          <div
            className={cn(
              "rounded-md border p-2 text-xs",
              ["moderate", "high", "critical"].includes(result.severity)
                ? "border-risk-moderate/40 bg-risk-moderate/10 text-risk-moderate"
                : "border-risk-low/40 bg-risk-low/10 text-muted-foreground",
            )}
          >
            {result.summary}
          </div>
        )}
        {error && <p className="text-sm text-destructive">{error}</p>}

        {!locked && (
          <div className="flex gap-2">
            <Button size="sm" onClick={save} disabled={saving}>
              {result ? <CheckCircle2 className="size-4" /> : <Upload className="size-4" />}
              {saving ? t("ui.saving") : result ? t("mct.update") : t("mct.saveCheck")}
            </Button>
            <Button size="sm" variant="ghost" onClick={skip} disabled={saving}>
              {point.required ? t("mct.cantDo") : t("ui.skip")}
            </Button>
          </div>
        )}
      </CardContent>
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
