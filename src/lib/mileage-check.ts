// =====================================================================
// CarGuard AI — Mileage consistency / odometer-rollback heuristic (US + EU)
//
// Works worldwide with no provider: plausibility from the vehicle age and a
// country-typical yearly distance. When odometer records exist (e.g. a paid
// NMVTIS report), a decreasing reading is a strong rollback signal.
// SERVER ONLY (pure function — safe anywhere).
// =====================================================================

import { unitForCurrency } from "@/lib/i18n";
import type { MileageCheckSection, MileageCheckStatus } from "@/types";

export interface OdometerReading {
  date?: string | null;
  mileage?: number | null;
}

export function assessMileage(input: {
  mileage: number | null | undefined;
  year: number | null | undefined;
  currency?: string | null;
  odometerReadings?: OdometerReading[];
}): MileageCheckSection | null {
  const unit = unitForCurrency(input.currency ?? "USD"); // "km" | "mi"
  const expectedPerYear = unit === "mi" ? 12000 : 15000;

  const mileage = input.mileage != null && input.mileage > 0 ? input.mileage : null;
  const nowYear = new Date().getFullYear();
  const age = input.year ? Math.max(nowYear - input.year, 1) : null;

  if (mileage == null || age == null) {
    return {
      status: "unknown",
      mileage,
      unit,
      vehicle_age_years: age,
      avg_per_year: null,
      expected_per_year: expectedPerYear,
      flags: [],
      note: "",
      disclaimer: "",
    };
  }

  const perYear = Math.round(mileage / age);
  const flags: string[] = [];
  let status: MileageCheckStatus = "ok";

  // Implausibly low for the age → classic rollback red flag.
  if (age >= 4 && mileage < expectedPerYear * age * 0.35) {
    status = "suspicious";
    flags.push("very_low_for_age");
  }
  // Very high usage — not fraud, but worth flagging for wear.
  if (perYear > expectedPerYear * 2.2) {
    if (status === "ok") status = "attention";
    flags.push("very_high");
  }

  // Odometer records (if any): a reading that goes DOWN over time, or a current
  // odometer below a past record, is a strong rollback signal.
  const readings = (input.odometerReadings ?? [])
    .map((r) => ({ date: r.date ? new Date(r.date).getTime() : 0, mileage: r.mileage ?? null }))
    .filter((r) => r.mileage != null)
    .sort((a, b) => a.date - b.date);
  let maxSeen = 0;
  let decreasing = false;
  for (const r of readings) {
    if ((r.mileage as number) < maxSeen) decreasing = true;
    maxSeen = Math.max(maxSeen, r.mileage as number);
  }
  if (decreasing || (maxSeen > 0 && mileage < maxSeen)) {
    status = "suspicious";
    flags.push("rollback_records");
  }

  return {
    status,
    mileage,
    unit,
    vehicle_age_years: age,
    avg_per_year: perYear,
    expected_per_year: expectedPerYear,
    flags,
    note: "",
    disclaimer: "",
  };
}
