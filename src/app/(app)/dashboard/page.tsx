import Link from "next/link";
import {
  Bell,
  Camera,
  ChevronRight,
  Cpu,
  FileText,
  Info,
  Menu,
  ScanLine,
  ShieldCheck,
  Wrench,
  Car,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { LogoMark } from "@/components/mobile/logo-mark";
import { ScoreRing } from "@/components/mobile/score-ring";
import { vehicleLabel } from "@/lib/utils";
import type { InspectionSession, RiskLevel, Vehicle } from "@/types";

export const metadata = { title: "CarGuard AI" };

const ANGLES = [
  "Front",
  "Front Right",
  "Right Side",
  "Rear Right",
  "Rear",
  "Rear Left",
  "Left Side",
  "Front Left",
];

function riskColor(level: RiskLevel | null | undefined): string {
  switch (level) {
    case "low":
      return "#22C55E";
    case "moderate":
      return "#E50914";
    case "high":
      return "#B00008";
    case "very_high":
      return "#7F0006";
    default:
      return "#E50914";
  }
}

function riskLabel(level: RiskLevel | null | undefined): string {
  switch (level) {
    case "low":
      return "Low Risk";
    case "moderate":
      return "Moderate Risk";
    case "high":
      return "High Risk";
    case "very_high":
      return "Very High Risk";
    default:
      return "Not analyzed";
  }
}

export default async function DashboardPage() {
  const supabase = await createClient();

  const { data: sessions } = await supabase
    .from("inspection_sessions")
    .select("*, vehicles(*)")
    .order("created_at", { ascending: false })
    .limit(10);

  const list = (sessions ?? []) as (InspectionSession & { vehicles: Vehicle | null })[];
  const latestScored = list.find((s) => s.global_score != null) ?? null;
  const recent = list.slice(0, 3);

  // Risk score card: real latest, else mock per spec.
  const riskScore = latestScored?.global_score ?? 72;
  const riskLevel = latestScored?.risk_level ?? "moderate";

  return (
    <div className="px-5">
      {/* Header */}
      <header className="flex items-center justify-between pt-4">
        <Link
          href="/settings"
          aria-label="Menu"
          className="flex size-11 items-center justify-center rounded-full border border-[#E5E7EB] bg-white text-[#374151] shadow-sm transition-transform active:scale-95"
        >
          <Menu className="size-5" aria-hidden />
        </Link>
        <LogoMark href={null} />
        <button
          type="button"
          aria-label="Notifications"
          className="relative flex size-11 items-center justify-center rounded-full border border-[#E5E7EB] bg-white text-[#374151] shadow-sm transition-transform active:scale-95"
        >
          <Bell className="size-5" aria-hidden />
          <span className="absolute right-2.5 top-2.5 size-2 rounded-full bg-[#E50914]" aria-hidden />
        </button>
      </header>

      {/* Hero */}
      <section className="mt-6">
        <h1 className="text-[34px] font-extrabold leading-[1.05] tracking-tight text-[#111827]">
          Protect your
          <br />
          next car purchase
        </h1>
        <p className="mt-3 text-[15px] leading-snug text-[#6B7280]">
          Detect hidden accident or mechanical defects before you buy a used car.
        </p>
      </section>

      {/* Primary action */}
      <section className="mt-5">
        <Link
          href="/inspections/new"
          className="relative flex h-16 w-full items-center justify-center gap-2 overflow-hidden rounded-[18px] text-lg font-semibold text-white shadow-[0_12px_30px_rgba(229,9,20,0.28)] transition-transform active:scale-[0.98]"
          style={{ backgroundImage: "linear-gradient(135deg,#FF2A2A 0%,#E50914 45%,#B00008 100%)" }}
        >
          <span aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-1/2 bg-white/15" />
          <ScanLine className="size-5" aria-hidden />
          <span>Start Inspection</span>
          <ChevronRight className="size-5 opacity-90" aria-hidden />
        </Link>
        <p className="mt-2 text-center text-xs text-[#6B7280]">
          One inspection: exterior photos · engine audio · mechanical checks →
          a report with a confidence score.
        </p>
      </section>

      {/* Hidden Damage Scanner */}
      <section
        className="mt-5 rounded-3xl border border-[rgba(229,9,20,0.18)] bg-white/95 p-[18px] shadow-[0_12px_35px_rgba(17,24,39,0.08)]"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ScanLine className="size-5 text-[#E50914]" aria-hidden />
            <h2 className="font-bold text-[#111827]">Hidden Damage Scanner</h2>
          </div>
          <Link
            href="/disclaimer"
            className="inline-flex items-center gap-1 rounded-full bg-[#F2F3F5] px-3 py-1 text-xs font-medium text-[#6B7280]"
          >
            Why 8 photos? <Info className="size-3.5" aria-hidden />
          </Link>
        </div>
        <p className="mt-1 text-[13px] text-[#6B7280]">
          Capture all 8 exterior angles for accurate AI analysis.
        </p>
        <div className="mt-3 grid grid-cols-4 gap-2">
          {ANGLES.map((label, i) => (
            <Link
              key={label}
              href="/inspections/new"
              className="flex flex-col items-center gap-1 rounded-2xl border border-[#E5E7EB] bg-[#F7F8FA] p-2 transition-transform active:scale-95"
            >
              <span className="relative flex h-10 w-full items-center justify-center rounded-lg bg-white">
                <Car className="size-6 text-[#9AA3AF]" aria-hidden />
                <span className="absolute -left-1 -top-1 flex size-5 items-center justify-center rounded-full bg-[#E50914] text-[10px] font-bold text-white">
                  {i + 1}
                </span>
              </span>
              <span className="text-center text-[10px] font-medium leading-tight text-[#374151]">
                {label}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Risk score + Key benefits */}
      <section className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* Vehicle Risk Score */}
        <div className="rounded-3xl border border-[rgba(229,9,20,0.14)] bg-white p-[18px] shadow-[0_12px_35px_rgba(17,24,39,0.06)]">
          <div className="flex items-center gap-2">
            <ShieldCheck className="size-5 text-[#6B7280]" aria-hidden />
            <h3 className="font-semibold text-[#111827]">Vehicle Risk Score</h3>
          </div>
          <div className="mt-3 flex items-center gap-4">
            <ScoreRing score={riskScore} size={104} color={riskColor(riskLevel)} />
            <div className="flex-1">
              <p className="font-semibold" style={{ color: riskColor(riskLevel) }}>
                {riskLabel(riskLevel)}
              </p>
              <p className="mt-1 text-xs text-[#6B7280]">
                Proceed with caution. AI analysis suggests potential hidden issues.
              </p>
            </div>
          </div>
          <Link
            href={latestScored ? `/inspections/${latestScored.id}` : "/inspections/new"}
            className="mt-3 inline-flex items-center gap-1 rounded-full bg-[#F2F3F5] px-4 py-1.5 text-sm font-medium text-[#111827]"
          >
            View Details <ChevronRight className="size-4" aria-hidden />
          </Link>
        </div>

        {/* Key Benefits */}
        <div className="rounded-3xl border border-[rgba(229,9,20,0.14)] bg-white p-[18px] shadow-[0_12px_35px_rgba(17,24,39,0.06)]">
          <h3 className="mb-3 font-semibold text-[#111827]">Key Benefits</h3>
          <ul className="space-y-3">
            <BenefitItem icon={Camera} title="8 Guided Photos" sub="Exterior damage scan" />
            <BenefitItem icon={Wrench} title="Engine & Audio Checks" sub="Mechanical condition" />
            <BenefitItem icon={Cpu} title="AI Damage Detection" sub="Advanced computer vision" />
            <BenefitItem icon={FileText} title="Report + Confidence Score" sub="Shareable & trustworthy" />
          </ul>
        </div>
      </section>

      {/* Recent inspections */}
      <section className="mt-5">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-lg font-bold text-[#111827]">Recent Inspections</h2>
          <Link href="/inspections" className="text-sm font-semibold text-[#E50914]">
            View All
          </Link>
        </div>

        <div className="space-y-3">
          {recent.length === 0 ? (
            <RecentItem
              href="/inspections/new"
              title="2020 Honda Accord EX"
              date="May 18, 2025 • 2:34 PM"
              level="low"
              score={18}
            />
          ) : (
            recent.map((s) => (
              <RecentItem
                key={s.id}
                href={`/inspections/${s.id}`}
                title={vehicleLabel(s.vehicles ?? {})}
                date={new Date(s.created_at).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
                level={s.risk_level}
                score={s.global_score}
              />
            ))
          )}
        </div>
      </section>
    </div>
  );
}

function BenefitItem({
  icon: Icon,
  title,
  sub,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  sub: string;
}) {
  return (
    <li className="flex items-center gap-3">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[rgba(229,9,20,0.10)] text-[#E50914]">
        <Icon className="size-4" aria-hidden />
      </span>
      <span>
        <span className="block text-sm font-semibold text-[#111827]">{title}</span>
        <span className="block text-xs text-[#6B7280]">{sub}</span>
      </span>
    </li>
  );
}

function RecentItem({
  href,
  title,
  date,
  level,
  score,
}: {
  href: string;
  title: string;
  date: string;
  level: RiskLevel | null | undefined;
  score: number | null | undefined;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 rounded-2xl border border-[#E5E7EB] bg-white p-3 shadow-sm transition-transform active:scale-[0.99]"
    >
      <span className="flex size-14 shrink-0 items-center justify-center rounded-xl bg-[#F2F3F5] text-[#9AA3AF]">
        <Car className="size-7" aria-hidden />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold text-[#111827]">{title}</p>
        <p className="text-xs text-[#6B7280]">{date}</p>
        <span
          className="mt-1 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold"
          style={{
            color: riskColor(level),
            background:
              level === "low" ? "rgba(34,197,94,0.12)" : "rgba(229,9,20,0.10)",
          }}
        >
          ● {riskLabel(level)}
        </span>
      </div>
      {score != null ? (
        <ScoreRing score={score} size={52} stroke={6} color={riskColor(level)} unit={null} />
      ) : (
        <ChevronRight className="size-5 text-[#9AA3AF]" aria-hidden />
      )}
    </Link>
  );
}
