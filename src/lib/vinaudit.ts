// =====================================================================
// CarGuard AI — VinAudit (paid, per-VIN NMVTIS report)
//
// Wholesale provider used behind a pay-per-report model. The exact field
// names of the VinAudit response can vary by plan/version, so we store
// the raw payload and extract fields defensively. Tune VINAUDIT_API_URL
// and the parsing below against your VinAudit account docs.
//
// SERVER ONLY.
// =====================================================================

import type { VinHistoryReport } from "@/types";

const VINAUDIT_DISCLAIMER =
  "This report is sourced from NMVTIS via VinAudit (US title, brand, salvage/total-loss and odometer records). It is not a guarantee and may not include every event; combine it with the CarGuard inspection and, when in doubt, a professional check.";

export function isVinAuditConfigured(): boolean {
  return Boolean(process.env.VINAUDIT_API_KEY);
}

interface VinAuditRaw {
  success?: boolean;
  error?: string;
  titles?: Array<Record<string, string>>;
  jsicheck?: Record<string, unknown>;
  checks?: Record<string, unknown>;
  salvage?: Array<Record<string, string>>;
  sales?: Array<Record<string, string>>;
  [k: string]: unknown;
}

function asArray<T = Record<string, string>>(v: unknown): T[] {
  return Array.isArray(v) ? (v as T[]) : [];
}

/**
 * Fetch + normalize a VinAudit report. Throws on hard failure so the
 * caller can avoid charging without delivering.
 */
export async function fetchVinAuditReport(vin: string): Promise<VinHistoryReport> {
  const key = process.env.VINAUDIT_API_KEY;
  if (!key) throw new Error("VINAUDIT_API_KEY is not configured.");

  const base = process.env.VINAUDIT_API_URL || "https://api.vinaudit.com/v2/pullreport";
  const url = `${base}?key=${encodeURIComponent(key)}&vin=${encodeURIComponent(vin)}&format=json`;

  const res = await fetch(url, { headers: { Accept: "application/json" } });
  if (!res.ok) throw new Error(`VinAudit HTTP ${res.status}`);
  const raw = (await res.json()) as VinAuditRaw;
  if (raw.success === false) {
    throw new Error(`VinAudit error: ${raw.error ?? "unknown"}`);
  }

  // --- Defensive extraction (align with your VinAudit schema). ---
  const titles = asArray(raw.titles).map((t) => ({
    state: t.state ?? t.State,
    date: t.date ?? t.Date,
    brand: t.brand ?? t.Brand ?? t.current ?? undefined,
    mileage: t.meter ?? t.mileage ?? t.Mileage,
  }));

  const brandSet = new Set<string>();
  for (const t of titles) if (t.brand && t.brand.toLowerCase() !== "none") brandSet.add(t.brand);
  for (const s of asArray(raw.salvage)) {
    const b = s.brand ?? s.disposition ?? s.type;
    if (b) brandSet.add(b);
  }
  const brands = [...brandSet];

  const salvage_or_total_loss =
    asArray(raw.salvage).length > 0 ||
    brands.some((b) => /salvage|total loss|junk|flood|rebuilt|lemon/i.test(b));

  const odometer_readings = titles
    .filter((t) => t.mileage)
    .map((t) => ({ date: t.date, mileage: t.mileage, source: t.state }));

  const sale_listings = asArray(raw.sales).map((s) => ({
    date: s.date ?? s.Date,
    price: s.price ?? s.Price,
    odometer: s.odometer ?? s.meter,
  }));

  const summary = salvage_or_total_loss
    ? `Warning: this VIN has ${brands.join(", ") || "a salvage/total-loss"} record. Treat with caution and confirm with a professional.`
    : titles.length > 0
      ? `${titles.length} title record(s) found, no salvage/total-loss brand detected.`
      : "No title records were returned for this VIN.";

  return {
    vin,
    provider: "vinaudit",
    fetched_at: new Date().toISOString(),
    titles,
    brands,
    title_count: titles.length,
    salvage_or_total_loss,
    theft_record: null,
    odometer_readings,
    sale_listings,
    summary,
    disclaimer: VINAUDIT_DISCLAIMER,
  };
}
