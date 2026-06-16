"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Camera,
  CheckCircle2,
  ChevronRight,
  RefreshCw,
  Sparkles,
  Video,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MediaCapture, type CaptureMode } from "@/components/media-capture";
import { AnalyzingOverlay } from "@/components/analyzing-overlay";
import {
  INSPECTION_GOAL_OPTIONS,
  PHOTO_POINTS,
  SELLER_TYPE_OPTIONS,
  STORAGE_BUCKETS,
} from "@/lib/constants";
import {
  catalogYears,
  FUEL_OPTIONS,
  MILEAGE_BRACKETS,
  POPULAR_MAKES,
  PRICE_BRACKETS,
  TRANSMISSION_OPTIONS,
} from "@/lib/vehicle-catalog";
import { MECHANICAL_POINTS } from "@/lib/mechanical";
import { compressImage, fileExt, getUserId, uploadToStorage } from "@/lib/upload";
import { toast } from "@/lib/toast";
import { useI18n } from "@/components/i18n-provider";
import { localizedMechPoint, localizedPhotoPoint } from "@/lib/content-i18n";
import { cn } from "@/lib/utils";
import type { MechanicalPoint, PhotoPointCode } from "@/types";

type Phase = "vehicle" | "photos" | "mech" | "review" | "finishing";

type VKind = "vin" | "make" | "year" | "model" | "select" | "range";
interface VStepDef {
  kind: VKind;
  key?: string;
  question?: string;
  required?: boolean;
  options?: readonly { value: string; label: string }[];
  ranges?: { value: number; label: string }[];
}

const VEHICLE_STEPS: VStepDef[] = [
  { kind: "vin" },
  { kind: "make", required: true },
  { kind: "year", required: true },
  { kind: "model", required: true },
  { kind: "select", key: "fuel_type", question: "Fuel / engine type?", options: FUEL_OPTIONS },
  { kind: "select", key: "transmission", question: "Transmission?", options: TRANSMISSION_OPTIONS },
  { kind: "range", key: "mileage", question: "What's the mileage?", ranges: MILEAGE_BRACKETS },
  { kind: "range", key: "asking_price", question: "What's the asking price?", ranges: PRICE_BRACKETS },
  { kind: "select", key: "seller_type", question: "Who is selling it?", options: SELLER_TYPE_OPTIONS },
  { kind: "select", key: "goal", question: "What do you want to check?", options: INSPECTION_GOAL_OPTIONS },
];

// Resume payload for an in-progress inspection.
export interface WizardResume {
  sessionId: string;
  vehicle: Record<string, string>;
  photoStatuses: Record<string, string>;
  photoUrls?: Record<string, string | null>;
  mechDoneCodes: string[];
}

function resumeStart(r: WizardResume): { phase: Phase; pIndex: number; mIndex: number } {
  const firstPhoto = PHOTO_POINTS.findIndex(
    (p) => !["passed", "skipped"].includes(r.photoStatuses[p.code] ?? ""),
  );
  if (firstPhoto !== -1) return { phase: "photos", pIndex: firstPhoto, mIndex: 0 };
  const firstMech = MECHANICAL_POINTS.findIndex((p) => !r.mechDoneCodes.includes(p.code));
  if (firstMech !== -1)
    return { phase: "mech", pIndex: PHOTO_POINTS.length - 1, mIndex: firstMech };
  return { phase: "review", pIndex: PHOTO_POINTS.length - 1, mIndex: MECHANICAL_POINTS.length - 1 };
}

export function InspectionWizard({ resume }: { resume?: WizardResume } = {}) {
  const router = useRouter();
  const { t, locale } = useI18n();
  const init = resume ? resumeStart(resume) : null;

  const [phase, setPhase] = useState<Phase>(init ? init.phase : "vehicle");
  const [vIndex, setVIndex] = useState(resume ? VEHICLE_STEPS.length - 1 : 0);
  const [vehicle, setVehicle] = useState<Record<string, string>>(resume?.vehicle ?? {});
  const [sessionId, setSessionId] = useState<string | null>(resume?.sessionId ?? null);

  const [pIndex, setPIndex] = useState(init ? init.pIndex : 0);
  const [photoState, setPhotoState] = useState<Record<string, { status: string; url: string | null }>>(
    () => {
      if (!resume) return {};
      const m: Record<string, { status: string; url: string | null }> = {};
      for (const code of Object.keys(resume.photoStatuses)) {
        m[code] = { status: resume.photoStatuses[code], url: resume.photoUrls?.[code] ?? null };
      }
      return m;
    },
  );

  const [mIndex, setMIndex] = useState(init ? init.mIndex : 0);

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [capture, setCapture] = useState<CaptureMode | null>(null);

  const vehicleStepCount = VEHICLE_STEPS.length;
  // Engine & mechanical is mandatory — always part of the flow.
  const total =
    vehicleStepCount + PHOTO_POINTS.length + MECHANICAL_POINTS.length + 1;

  const stepNumber = useMemo(() => {
    switch (phase) {
      case "vehicle":
        return vIndex;
      case "photos":
        return vehicleStepCount + pIndex;
      case "mech":
        return vehicleStepCount + PHOTO_POINTS.length + mIndex;
      case "review":
      case "finishing":
        return total - 1;
    }
  }, [phase, vIndex, pIndex, mIndex, vehicleStepCount, total]);

  const progress = Math.round(((stepNumber + 1) / total) * 100);

  function setField(key: string, value: string) {
    setVehicle((v) => ({ ...v, [key]: value }));
  }

  // ---- Navigation -------------------------------------------------
  function back() {
    setError(null);
    if (phase === "vehicle") {
      if (vIndex === 0) router.push("/dashboard");
      else setVIndex((i) => i - 1);
    } else if (phase === "photos") {
      if (pIndex === 0) {
        setPhase("vehicle");
        setVIndex(vehicleStepCount - 1);
      } else setPIndex((i) => i - 1);
    } else if (phase === "mech") {
      if (mIndex === 0) {
        setPhase("photos");
        setPIndex(PHOTO_POINTS.length - 1);
      } else setMIndex((i) => i - 1);
    } else if (phase === "review") {
      setPhase("mech");
      setMIndex(MECHANICAL_POINTS.length - 1);
    }
  }

  async function createSessionAndStartPhotos() {
    if (sessionId) {
      setPhase("photos");
      setPIndex(0);
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/inspections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...vehicle, goal: vehicle.goal }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not start the inspection.");
      setSessionId(data.sessionId);
      setPhase("photos");
      setPIndex(0);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Something went wrong.";
      setError(msg);
      toast.error(msg);
    } finally {
      setBusy(false);
    }
  }

  function nextVehicle() {
    if (vIndex < vehicleStepCount - 1) {
      setVIndex((i) => i + 1);
    } else {
      createSessionAndStartPhotos();
    }
  }

  function nextPhoto() {
    if (pIndex < PHOTO_POINTS.length - 1) setPIndex((i) => i + 1);
    else {
      setPhase("mech");
      setMIndex(0);
    }
  }

  function nextMech() {
    if (mIndex < MECHANICAL_POINTS.length - 1) setMIndex((i) => i + 1);
    else setPhase("review");
  }

  // ---- Uploads ----------------------------------------------------
  async function uploadPhoto(code: PhotoPointCode, file: File) {
    if (!sessionId) return;
    setBusy(true);
    setError(null);
    try {
      const userId = await getUserId();
      if (!userId) throw new Error("Please sign in again.");
      const compressed = await compressImage(file);
      const path = `${userId}/${sessionId}/${code}.jpg`;
      await uploadToStorage(STORAGE_BUCKETS.inspectionPhotos, path, compressed);

      const res = await fetch(`/api/inspections/${sessionId}/photos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          photo_point_code: code,
          storage_path: path,
          original_file_name: file.name,
          mime_type: compressed.type,
          file_size: compressed.size,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Upload failed.");
      const status = data.photo.quality_status as string;
      setPhotoState((s) => ({ ...s, [code]: { status, url: data.imageUrl ?? data.photo.image_url } }));
      if (status === "passed") toast.success("Photo looks good.");
      else if (status === "needs_retake") toast.error("This photo needs a retake.");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Upload failed.";
      setError(msg);
      toast.error(msg);
    } finally {
      setBusy(false);
    }
  }

  async function skipPhoto(code: PhotoPointCode) {
    if (!sessionId) return;
    await fetch(`/api/inspections/${sessionId}/photos`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ photo_point_code: code }),
    });
    setPhotoState((s) => ({ ...s, [code]: { status: "skipped", url: null } }));
    nextPhoto();
  }

  async function finish() {
    if (!sessionId) return;
    setPhase("finishing");
    setError(null);
    try {
      const a = await fetch(`/api/inspections/${sessionId}/analyze`, { method: "POST" });
      const ad = await a.json();
      if (!a.ok) throw new Error(ad.error ?? "Analysis failed.");
      const r = await fetch(`/api/inspections/${sessionId}/report`, { method: "POST" });
      const rd = await r.json();
      if (!r.ok) throw new Error(rd.error ?? "Could not generate the report.");
      toast.success("Your report is ready.");
      router.push(`/inspections/${sessionId}/report?generated=1`);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Something went wrong.";
      setError(msg);
      toast.error(msg);
      setPhase("review");
    }
  }

  const passedCount = PHOTO_POINTS.filter((p) => photoState[p.code]?.status === "passed").length;

  return (
    <div className="flex min-h-[calc(100vh-7rem)] flex-col px-5 pt-4">
      {phase === "finishing" && <AnalyzingOverlay label={t("wiz.building")} />}

      {/* Top bar: progress + close */}
      <div className="mb-6 flex items-center gap-3">
        <button onClick={back} aria-label="Back" className="text-[#6B7280]">
          {phase === "vehicle" && vIndex === 0 ? <X className="size-6" /> : <ArrowLeft className="size-6" />}
        </button>
        <div className="h-2 flex-1 overflow-hidden rounded-full bg-[#F2F3F5]">
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{ width: `${progress}%`, backgroundImage: "linear-gradient(90deg,#FF2A2A,#E50914)" }}
          />
        </div>
        <span className="w-12 text-right text-xs font-medium text-[#6B7280]">
          {Math.min(stepNumber + 1, total)}/{total}
        </span>
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col">
        {phase === "vehicle" && (
          <VehicleStep
            vIndex={vIndex}
            vehicle={vehicle}
            setField={setField}
            onAutoFill={(data) => setVehicle((v) => ({ ...v, ...data }))}
            onPick={(updates) => {
              setVehicle((v) => ({ ...v, ...updates }));
              nextVehicle();
            }}
          />
        )}

        {phase === "photos" && (() => {
          const lp = localizedPhotoPoint(PHOTO_POINTS[pIndex], locale);
          return (
            <CaptureStep
              kicker={`${t("wiz.photo")} ${pIndex + 1} / ${PHOTO_POINTS.length}`}
              title={lp.title}
              instruction={lp.instruction}
              why={lp.why}
              previewUrl={photoState[PHOTO_POINTS[pIndex].code]?.url ?? null}
              status={photoState[PHOTO_POINTS[pIndex].code]?.status ?? "pending"}
              busy={busy}
              mode="photo"
              onOpenCapture={() => setCapture("photo")}
            />
          );
        })()}

        {phase === "mech" && (
          <MechStep
            point={MECHANICAL_POINTS[mIndex]}
            busy={busy}
            onOpenCapture={(m) => setCapture(m)}
            onSaved={nextMech}
            sessionId={sessionId!}
            setBusy={setBusy}
          />
        )}

        {phase === "review" && (
          <div className="flex flex-1 flex-col items-center justify-center text-center">
            <span className="mb-4 flex size-16 items-center justify-center rounded-2xl bg-risk-low/15 text-risk-low">
              <CheckCircle2 className="size-8" aria-hidden />
            </span>
            <h2 className="text-2xl font-extrabold text-[#111827]">{t("wiz.allSet")}</h2>
            <p className="mt-3 max-w-xs text-sm text-[#6B7280]">
              {passedCount} {t("wiz.reviewBody")}
            </p>
          </div>
        )}

        {error && <p className="mt-4 text-center text-sm text-destructive">{error}</p>}
      </div>

      {/* Footer actions */}
      <div className="sticky bottom-0 -mx-5 mt-4 border-t border-[#EFEFEF] bg-white/90 px-5 py-4 backdrop-blur">
        <Footer
          phase={phase}
          vehicle={vehicle}
          vIndex={vIndex}
          busy={busy}
          photoStatus={phase === "photos" ? photoState[PHOTO_POINTS[pIndex].code]?.status ?? "pending" : undefined}
          onVehicleNext={nextVehicle}
          onPhotoNext={nextPhoto}
          onPhotoSkip={() => skipPhoto(PHOTO_POINTS[pIndex].code)}
          onFinish={finish}
        />
      </div>

      {/* Capture modal */}
      {capture && (
        <MediaCapture
          mode={capture}
          title={
            phase === "photos"
              ? localizedPhotoPoint(PHOTO_POINTS[pIndex], locale).title
              : MECHANICAL_POINTS[mIndex]
                ? localizedMechPoint(MECHANICAL_POINTS[mIndex], locale).title
                : "Capture"
          }
          onClose={() => setCapture(null)}
          onCapture={(file) => {
            if (phase === "photos") uploadPhoto(PHOTO_POINTS[pIndex].code, file);
            // mech capture handled inside MechStep via window event
            else window.dispatchEvent(new CustomEvent("mech-capture", { detail: file }));
          }}
        />
      )}
    </div>
  );
}

// ---------------------------------------------------------------------
function VehicleStep({
  vIndex,
  vehicle,
  setField,
  onAutoFill,
  onPick,
}: {
  vIndex: number;
  vehicle: Record<string, string>;
  setField: (k: string, v: string) => void;
  onAutoFill: (data: Record<string, string>) => void;
  onPick: (updates: Record<string, string>) => void;
}) {
  const { t, currency, unit } = useI18n();
  const step = VEHICLE_STEPS[vIndex];

  if (step.kind === "vin") return <VinStep vehicle={vehicle} setField={setField} onAutoFill={onAutoFill} />;

  if (step.kind === "make") {
    return (
      <StepShell kicker={t("wiz.vehicle")} question={t("veh.q.make")}>
        <SearchableList
          options={POPULAR_MAKES}
          current={vehicle.make}
          onPick={(make) => onPick({ make })}
          placeholder={t("wiz.searchMake")}
        />
      </StepShell>
    );
  }

  if (step.kind === "year") {
    return (
      <StepShell kicker={t("wiz.vehicle")} question={t("veh.q.year")}>
        <div className="grid max-h-[55vh] grid-cols-3 gap-2 overflow-y-auto">
          {catalogYears().map((y) => {
            const active = vehicle.year === String(y);
            return (
              <button
                key={y}
                type="button"
                onClick={() => onPick({ year: String(y) })}
                className={cn(
                  "rounded-xl border py-3 text-sm font-medium transition-colors",
                  active ? "border-[#E50914] bg-[rgba(229,9,20,0.06)] text-[#E50914]" : "border-[#E5E7EB] hover:bg-secondary",
                )}
              >
                {y}
              </button>
            );
          })}
        </div>
      </StepShell>
    );
  }

  if (step.kind === "model") {
    return (
      <StepShell kicker={t("wiz.vehicle")} question={t("veh.q.model")}>
        <ModelStep
          make={vehicle.make}
          year={vehicle.year}
          current={vehicle.model}
          onPick={(model) => onPick({ model })}
        />
      </StepShell>
    );
  }

  // select / range → tappable option list
  const opts =
    step.kind === "range"
      ? step.ranges!.map((r) => ({ value: String(r.value), label: r.label }))
      : step.options!;
  const questionSuffix =
    step.kind === "range"
      ? step.key === "asking_price"
        ? ` (${currency})`
        : ` (${unit})`
      : "";
  const optGroup =
    step.key === "fuel_type"
      ? "fuel"
      : step.key === "transmission"
        ? "transmission"
        : step.key === "seller_type"
          ? "seller"
          : step.key === "goal"
            ? "goal"
            : null;
  return (
    <StepShell kicker={t("wiz.vehicle")} question={`${t(`veh.q.${step.key}`)}${questionSuffix}`}>
      <div className="space-y-2">
        {opts.map((o) => {
          const active = vehicle[step.key!] === o.value;
          const label = optGroup ? t(`opt.${optGroup}.${o.value}`) : o.label;
          return (
            <button
              key={o.value}
              type="button"
              onClick={() => onPick({ [step.key!]: o.value })}
              className={cn(
                "flex w-full items-center justify-between rounded-xl border p-4 text-left text-sm transition-colors",
                active ? "border-[#E50914] bg-[rgba(229,9,20,0.05)]" : "border-[#E5E7EB] hover:bg-secondary",
              )}
            >
              {label}
              {active && <CheckCircle2 className="size-5 text-[#E50914]" aria-hidden />}
            </button>
          );
        })}
        {step.kind === "range" && (
          <ExactAmount
            kind={step.key === "asking_price" ? "price" : "mileage"}
            onSubmit={(value) => onPick({ [step.key!]: String(value) })}
          />
        )}
      </div>
    </StepShell>
  );
}

// "Enter the exact amount" expandable entry shown under range options.
function ExactAmount({
  kind,
  onSubmit,
}: {
  kind: "price" | "mileage";
  onSubmit: (value: number) => void;
}) {
  const { t, currency, unit } = useI18n();
  const [open, setOpen] = useState(false);
  const [val, setVal] = useState("");
  const symbol = currency === "EUR" ? "€" : "$";

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex w-full items-center justify-center gap-1 rounded-xl border border-dashed border-[#E5E7EB] p-3 text-sm font-medium text-[#6B7280]"
      >
        {t("wiz.enterExact")}
      </button>
    );
  }

  const n = Number(val.replace(/[^\d]/g, ""));
  return (
    <div className="rounded-xl border border-[#E5E7EB] p-3">
      <div className="flex items-center gap-2">
        {kind === "price" && <span className="text-sm text-[#6B7280]">{symbol}</span>}
        <Input
          autoFocus
          inputMode="numeric"
          value={val}
          onChange={(e) => setVal(e.target.value)}
          placeholder={kind === "price" ? "e.g. 13500" : "e.g. 86250"}
          className="h-12 text-base"
          onKeyDown={(e) => {
            if (e.key === "Enter" && n > 0) onSubmit(n);
          }}
        />
        {kind === "mileage" && <span className="text-sm text-[#6B7280]">{unit}</span>}
      </div>
      <Button className="mt-3 w-full" onClick={() => n > 0 && onSubmit(n)} disabled={n <= 0}>
        {t("wiz.useAmount")}
      </Button>
    </div>
  );
}

function VinStep({
  vehicle,
  setField,
  onAutoFill,
}: {
  vehicle: Record<string, string>;
  setField: (k: string, v: string) => void;
  onAutoFill: (data: Record<string, string>) => void;
}) {
  const { t } = useI18n();
  const [looking, setLooking] = useState(false);
  const [vinMsg, setVinMsg] = useState<string | null>(null);

  async function autofill() {
    if (!vehicle.vin?.trim()) return;
    setLooking(true);
    setVinMsg(null);
    const res = await fetch(`/api/vehicle-lookup?q=${encodeURIComponent(vehicle.vin.trim())}`);
    const d = await res.json();
    setLooking(false);
    if (d.ok && d.data) {
      const data: Record<string, string> = {};
      for (const k of ["make", "model", "year", "trim", "engine", "fuel_type", "transmission"]) {
        if (d.data[k] != null) data[k] = String(d.data[k]);
      }
      onAutoFill(data);
      setVinMsg(`Pre-filled from ${d.data.source}. Tap Continue to review.`);
      toast.success("Vehicle details pre-filled.");
    } else {
      setVinMsg(d.message ?? "No match — you can pick the details manually.");
    }
  }

  return (
    <StepShell kicker={t("wiz.vehicle")} question={t("veh.q.vin")} helper={t("wiz.vinHelper")}>
      <Input
        autoFocus
        placeholder={t("wiz.vinPlaceholder")}
        value={vehicle.vin ?? ""}
        onChange={(e) => setField("vin", e.target.value)}
        className="h-14 text-base"
      />
      <Button type="button" variant="accent" className="mt-3 w-full" onClick={autofill} disabled={looking}>
        <Sparkles className="size-4" /> {looking ? t("wiz.looking") : t("wiz.autofill")}
      </Button>
      {vinMsg && <p className="mt-2 text-xs text-[#6B7280]">{vinMsg}</p>}
    </StepShell>
  );
}

function ModelStep({
  make,
  year,
  current,
  onPick,
}: {
  make?: string;
  year?: string;
  current?: string;
  onPick: (model: string) => void;
}) {
  const { t } = useI18n();
  const [models, setModels] = useState<string[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    setModels(null);
    const params = new URLSearchParams();
    if (make) params.set("make", make);
    if (year) params.set("year", year);
    fetch(`/api/vehicle-catalog?${params.toString()}`)
      .then((r) => r.json())
      .then((d) => !cancelled && setModels(Array.isArray(d.models) ? d.models : []))
      .catch(() => !cancelled && setModels([]));
    return () => {
      cancelled = true;
    };
  }, [make, year]);

  if (models === null) {
    return (
      <div className="flex items-center gap-2 py-8 text-sm text-[#6B7280]">
        <RefreshCw className="size-4 animate-spin" /> {t("wiz.loadingModels")} {make} {year}…
      </div>
    );
  }

  return (
    <SearchableList
      options={models}
      current={current}
      onPick={onPick}
      placeholder={t("wiz.searchModel")}
      emptyHint={t("wiz.noModels")}
    />
  );
}

// Searchable, tappable list with an "use typed value" fallback.
function SearchableList({
  options,
  current,
  onPick,
  placeholder,
  emptyHint,
}: {
  options: string[];
  current?: string;
  onPick: (value: string) => void;
  placeholder: string;
  emptyHint?: string;
}) {
  const { t } = useI18n();
  const [q, setQ] = useState("");
  const filtered = q.trim()
    ? options.filter((o) => o.toLowerCase().includes(q.trim().toLowerCase()))
    : options;
  const exact = options.some((o) => o.toLowerCase() === q.trim().toLowerCase());

  return (
    <div>
      <Input
        autoFocus
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder={placeholder}
        className="h-12 text-base"
      />
      <div className="mt-3 max-h-[48vh] space-y-2 overflow-y-auto">
        {filtered.map((o) => {
          const active = current === o;
          return (
            <button
              key={o}
              type="button"
              onClick={() => onPick(o)}
              className={cn(
                "flex w-full items-center justify-between rounded-xl border p-3.5 text-left text-sm transition-colors",
                active ? "border-[#E50914] bg-[rgba(229,9,20,0.05)]" : "border-[#E5E7EB] hover:bg-secondary",
              )}
            >
              {o}
              {active && <CheckCircle2 className="size-5 text-[#E50914]" aria-hidden />}
            </button>
          );
        })}
        {q.trim() && !exact && (
          <button
            type="button"
            onClick={() => onPick(q.trim())}
            className="flex w-full items-center gap-2 rounded-xl border border-dashed border-[#E5E7EB] p-3.5 text-left text-sm text-[#E50914]"
          >
            <ChevronRight className="size-4" /> {t("wiz.use")} « {q.trim()} »
          </button>
        )}
        {filtered.length === 0 && !q.trim() && emptyHint && (
          <p className="py-4 text-center text-sm text-[#6B7280]">{emptyHint}</p>
        )}
      </div>
    </div>
  );
}

function CaptureStep({
  kicker,
  title,
  instruction,
  why,
  previewUrl,
  status,
  busy,
  onOpenCapture,
}: {
  kicker: string;
  title: string;
  instruction: string;
  why: string;
  previewUrl: string | null;
  status: string;
  busy: boolean;
  mode: CaptureMode;
  onOpenCapture: () => void;
}) {
  const { t } = useI18n();
  return (
    <StepShell kicker={kicker} question={title}>
      <p className="text-sm text-[#374151]">{instruction}</p>
      <p className="mt-2 rounded-lg bg-accent/5 p-3 text-xs text-[#6B7280]">
        <strong className="text-[#111827]">{t("wiz.whyItMatters")}</strong>
        {why}
      </p>

      <button
        type="button"
        onClick={onOpenCapture}
        disabled={busy}
        className="relative mt-4 flex aspect-video w-full items-center justify-center overflow-hidden rounded-2xl border border-dashed border-[#E5E7EB] bg-[#F7F8FA]"
      >
        {previewUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={previewUrl} alt={title} className="h-full w-full object-cover" />
        ) : (
          <span className="flex flex-col items-center gap-2 text-[#9AA3AF]">
            <Camera className="size-10" aria-hidden />
            <span className="text-sm font-medium">{t("wiz.tapCamera")}</span>
          </span>
        )}
        {busy && (
          <span className="absolute inset-0 flex items-center justify-center bg-white/70">
            <RefreshCw className="size-6 animate-spin text-[#E50914]" aria-hidden />
          </span>
        )}
      </button>

      {status === "passed" && (
        <p className="mt-2 flex items-center gap-1 text-sm text-risk-low">
          <CheckCircle2 className="size-4" /> {t("wiz.looksGood")}
        </p>
      )}
      {status === "needs_retake" && (
        <p className="mt-2 text-sm text-risk-moderate">{t("wiz.needsRetake")}</p>
      )}
    </StepShell>
  );
}

function MechStep({
  point,
  busy,
  onOpenCapture,
  onSaved,
  sessionId,
  setBusy,
}: {
  point: MechanicalPoint;
  busy: boolean;
  onOpenCapture: (mode: CaptureMode) => void;
  onSaved: () => void;
  sessionId: string;
  setBusy: (b: boolean) => void;
}) {
  const { t, locale } = useI18n();
  const L = localizedMechPoint(point, locale);
  const [file, setFile] = useState<File | null>(null);

  // Receive the captured file from the parent's MediaCapture.
  useEffect(() => {
    function onCap(e: Event) {
      setFile((e as CustomEvent).detail as File);
    }
    window.addEventListener("mech-capture", onCap);
    return () => window.removeEventListener("mech-capture", onCap);
  }, []);

  async function save() {
    setBusy(true);
    try {
      let primary_path: string | undefined;
      if (file) {
        const userId = await getUserId();
        if (!userId) throw new Error("Please sign in again.");
        const isImg = file.type.startsWith("image/");
        const f = isImg ? await compressImage(file) : file;
        primary_path = `${userId}/${sessionId}/${point.code}.${fileExt(f)}`;
        await uploadToStorage(STORAGE_BUCKETS.mechanical, primary_path, f);
      }
      const res = await fetch(`/api/inspections/${sessionId}/mechanical/${point.code}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ observations: {}, primary_path }),
      });
      if (!res.ok) throw new Error("save failed");
      setFile(null);
      onSaved();
    } catch {
      toast.error("Could not save this step.");
    } finally {
      setBusy(false);
    }
  }

  const captureMode: CaptureMode =
    point.media_type === "video" || point.media_type === "questionnaire" ? "video" : "photo";

  return (
    <StepShell kicker={`${t("wiz.engineCheck")} ${point.order_index}`} question={L.title}>
      <p className="text-sm text-[#374151]">{L.instruction}</p>
      <p className="mt-2 rounded-lg bg-accent/5 p-3 text-xs text-[#6B7280]">
        <strong className="text-[#111827]">{t("wiz.whyItMatters")}</strong>
        {L.why}
      </p>

      <button
        type="button"
        onClick={() => onOpenCapture(captureMode)}
        className={cn(
          "mt-4 flex w-full items-center gap-2 rounded-xl border border-dashed p-3 text-left text-sm",
          file ? "border-risk-low/50 bg-risk-low/5" : "border-[#E5E7EB]",
        )}
      >
        <span className={cn("flex size-9 items-center justify-center rounded-lg", file ? "bg-risk-low/15 text-risk-low" : "bg-[rgba(229,9,20,0.10)] text-[#E50914]")}>
          {file ? <CheckCircle2 className="size-5" /> : captureMode === "video" ? <Video className="size-5" /> : <Camera className="size-5" />}
        </span>
        <span className="font-medium text-[#111827]">
          {file ? t("wiz.captured") : captureMode === "video" ? t("wiz.film") : t("wiz.openCamera")}
        </span>
      </button>

      <Button className="mt-5 w-full" onClick={save} disabled={busy}>
        {busy ? t("wiz.saving") : t("wiz.saveContinue")}
      </Button>
      {!point.required && (
        <button
          type="button"
          onClick={onSaved}
          disabled={busy}
          className="mt-2 w-full py-2 text-sm font-medium text-[#6B7280]"
        >
          {t("wiz.skipStep")}
        </button>
      )}
    </StepShell>
  );
}

function StepShell({
  kicker,
  question,
  helper,
  children,
}: {
  kicker: string;
  question: string;
  helper?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-1 flex-col">
      <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-[#E50914]">{kicker}</div>
      <h2 className="text-2xl font-extrabold leading-tight text-[#111827]">{question}</h2>
      {helper && <p className="mt-2 text-sm text-[#6B7280]">{helper}</p>}
      <div className="mt-5">{children}</div>
    </div>
  );
}

function Footer({
  phase,
  vehicle,
  vIndex,
  busy,
  photoStatus,
  onVehicleNext,
  onPhotoNext,
  onPhotoSkip,
  onFinish,
}: {
  phase: Phase;
  vehicle: Record<string, string>;
  vIndex: number;
  busy: boolean;
  photoStatus?: string;
  onVehicleNext: () => void;
  onPhotoNext: () => void;
  onPhotoSkip: () => void;
  onFinish: () => void;
}) {
  const { t } = useI18n();
  if (phase === "vehicle") {
    if (busy) {
      return (
        <PrimaryButton onClick={() => {}} disabled loading>
          {t("wiz.starting")}
        </PrimaryButton>
      );
    }
    const step = VEHICLE_STEPS[vIndex];
    if (step.kind === "vin") {
      return (
        <PrimaryButton onClick={onVehicleNext}>
          {vehicle.vin?.trim() ? t("wiz.continue") : t("wiz.skipNoVin")}
        </PrimaryButton>
      );
    }
    // Option steps auto-advance on tap. Required → no button; optional → Skip.
    if (step.required) return null;
    return (
      <button
        type="button"
        onClick={onVehicleNext}
        className="w-full py-3 text-sm font-medium text-[#6B7280]"
      >
        {t("wiz.skip")}
      </button>
    );
  }
  if (phase === "photos") {
    const done = photoStatus === "passed";
    return (
      <div className="flex gap-2">
        <PrimaryButton onClick={onPhotoNext} disabled={!done || busy} className="flex-1">
          {t("wiz.continue")}
        </PrimaryButton>
        <Button variant="ghost" onClick={onPhotoSkip} disabled={busy}>
          {t("wiz.cantTake")}
        </Button>
      </div>
    );
  }
  if (phase === "review" || phase === "finishing") {
    return (
      <PrimaryButton onClick={onFinish} disabled={busy || phase === "finishing"} loading={phase === "finishing"}>
        {t("wiz.getReport")}
      </PrimaryButton>
    );
  }
  return null; // mech phase uses its own in-body Save button
}

function PrimaryButton({
  children,
  onClick,
  disabled,
  loading,
  className,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "flex h-14 items-center justify-center gap-2 rounded-2xl px-6 text-base font-semibold text-white transition-transform active:scale-[0.98] disabled:opacity-50",
        className,
      )}
      style={{ backgroundImage: "linear-gradient(135deg,#FF2A2A 0%,#E50914 45%,#B00008 100%)" }}
    >
      {loading ? <RefreshCw className="size-5 animate-spin" /> : <ChevronRight className="size-5" />}
      {children}
    </button>
  );
}
