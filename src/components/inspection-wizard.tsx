"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Camera,
  CheckCircle2,
  ChevronRight,
  Clock,
  FileText,
  Lock,
  Mic,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Square,
  TrendingDown,
  Upload,
  Video,
  X,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CaptureGuide, hasCaptureGuide } from "@/components/capture-guide";
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
  POPULAR_MAKES,
  TRANSMISSION_OPTIONS,
} from "@/lib/vehicle-catalog";
import { MECHANICAL_POINTS } from "@/lib/mechanical";
import { documentsForRegion } from "@/lib/documents";
import { INSPECTION_PACKS } from "@/lib/billing";
import { compressImage, fileExt, getUserId, uploadToStorage } from "@/lib/upload";
import { toast } from "@/lib/toast";
import { useI18n } from "@/components/i18n-provider";
import { localizedMechPoint, localizedPhotoPoint } from "@/lib/content-i18n";
import { cn } from "@/lib/utils";
import type { MechanicalPoint, PhotoPointCode } from "@/types";

type Phase = "vehicle" | "payment" | "photos" | "mech" | "audio" | "documents" | "review" | "finishing";
type CaptureMode = "photo" | "video";

type VKind = "vin" | "make" | "year" | "model" | "select" | "number";
interface VStepDef {
  kind: VKind;
  key?: string;
  question?: string;
  required?: boolean;
  options?: readonly { value: string; label: string }[];
}

const VEHICLE_STEPS: VStepDef[] = [
  { kind: "vin" },
  { kind: "make", required: true },
  { kind: "year", required: true },
  { kind: "model", required: true },
  { kind: "select", key: "fuel_type", question: "Fuel / engine type?", options: FUEL_OPTIONS },
  { kind: "select", key: "transmission", question: "Transmission?", options: TRANSMISSION_OPTIONS },
  { kind: "number", key: "mileage", question: "What's the mileage?" },
  { kind: "number", key: "asking_price", question: "What's the asking price?" },
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
  audioDone?: boolean;
}

// The manual questionnaire (everything except the VIN/plate entry). It is only
// required when the buyer has neither a VIN nor a licence plate.
const QUESTIONNAIRE_STEPS: VStepDef[] = VEHICLE_STEPS.filter((s) => s.kind !== "vin");

type VehicleStage = "entry" | "questionnaire" | "validation";

function resumeStart(r: WizardResume): {
  phase: Phase;
  pIndex: number;
  mIndex: number;
  vIndex: number;
  vehicleStage: VehicleStage;
} {
  const lastV = QUESTIONNAIRE_STEPS.length - 1;
  // Paid but the vehicle wasn't entered yet (payment now happens first) →
  // resume at the VIN/plate entry.
  if (!r.vehicle.make)
    return { phase: "vehicle", pIndex: 0, mIndex: 0, vIndex: 0, vehicleStage: "entry" };
  const firstPhoto = PHOTO_POINTS.findIndex(
    (p) => !["passed", "skipped"].includes(r.photoStatuses[p.code] ?? ""),
  );
  if (firstPhoto !== -1)
    return { phase: "photos", pIndex: firstPhoto, mIndex: 0, vIndex: lastV, vehicleStage: "validation" };
  const firstMech = MECHANICAL_POINTS.findIndex((p) => !r.mechDoneCodes.includes(p.code));
  if (firstMech !== -1)
    return { phase: "mech", pIndex: PHOTO_POINTS.length - 1, mIndex: firstMech, vIndex: lastV, vehicleStage: "validation" };
  // Mechanical done — the engine-sound step is mandatory, so resume there
  // until it's been provided or explicitly marked unavailable.
  if (!r.audioDone)
    return { phase: "audio", pIndex: PHOTO_POINTS.length - 1, mIndex: MECHANICAL_POINTS.length - 1, vIndex: lastV, vehicleStage: "validation" };
  return { phase: "review", pIndex: PHOTO_POINTS.length - 1, mIndex: MECHANICAL_POINTS.length - 1, vIndex: lastV, vehicleStage: "validation" };
}

export function InspectionWizard({ resume }: { resume?: WizardResume } = {}) {
  const router = useRouter();
  const { t, locale } = useI18n();
  const init = resume ? resumeStart(resume) : null;

  // Payment is the FIRST step (right after "Start an inspection"): the billable
  // plate/VIN lookup must only run on a paid inspection.
  const [phase, setPhase] = useState<Phase>(init ? init.phase : "payment");
  const [vIndex, setVIndex] = useState(init ? init.vIndex : 0);
  const [vehicleStage, setVehicleStage] = useState<VehicleStage>(
    init ? init.vehicleStage : "entry",
  );
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

  const vehicleStepCount = VEHICLE_STEPS.length;
  // Step 0 is payment; then vehicle questions, photos, mechanical, engine sound,
  // documents, review. Engine & mechanical + engine sound are mandatory.
  const total =
    1 + vehicleStepCount + PHOTO_POINTS.length + MECHANICAL_POINTS.length + 3;

  const stepNumber = useMemo(() => {
    const afterMech = 1 + vehicleStepCount + PHOTO_POINTS.length + MECHANICAL_POINTS.length;
    switch (phase) {
      case "payment":
        return 0;
      case "vehicle":
        if (vehicleStage === "entry") return 1;
        if (vehicleStage === "validation") return vehicleStepCount;
        return Math.min(2 + vIndex, vehicleStepCount); // questionnaire
      case "photos":
        return 1 + vehicleStepCount + pIndex;
      case "mech":
        return 1 + vehicleStepCount + PHOTO_POINTS.length + mIndex;
      case "audio":
        return afterMech;
      case "documents":
        return afterMech + 1;
      case "review":
      case "finishing":
        return total - 1;
    }
  }, [phase, vehicleStage, vIndex, pIndex, mIndex, vehicleStepCount, total]);

  const progress = Math.round(((stepNumber + 1) / total) * 100);

  function setField(key: string, value: string) {
    setVehicle((v) => ({ ...v, [key]: value }));
  }

  // ---- Navigation -------------------------------------------------
  function back() {
    setError(null);
    if (phase === "payment") {
      router.push("/dashboard");
    } else if (phase === "vehicle") {
      // The inspection is already paid; going back from the entry step exits to
      // the saved drafts rather than the (already-paid) payment step.
      if (vehicleStage === "entry") {
        router.push("/inspections");
      } else if (vehicleStage === "questionnaire") {
        if (vIndex === 0) setVehicleStage("entry");
        else setVIndex((i) => i - 1);
      } else {
        // validation → back to the VIN/plate entry.
        setVehicleStage("entry");
      }
    } else if (phase === "photos") {
      if (pIndex === 0) {
        setPhase("vehicle");
        // Return to the consolidated review (or entry if nothing captured yet).
        setVehicleStage(vehicle.make ? "validation" : "entry");
      } else setPIndex((i) => i - 1);
    } else if (phase === "mech") {
      if (mIndex === 0) {
        setPhase("photos");
        setPIndex(PHOTO_POINTS.length - 1);
      } else setMIndex((i) => i - 1);
    } else if (phase === "audio") {
      setPhase("mech");
      setMIndex(MECHANICAL_POINTS.length - 1);
    } else if (phase === "documents") {
      setPhase("audio");
    } else if (phase === "review") {
      setPhase("documents");
    }
  }

  // CarGuard is pay-per-inspection. Payment is the FIRST step: the draft is
  // created on payment, then the buyer answers the vehicle questions (whose
  // plate/VIN lookup is billable and only runs on a paid inspection).
  async function pay(opts: { useCredit?: boolean; pack?: string } = {}) {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/inspections/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ useCredit: opts.useCredit, pack: opts.pack, waiver: true }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not start the payment.");
      if (data.url) {
        // Stripe Checkout — the draft is created and marked paid on return,
        // which resumes the wizard at the vehicle questions.
        window.location.href = data.url;
        return;
      }
      // Demo mode / credit: the draft is created and paid immediately.
      setSessionId(data.sessionId);
      setPhase("vehicle");
      setVIndex(0);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Something went wrong.";
      setError(msg);
      toast.error(msg);
    } finally {
      setBusy(false);
    }
  }

  // Step-by-step questionnaire (only used when the buyer has no VIN/plate).
  function nextQuestionnaire(override?: Record<string, string>) {
    setError(null);
    const merged = override ? { ...vehicle, ...override } : vehicle;
    if (override) setVehicle(merged);
    if (vIndex < QUESTIONNAIRE_STEPS.length - 1) {
      setVIndex((i) => i + 1);
    } else {
      void finishVehicle(merged);
    }
  }

  // Persist the vehicle answers onto the (already-paid) draft, then start photos.
  async function finishVehicle(v: Record<string, string>) {
    if (!sessionId) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/inspections/${sessionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...v, goal: v.goal }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error ?? "Could not save the vehicle details.");
      }
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

  function nextPhoto() {
    if (pIndex < PHOTO_POINTS.length - 1) setPIndex((i) => i + 1);
    else {
      setPhase("mech");
      setMIndex(0);
    }
  }

  function nextMech() {
    if (mIndex < MECHANICAL_POINTS.length - 1) setMIndex((i) => i + 1);
    else setPhase("audio");
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

  // Exit the wizard, leaving the in-progress inspection saved as a draft.
  // Photos and mechanical steps are persisted as they go, so there is
  // nothing extra to save — we just confirm and return to the list.
  function continueLater() {
    toast.success(t("wiz.draftSaved"));
    router.push("/inspections");
  }

  // If the buyer cancelled Stripe checkout, they land back on the payment step
  // (the default first phase) — just let them know.
  useEffect(() => {
    if (resume) return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("paid") === "cancelled") toast.error(t("wiz.pay.cancelled"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const passedCount = PHOTO_POINTS.filter((p) => photoState[p.code]?.status === "passed").length;

  return (
    <div className="flex min-h-[calc(100vh-7rem)] flex-col px-5 pt-4 lg:mx-auto lg:max-w-xl">
      {phase === "finishing" && <AnalyzingOverlay label={t("wiz.building")} />}

      {/* Top bar: progress + close */}
      <div className="mb-6 flex items-center gap-3">
        <button onClick={back} aria-label="Back" className="text-[#6B7280]">
          {phase === "payment" ? <X className="size-6" /> : <ArrowLeft className="size-6" />}
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

      {/* Continue later — the draft is auto-saved; this just exits. */}
      {sessionId && phase !== "finishing" && (
        <div className="-mt-3 mb-4 flex justify-end">
          <button
            type="button"
            onClick={continueLater}
            className="inline-flex items-center gap-1.5 rounded-full border border-[#E5E7EB] px-3 py-1.5 text-xs font-medium text-[#6B7280] transition-colors hover:bg-secondary"
          >
            <Clock className="size-3.5" aria-hidden /> {t("wiz.continueLater")}
          </button>
        </div>
      )}

      {/* Body */}
      <div className="flex flex-1 flex-col">
        {phase === "vehicle" && vehicleStage === "entry" && (
          <VinStep
            vehicle={vehicle}
            sessionId={sessionId}
            setField={setField}
            onAutoFill={(data) => setVehicle((v) => ({ ...v, ...data }))}
            onIdentified={() => setVehicleStage("validation")}
            onNoId={() => {
              setVIndex(0);
              setVehicleStage("questionnaire");
            }}
          />
        )}

        {phase === "vehicle" && vehicleStage === "questionnaire" && (
          <VehicleStep
            step={QUESTIONNAIRE_STEPS[vIndex]}
            vehicle={vehicle}
            onPick={(updates) => nextQuestionnaire(updates)}
          />
        )}

        {phase === "vehicle" && vehicleStage === "validation" && (
          <VehicleReviewStep
            vehicle={vehicle}
            busy={busy}
            onValidate={(v) => {
              setVehicle(v);
              void finishVehicle(v);
            }}
          />
        )}

        {phase === "payment" && (
          <PaymentStep busy={busy} onPay={pay} />
        )}

        {phase === "photos" && (() => {
          const lp = localizedPhotoPoint(PHOTO_POINTS[pIndex], locale);
          return (
            <CaptureStep
              kicker={`${t("wiz.photo")} ${pIndex + 1} / ${PHOTO_POINTS.length}`}
              title={lp.title}
              instruction={lp.instruction}
              why={lp.why}
              code={PHOTO_POINTS[pIndex].code}
              previewUrl={photoState[PHOTO_POINTS[pIndex].code]?.url ?? null}
              status={photoState[PHOTO_POINTS[pIndex].code]?.status ?? "pending"}
              busy={busy}
              onFile={(f) => uploadPhoto(PHOTO_POINTS[pIndex].code, f)}
            />
          );
        })()}

        {phase === "mech" && (
          <MechStep
            point={MECHANICAL_POINTS[mIndex]}
            busy={busy}
            onSaved={nextMech}
            sessionId={sessionId!}
            setBusy={setBusy}
          />
        )}

        {phase === "audio" && (
          <AudioStep
            sessionId={sessionId!}
            busy={busy}
            setBusy={setBusy}
            onDone={() => setPhase("documents")}
          />
        )}

        {phase === "documents" && (
          <DocumentsStep
            sessionId={sessionId!}
            country={vehicle.country}
            busy={busy}
            setBusy={setBusy}
            onDone={() => setPhase("review")}
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
          vehicleStage={vehicleStage}
          vIndex={vIndex}
          busy={busy}
          photoStatus={phase === "photos" ? photoState[PHOTO_POINTS[pIndex].code]?.status ?? "pending" : undefined}
          onVehicleNext={() => nextQuestionnaire()}
          onPhotoNext={nextPhoto}
          onPhotoSkip={() => skipPhoto(PHOTO_POINTS[pIndex].code)}
          onFinish={finish}
        />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------
function VehicleStep({
  step,
  vehicle,
  onPick,
}: {
  step: VStepDef;
  vehicle: Record<string, string>;
  onPick: (updates: Record<string, string>) => void;
}) {
  const { t, currency, unit } = useI18n();

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

  // number → precise numeric entry (mileage, asking price)
  if (step.kind === "number") {
    const suffix = step.key === "asking_price" ? ` (${currency})` : ` (${unit})`;
    return (
      <StepShell kicker={t("wiz.vehicle")} question={`${t(`veh.q.${step.key}`)}${suffix}`}>
        <NumberStep
          stepKey={step.key!}
          value={vehicle[step.key!] ?? ""}
          onSubmit={(v) => onPick({ [step.key!]: String(v) })}
        />
      </StepShell>
    );
  }

  // select → tappable option list
  const opts = step.options!;
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
    <StepShell kicker={t("wiz.vehicle")} question={t(`veh.q.${step.key}`)}>
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
      </div>
    </StepShell>
  );
}

// Precise numeric entry for mileage / asking price (no preset brackets).
function NumberStep({
  stepKey,
  value,
  onSubmit,
}: {
  stepKey: string;
  value: string;
  onSubmit: (value: number) => void;
}) {
  const { t, currency, unit } = useI18n();
  const isPrice = stepKey === "asking_price";
  const [val, setVal] = useState(value ?? "");
  const symbol = currency === "EUR" ? "€" : "$";
  const n = Number(val.replace(/[^\d]/g, ""));

  return (
    <div>
      <div className="flex items-center gap-2 rounded-xl border border-[#E5E7EB] p-3">
        {isPrice && <span className="text-base text-[#6B7280]">{symbol}</span>}
        <Input
          autoFocus
          inputMode="numeric"
          value={val}
          onChange={(e) => setVal(e.target.value)}
          placeholder={isPrice ? "13500" : "86250"}
          className="h-14 border-0 px-1 text-lg shadow-none focus-visible:ring-0"
          onKeyDown={(e) => {
            if (e.key === "Enter" && n > 0) onSubmit(n);
          }}
        />
        <span className="shrink-0 text-sm font-medium text-[#6B7280]">
          {isPrice ? currency : unit}
        </span>
      </div>
      <Button className="mt-5 w-full" onClick={() => n > 0 && onSubmit(n)} disabled={n <= 0}>
        {t("wiz.continue")}
      </Button>
    </div>
  );
}

const PLATE_COUNTRIES = ["GB", "FR", "DE", "ES", "IT", "NL", "BE", "PT", "IE", "PL", "AT", "CH", "SE", "DK"];

function VinStep({
  vehicle,
  sessionId,
  setField,
  onAutoFill,
  onIdentified,
  onNoId,
}: {
  vehicle: Record<string, string>;
  sessionId: string | null;
  setField: (k: string, v: string) => void;
  onAutoFill: (data: Record<string, string>) => void;
  onIdentified: () => void;
  onNoId: () => void;
}) {
  const { t, locale } = useI18n();
  const [mode, setMode] = useState<"vin" | "plate">("vin");
  const [looking, setLooking] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [plate, setPlate] = useState("");
  const [country, setCountry] = useState(locale === "fr" ? "FR" : "GB");

  // The buyer has identified the car as soon as a VIN or plate is provided.
  const hasIdentifier = Boolean(vehicle.vin?.trim() || plate.trim());

  const regionName = (code: string) => {
    try {
      return new Intl.DisplayNames([locale], { type: "region" }).of(code) ?? code;
    } catch {
      return code;
    }
  };

  function applyResult(d: { ok?: boolean; configured?: boolean; data?: Record<string, unknown>; message?: string }, isPlate: boolean) {
    if (d.ok && d.data) {
      const data: Record<string, string> = {};
      for (const k of ["make", "model", "year", "trim", "engine", "fuel_type", "transmission", "vin"]) {
        if (d.data[k] != null) data[k] = String(d.data[k]);
      }
      onAutoFill(data);
      toast.success(t("wiz.prefilledToast"));
      // Identified → jump straight to the consolidated validation block.
      onIdentified();
      return;
    } else if (d.configured === false) {
      setMsg(isPlate ? t("wiz.plateUnavailable") : t("wiz.noMatch"));
    } else {
      setMsg(isPlate ? t("wiz.plateNoMatch") : t("wiz.noMatch"));
    }
  }

  const sid = sessionId ? `&sessionId=${encodeURIComponent(sessionId)}` : "";

  async function autofillVin() {
    if (!vehicle.vin?.trim()) return;
    setLooking(true);
    setMsg(null);
    const res = await fetch(`/api/vehicle-lookup?q=${encodeURIComponent(vehicle.vin.trim())}${sid}`);
    applyResult(await res.json(), false);
    setLooking(false);
  }

  async function autofillPlate() {
    if (!plate.trim()) return;
    setLooking(true);
    setMsg(null);
    const res = await fetch(
      `/api/vehicle-lookup?plate=${encodeURIComponent(plate.trim())}&country=${encodeURIComponent(country)}${sid}`,
    );
    applyResult(await res.json(), true);
    setLooking(false);
  }

  return (
    <StepShell
      kicker={t("wiz.vehicle")}
      question={mode === "vin" ? t("veh.q.vin") : t("wiz.plate.q")}
      helper={mode === "vin" ? t("wiz.vinHelper") : t("wiz.plate.helper")}
    >
      {/* VIN / Plate tabs */}
      <div className="mb-4 grid grid-cols-2 gap-1 rounded-xl bg-[#F2F3F5] p-1 text-sm font-medium">
        {(["vin", "plate"] as const).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => {
              setMode(m);
              setMsg(null);
            }}
            className={cn(
              "rounded-lg py-2 transition-colors",
              mode === m ? "bg-white text-[#111827] shadow-sm" : "text-[#6B7280]",
            )}
          >
            {t(m === "vin" ? "wiz.tab.vin" : "wiz.tab.plate")}
          </button>
        ))}
      </div>

      {mode === "vin" ? (
        <>
          <Input
            autoFocus
            placeholder={t("wiz.vinPlaceholder")}
            value={vehicle.vin ?? ""}
            onChange={(e) => setField("vin", e.target.value)}
            className="h-14 text-base"
          />
          <Button type="button" variant="accent" className="mt-3 w-full" onClick={autofillVin} disabled={looking}>
            <Sparkles className="size-4" /> {looking ? t("wiz.looking") : t("wiz.autofill")}
          </Button>
        </>
      ) : (
        <>
          <label className="mb-1 block text-xs font-medium text-[#6B7280]">{t("wiz.country")}</label>
          <select
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            className="mb-3 h-12 w-full rounded-xl border border-[#E5E7EB] bg-white px-3 text-base"
          >
            {PLATE_COUNTRIES.map((c) => (
              <option key={c} value={c}>
                {regionName(c)}
              </option>
            ))}
          </select>
          <Input
            autoFocus
            placeholder={t("wiz.platePlaceholder")}
            value={plate}
            onChange={(e) => setPlate(e.target.value)}
            className="h-14 text-base uppercase"
          />
          <Button type="button" variant="accent" className="mt-3 w-full" onClick={autofillPlate} disabled={looking}>
            <Sparkles className="size-4" /> {looking ? t("wiz.looking") : t("wiz.autofillPlate")}
          </Button>
        </>
      )}
      {msg && <p className="mt-2 text-xs text-[#6B7280]">{msg}</p>}

      {/* Continue with the entered VIN/plate (manual review), or declare none. */}
      <Button
        type="button"
        className="mt-5 w-full"
        onClick={onIdentified}
        disabled={!hasIdentifier || looking}
      >
        {t("wiz.continueToReview")}
      </Button>
      <button
        type="button"
        onClick={onNoId}
        className="mt-2 w-full py-2 text-sm font-medium text-[#6B7280]"
      >
        {t("wiz.noVinPlate")}
      </button>
    </StepShell>
  );
}

// Consolidated "validate the vehicle data" block, shown after a VIN/plate has
// been provided. All fields are editable in a single screen; make/model/year
// are required, the rest are optional.
function VehicleReviewStep({
  vehicle,
  busy,
  onValidate,
}: {
  vehicle: Record<string, string>;
  busy: boolean;
  onValidate: (v: Record<string, string>) => void;
}) {
  const { t, currency, unit } = useI18n();
  const [v, setV] = useState<Record<string, string>>(vehicle);
  const set = (k: string, val: string) => setV((prev) => ({ ...prev, [k]: val }));

  const canSubmit =
    Boolean(v.make?.trim()) && Boolean(v.model?.trim()) && Boolean(v.year?.trim());

  const selects: { key: string; group: string; options: readonly { value: string }[] }[] = [
    { key: "fuel_type", group: "fuel", options: FUEL_OPTIONS },
    { key: "transmission", group: "transmission", options: TRANSMISSION_OPTIONS },
    { key: "seller_type", group: "seller", options: SELLER_TYPE_OPTIONS },
    { key: "goal", group: "goal", options: INSPECTION_GOAL_OPTIONS },
  ];

  const Label = ({ k, required }: { k: string; required?: boolean }) => (
    <label className="mb-1 block text-xs font-medium text-[#6B7280]">
      {t(`veh.q.${k}`)}
      {!required && <span className="ml-1 text-[#9AA3AF]">({t("wiz.fieldOptional")})</span>}
    </label>
  );

  return (
    <StepShell
      kicker={t("wiz.vehicle")}
      question={t("wiz.validate.title")}
      helper={t("wiz.validate.subtitle")}
    >
      <div className="space-y-3">
        {vehicle.vin?.trim() && (
          <div className="rounded-xl bg-[#F7F8FA] px-3 py-2 text-xs text-[#6B7280]">
            VIN: <span className="font-medium text-[#111827]">{vehicle.vin}</span>
          </div>
        )}

        <div>
          <Label k="make" required />
          <Input value={v.make ?? ""} onChange={(e) => set("make", e.target.value)} className="h-12" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label k="model" required />
            <Input value={v.model ?? ""} onChange={(e) => set("model", e.target.value)} className="h-12" />
          </div>
          <div>
            <Label k="year" required />
            <Input
              inputMode="numeric"
              value={v.year ?? ""}
              onChange={(e) => set("year", e.target.value.replace(/[^\d]/g, ""))}
              className="h-12"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label k="mileage" />
            <div className="flex items-center gap-1 rounded-md border border-input px-2">
              <Input
                inputMode="numeric"
                value={v.mileage ?? ""}
                onChange={(e) => set("mileage", e.target.value.replace(/[^\d]/g, ""))}
                className="h-12 border-0 px-1 shadow-none focus-visible:ring-0"
              />
              <span className="shrink-0 text-xs text-[#6B7280]">{unit}</span>
            </div>
          </div>
          <div>
            <Label k="asking_price" />
            <div className="flex items-center gap-1 rounded-md border border-input px-2">
              <Input
                inputMode="numeric"
                value={v.asking_price ?? ""}
                onChange={(e) => set("asking_price", e.target.value.replace(/[^\d]/g, ""))}
                className="h-12 border-0 px-1 shadow-none focus-visible:ring-0"
              />
              <span className="shrink-0 text-xs text-[#6B7280]">{currency}</span>
            </div>
          </div>
        </div>

        {selects.map(({ key, group, options }) => (
          <div key={key}>
            <Label k={key} />
            <select
              value={v[key] ?? ""}
              onChange={(e) => set(key, e.target.value)}
              className="h-12 w-full rounded-md border border-input bg-white px-3 text-sm"
            >
              <option value="">—</option>
              {options.map((o) => (
                <option key={o.value} value={o.value}>
                  {t(`opt.${group}.${o.value}`)}
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>

      <Button
        className="mt-5 w-full"
        onClick={() => onValidate(v)}
        disabled={!canSubmit || busy}
      >
        {busy ? t("wiz.starting") : t("wiz.validateContinue")}
      </Button>
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
  code,
  previewUrl,
  status,
  busy,
  onFile,
}: {
  kicker: string;
  title: string;
  instruction: string;
  why: string;
  code: string;
  previewUrl: string | null;
  status: string;
  busy: boolean;
  onFile: (f: File) => void;
}) {
  const { t } = useI18n();
  const camRef = useRef<HTMLInputElement>(null);
  const libRef = useRef<HTMLInputElement>(null);
  const pick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) onFile(f);
    e.target.value = "";
  };
  return (
    <StepShell kicker={kicker} question={title}>
      <p className="text-sm text-[#374151]">{instruction}</p>
      <p className="mt-2 rounded-lg bg-accent/5 p-3 text-xs text-[#6B7280]">
        <strong className="text-[#111827]">{t("wiz.whyItMatters")}</strong>
        {why}
      </p>

      <input ref={camRef} type="file" accept="image/*" hidden onChange={pick} />
      <input ref={libRef} type="file" accept="image/*" hidden onChange={pick} />

      <button
        type="button"
        onClick={() => camRef.current?.click()}
        disabled={busy}
        className="relative mt-4 flex aspect-video w-full items-center justify-center overflow-hidden rounded-2xl border border-dashed border-[#E5E7EB] bg-[#F7F8FA]"
      >
        {previewUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={previewUrl} alt={title} className="h-full w-full object-cover" />
        ) : (
          <span className="flex flex-col items-center gap-1 px-4 py-3 text-[#9AA3AF]">
            {hasCaptureGuide(code) ? (
              <span className="w-36 sm:w-44"><CaptureGuide code={code} /></span>
            ) : (
              <Camera className="size-10" aria-hidden />
            )}
            <span className="flex items-center gap-1.5 text-sm font-medium text-[#6B7280]">
              <Camera className="size-4" aria-hidden /> {t("wiz.tapCamera")}
            </span>
          </span>
        )}
        {busy && (
          <span className="absolute inset-0 flex items-center justify-center bg-white/70">
            <RefreshCw className="size-6 animate-spin text-[#E50914]" aria-hidden />
          </span>
        )}
      </button>

      <button
        type="button"
        onClick={() => libRef.current?.click()}
        disabled={busy}
        className="mt-2 flex w-full items-center justify-center gap-1.5 py-2 text-sm font-medium text-[#6B7280]"
      >
        <Upload className="size-4" aria-hidden /> {t("cap.useUpload")}
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
  onSaved,
  sessionId,
  setBusy,
}: {
  point: MechanicalPoint;
  busy: boolean;
  onSaved: () => void;
  sessionId: string;
  setBusy: (b: boolean) => void;
}) {
  const { t, locale } = useI18n();
  const L = localizedMechPoint(point, locale);
  const [file, setFile] = useState<File | null>(null);
  const camRef = useRef<HTMLInputElement>(null);
  const libRef = useRef<HTMLInputElement>(null);
  const pick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) setFile(f);
    e.target.value = "";
  };

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

      {hasCaptureGuide(point.code) && (
        <div className="mx-auto mt-3 w-40 sm:w-48">
          <CaptureGuide code={point.code} />
        </div>
      )}

      <input
        ref={camRef}
        type="file"
        accept={captureMode === "video" ? "video/*" : "image/*"}
        hidden
        onChange={pick}
      />
      <input
        ref={libRef}
        type="file"
        accept={captureMode === "video" ? "video/*" : "image/*"}
        hidden
        onChange={pick}
      />

      <button
        type="button"
        onClick={() => camRef.current?.click()}
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

      <button
        type="button"
        onClick={() => libRef.current?.click()}
        className="mt-2 flex w-full items-center justify-center gap-1.5 py-2 text-sm font-medium text-[#6B7280]"
      >
        <Upload className="size-4" aria-hidden /> {t("cap.useUpload")}
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

// Mandatory engine start-up sound step. Record or import an audio/video; the
// clip is uploaded and analyzed (its score feeds the confidence score and the
// report). The buyer can declare it unavailable to continue without blocking.
function AudioStep({
  sessionId,
  busy,
  setBusy,
  onDone,
}: {
  sessionId: string;
  busy: boolean;
  setBusy: (b: boolean) => void;
  onDone: () => void;
}) {
  const { t } = useI18n();
  const fileRef = useRef<HTMLInputElement>(null);
  const mediaRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const startedAtRef = useRef(0);
  const [recording, setRecording] = useState(false);
  const [stage, setStage] = useState<"idle" | "uploading" | "analyzing">("idle");
  const [err, setErr] = useState<string | null>(null);

  async function startRecording() {
    setErr(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      chunksRef.current = [];
      mr.ondataavailable = (e) => e.data.size > 0 && chunksRef.current.push(e.data);
      mr.onstop = () => {
        stream.getTracks().forEach((tr) => tr.stop());
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        const duration = Math.round((Date.now() - startedAtRef.current) / 1000);
        const f = new File([blob], `engine-recording-${Date.now()}.webm`, { type: "audio/webm" });
        void upload(f, duration);
      };
      startedAtRef.current = Date.now();
      mr.start();
      mediaRef.current = mr;
      setRecording(true);
    } catch {
      setErr(t("eat.micDenied"));
    }
  }

  function stopRecording() {
    mediaRef.current?.stop();
    setRecording(false);
  }

  async function upload(file: File, duration = 0) {
    setBusy(true);
    setErr(null);
    setStage("uploading");
    try {
      const userId = await getUserId();
      if (!userId) throw new Error(t("ui.signIn"));
      const isVideo = file.type.startsWith("video/");
      const path = `${userId}/${sessionId}/engine.${fileExt(file)}`;
      await uploadToStorage(STORAGE_BUCKETS.engineAudio, path, file);
      const res = await fetch(`/api/inspections/${sessionId}/engine-audio`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          storage_path: path,
          mime_type: file.type,
          file_type: isVideo ? "video" : "audio",
          original_file_name: file.name,
          duration_seconds: duration,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? t("ui.uploadFailed"));
      setStage("analyzing");
      const a = await fetch(`/api/inspections/${sessionId}/engine-audio/${data.check.id}/analyze`, {
        method: "POST",
      });
      const ad = await a.json();
      if (!a.ok) throw new Error(ad.error ?? t("eat.analysisFailed"));
      toast.success(t("eat.analyzedToast"));
      onDone();
    } catch (e) {
      setErr(e instanceof Error ? e.message : t("ui.uploadFailed"));
      setStage("idle");
    } finally {
      setBusy(false);
    }
  }

  const working = stage !== "idle";

  return (
    <StepShell kicker={t("wiz.audio.kicker")} question={t("wiz.audio.q")} helper={t("wiz.audio.why")}>
      <input
        ref={fileRef}
        type="file"
        accept="audio/*,video/mp4,video/quicktime,video/webm"
        hidden
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) void upload(f);
          e.target.value = "";
        }}
      />
      <div className="mt-4 flex flex-col gap-2">
        {recording ? (
          <Button variant="destructive" onClick={stopRecording}>
            <Square className="size-4" /> {t("eat.stopRecording")}
          </Button>
        ) : (
          <Button onClick={startRecording} disabled={busy}>
            <Mic className="size-4" /> {t("eat.recordAudio")}
          </Button>
        )}
        <Button variant="outline" onClick={() => fileRef.current?.click()} disabled={busy || recording}>
          <Upload className="size-4" /> {t("eat.uploadFile")}
        </Button>
      </div>
      <p className="mt-3 text-xs text-[#6B7280]">
        {t("eat.tipFormatPre")} <strong>{t("eat.tipFormatStrong")}</strong>{t("eat.tipFormatPost")}
      </p>
      {working && (
        <p className="mt-3 flex items-center gap-2 text-sm text-[#6B7280]">
          <RefreshCw className="size-4 animate-spin" />
          {stage === "analyzing" ? t("wiz.audio.analyzing") : t("eat.uploadingChecking")}
        </p>
      )}
      {err && <p className="mt-3 text-sm text-destructive">{err}</p>}
      <button
        type="button"
        onClick={onDone}
        disabled={busy}
        className="mt-4 w-full py-2 text-sm font-medium text-[#6B7280]"
      >
        {t("wiz.audio.cantRecord")}
      </button>
    </StepShell>
  );
}

// Pay-per-inspection gate: spend a credit if available, otherwise buy a pack.
function PaymentStep({
  busy,
  onPay,
}: {
  busy: boolean;
  onPay: (opts?: { useCredit?: boolean; pack?: string }) => void;
}) {
  const { t, formatMoney, currency } = useI18n();
  const [credits, setCredits] = useState<number | null>(null);
  const [stripe, setStripe] = useState(false);
  const [agreed, setAgreed] = useState(false);

  useEffect(() => {
    fetch("/api/billing/credits")
      .then((r) => r.json())
      .then((d) => {
        setCredits(typeof d.credits === "number" ? d.credits : 0);
        setStripe(Boolean(d.stripe));
      })
      .catch(() => {
        setCredits(0);
        setStripe(false);
      });
  }, []);

  const features = [
    t("wiz.pay.f1"),
    t("wiz.pay.f2"),
    t("wiz.pay.f3"),
    t("wiz.pay.f4"),
    t("wiz.pay.f5"),
    t("wiz.pay.f6"),
    t("wiz.pay.f7"),
    t("wiz.pay.f8"),
  ];

  // Loading.
  if (credits === null) {
    return (
      <StepShell kicker={t("wiz.pay.kicker")} question={t("wiz.pay.title")} helper={t("wiz.pay.subtitle")}>
        <div className="flex items-center gap-2 py-8 text-sm text-[#6B7280]">
          <RefreshCw className="size-4 animate-spin" /> …
        </div>
      </StepShell>
    );
  }

  const featuresBlock = (
    <ul className="mt-4 space-y-2 text-sm text-[#374151]">
      {features.map((f) => (
        <li key={f} className="flex items-start gap-2">
          <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-risk-low" aria-hidden /> {f}
        </li>
      ))}
    </ul>
  );

  // Value/ROI framing — why this is worth paying for before signing.
  const valueCallout = (
    <div className="mb-3 flex items-start gap-3 rounded-2xl border border-[#FFD7D7] bg-[rgba(229,9,20,0.04)] p-4">
      <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl bg-[#E50914]/10 text-[#E50914]">
        <TrendingDown className="size-5" aria-hidden />
      </span>
      <div>
        <p className="text-sm font-semibold text-[#111827]">{t("wiz.pay.value.title")}</p>
        <p className="mt-0.5 text-xs leading-snug text-[#6B7280]">{t("wiz.pay.value.body")}</p>
      </div>
    </div>
  );

  // Reassurance strip — speed, privacy, no subscription.
  const trustStrip = (
    <div className="mt-4 grid grid-cols-3 gap-2">
      {[
        { icon: Zap, t: t("wiz.pay.trust.fast.t"), d: t("wiz.pay.trust.fast.d") },
        { icon: ShieldCheck, t: t("wiz.pay.trust.privacy.t"), d: t("wiz.pay.trust.privacy.d") },
        { icon: RefreshCw, t: t("wiz.pay.trust.oneoff.t"), d: t("wiz.pay.trust.oneoff.d") },
      ].map((item) => (
        <div
          key={item.t}
          className="flex flex-col items-center gap-1 rounded-xl border border-[#EFEFEF] px-2 py-3 text-center"
        >
          <item.icon className="size-4 text-risk-low" aria-hidden />
          <span className="text-[11px] font-semibold leading-tight text-[#111827]">{item.t}</span>
          <span className="text-[10px] leading-tight text-[#6B7280]">{item.d}</span>
        </div>
      ))}
    </div>
  );

  // Let undecided buyers preview a full sample report before paying.
  const seeExampleLink = (
    <a
      href="/report-example"
      target="_blank"
      rel="noreferrer"
      className="mt-3 flex items-center justify-center gap-1.5 text-sm font-medium text-[#E50914] underline-offset-2 hover:underline"
    >
      <FileText className="size-4" aria-hidden /> {t("landing.seeExample")}
    </a>
  );

  // Required consent: sales terms + immediate-execution / withdrawal waiver.
  const consent = (
    <label className="mt-4 flex items-start gap-2 text-xs leading-snug text-[#6B7280]">
      <input
        type="checkbox"
        checked={agreed}
        onChange={(e) => setAgreed(e.target.checked)}
        className="mt-0.5 size-4 shrink-0"
      />
      <span>
        {t("wiz.pay.waiver.pre")}{" "}
        <a href="/cgv" target="_blank" rel="noreferrer" className="underline">{t("wiz.pay.waiver.cgv")}</a>{" "}
        {t("wiz.pay.waiver.and")}{" "}
        <a href="/terms" target="_blank" rel="noreferrer" className="underline">{t("wiz.pay.waiver.cgu")}</a>
        {t("wiz.pay.waiver.post")}
      </span>
    </label>
  );

  // Demo (no Stripe) or has a credit → one tap to start.
  if (!stripe || credits > 0) {
    return (
      <StepShell kicker={t("wiz.pay.kicker")} question={t("wiz.pay.title")} helper={t("wiz.pay.subtitle")}>
        {stripe && credits > 0 && (
          <div className="mb-3 rounded-xl bg-risk-low/10 px-4 py-3 text-sm font-medium text-[#111827]">
            {credits} {t("wiz.pay.creditsLeft")}
          </div>
        )}
        {valueCallout}
        <div className="rounded-2xl border border-[#E5E7EB] p-4">{featuresBlock}</div>
        {trustStrip}
        {seeExampleLink}
        {consent}
        <Button className="mt-4 w-full" onClick={() => onPay({ useCredit: stripe })} disabled={busy || !agreed}>
          {busy ? t("wiz.pay.processing") : stripe ? t("wiz.pay.useCredit") : t("wiz.pay.startDemo")}
        </Button>
        <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-[#6B7280]">
          <Lock className="size-3.5" aria-hidden /> {t("wiz.pay.secure")}
        </p>
      </StepShell>
    );
  }

  // No credit → choose a pack.
  return (
    <StepShell kicker={t("wiz.pay.kicker")} question={t("wiz.pay.choosePack")} helper={t("wiz.pay.packHelper")}>
      {valueCallout}
      <div className="rounded-2xl border border-[#E5E7EB] p-4">{featuresBlock}</div>
      {trustStrip}
      {seeExampleLink}
      {consent}
      <div className="mt-4 space-y-3">
        {INSPECTION_PACKS.map((p, i) => {
          const per = p.price / p.credits;
          const best = i === INSPECTION_PACKS.length - 1;
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => onPay({ pack: p.id })}
              disabled={busy || !agreed}
              className={cn(
                "flex w-full items-center justify-between rounded-2xl border p-4 text-left transition-colors",
                best ? "border-[#E50914] bg-[rgba(229,9,20,0.04)]" : "border-[#E5E7EB] hover:bg-secondary",
              )}
            >
              <div>
                <div className="flex items-center gap-2 font-semibold text-[#111827]">
                  {p.credits} {p.credits > 1 ? t("wiz.pay.inspections") : t("wiz.pay.inspection")}
                  {best && (
                    <span className="rounded-full bg-[#E50914] px-2 py-0.5 text-[10px] font-bold text-white">
                      {t("wiz.pay.bestValue")}
                    </span>
                  )}
                </div>
                <div className="text-xs text-[#6B7280]">
                  {formatMoney(per, currency)} {t("wiz.pay.perInspection")}
                </div>
              </div>
              <div className="text-xl font-extrabold text-[#111827]">{formatMoney(p.price, currency)}</div>
            </button>
          );
        })}
      </div>
      <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-[#6B7280]">
        <Lock className="size-3.5" aria-hidden /> {t("wiz.pay.secure")}
      </p>
    </StepShell>
  );
}

// Documents step — photograph paperwork (maintenance, registration, non-pledge…).
function DocumentsStep({
  sessionId,
  country,
  busy,
  setBusy,
  onDone,
}: {
  sessionId: string;
  country?: string;
  busy: boolean;
  setBusy: (b: boolean) => void;
  onDone: () => void;
}) {
  const { t } = useI18n();
  const docs = useMemo(() => documentsForRegion(country), [country]);
  const [provided, setProvided] = useState<Record<string, boolean>>({});
  const [uploading, setUploading] = useState<string | null>(null);

  // Prefill on resume.
  useEffect(() => {
    fetch(`/api/inspections/${sessionId}/documents`)
      .then((r) => r.json())
      .then((d) => {
        const m: Record<string, boolean> = {};
        for (const row of d.documents ?? []) m[row.doc_type] = true;
        setProvided(m);
      })
      .catch(() => {});
  }, [sessionId]);

  async function upload(code: string, file: File) {
    setUploading(code);
    setBusy(true);
    try {
      const userId = await getUserId();
      if (!userId) throw new Error("Please sign in again.");
      const isImg = file.type.startsWith("image/");
      const out = isImg ? await compressImage(file) : file;
      const path = `${userId}/${sessionId}/doc-${code}.${fileExt(out)}`;
      await uploadToStorage(STORAGE_BUCKETS.documents, path, out);
      const res = await fetch(`/api/inspections/${sessionId}/documents`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ doc_type: code, storage_path: path, mime_type: out.type, file_size: out.size }),
      });
      if (!res.ok) throw new Error("upload failed");
      setProvided((p) => ({ ...p, [code]: true }));
    } catch {
      toast.error(t("ui.uploadFailed"));
    } finally {
      setUploading(null);
      setBusy(false);
    }
  }

  const count = Object.values(provided).filter(Boolean).length;

  return (
    <StepShell kicker={t("wiz.docs.kicker")} question={t("wiz.docs.q")} helper={t("wiz.docs.helper")}>
      <div className="space-y-2">
        {docs.map((d) => (
          <DocTile
            key={d.code}
            code={d.code}
            label={t(`doc.${d.code}.title`)}
            done={!!provided[d.code]}
            busy={uploading === d.code}
            onFile={(f) => upload(d.code, f)}
          />
        ))}
      </div>
      <Button className="mt-5 w-full" onClick={onDone} disabled={busy}>
        {count > 0 ? `${t("wiz.continue")} (${count} ${t("wiz.docs.provided")})` : t("wiz.continue")}
      </Button>
    </StepShell>
  );
}

function DocTile({
  code,
  label,
  done,
  busy,
  onFile,
}: {
  code: string;
  label: string;
  done: boolean;
  busy: boolean;
  onFile: (file: File) => void;
}) {
  const { t } = useI18n();
  const ref = useRef<HTMLInputElement>(null);
  return (
    <button
      type="button"
      onClick={() => ref.current?.click()}
      disabled={busy}
      className={cn(
        "flex w-full items-center gap-3 rounded-xl border p-3 text-left text-sm transition-colors",
        done ? "border-risk-low/50 bg-risk-low/5" : "border-[#E5E7EB] hover:bg-secondary",
      )}
    >
      <span className={cn("flex size-9 shrink-0 items-center justify-center rounded-lg", done ? "bg-risk-low/15 text-risk-low" : "bg-[rgba(229,9,20,0.10)] text-[#E50914]")}>
        {busy ? <RefreshCw className="size-5 animate-spin" /> : done ? <CheckCircle2 className="size-5" /> : <FileText className="size-5" />}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block font-medium text-[#111827]">{label}</span>
        <span className="block text-xs text-[#6B7280]">{done ? t("wiz.docs.added") : t("wiz.docs.add")}</span>
      </span>
      <Upload className="size-4 shrink-0 text-[#6B7280]" aria-hidden />
      <input
        ref={ref}
        type="file"
        accept="image/*,application/pdf"
        hidden
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onFile(f);
          e.target.value = "";
        }}
      />
    </button>
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
  vehicleStage,
  vIndex,
  busy,
  photoStatus,
  onVehicleNext,
  onPhotoNext,
  onPhotoSkip,
  onFinish,
}: {
  phase: Phase;
  vehicleStage: VehicleStage;
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
    // Entry and validation stages render their own actions in-body.
    if (vehicleStage !== "questionnaire") return null;
    if (busy) {
      return (
        <PrimaryButton onClick={() => {}} disabled loading>
          {t("wiz.starting")}
        </PrimaryButton>
      );
    }
    const step = QUESTIONNAIRE_STEPS[vIndex];
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
