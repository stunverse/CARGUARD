// =====================================================================
// CarGuard AI — Market value (heuristic, no provider) — works worldwide
//
// We don't have a priced-listings database, so instead of an absolute
// valuation we anchor on the seller's asking price and derive a FAIR band
// from the vehicle age and mileage vs a country-typical yearly distance.
// A car with high mileage for its age is worth less than a typical example,
// so the asking looks "overpriced"; low mileage → "underpriced" (good deal).
// Transparent and clearly labelled as an estimate.
// SERVER ONLY (pure function).
// =====================================================================

import { unitForCurrency } from "@/lib/i18n";
import type { MarketValueSection, MarketValueVerdict } from "@/types";

const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n));

export function estimateMarketValue(input: {
  askingPrice: number | null | undefined;
  mileage: number | null | undefined;
  year: number | null | undefined;
  currency?: string | null;
}): MarketValueSection | null {
  const currency = (input.currency || "USD").toUpperCase();
  const unit = unitForCurrency(currency);
  const avgPerYear = unit === "mi" ? 12000 : 15000;

  const asking = input.askingPrice && input.askingPrice > 0 ? input.askingPrice : null;
  if (!asking) return null; // need the asking price to anchor the estimate

  const nowYear = new Date().getFullYear();
  const age = input.year ? Math.max(nowYear - input.year, 1) : null;
  const mileage = input.mileage && input.mileage > 0 ? input.mileage : null;

  let verdict: MarketValueVerdict = "unknown";
  let low: number | null = null;
  let high: number | null = null;
  let expected: number | null = null;

  if (age && mileage) {
    expected = avgPerYear * age;
    const ratio = mileage / expected;
    // More mileage than typical → fair value below the asking, and vice-versa.
    const adj = clamp(-(ratio - 1) * 0.3, -0.25, 0.15);
    const mid = Math.round(asking * (1 + adj));
    low = Math.round(mid * 0.93);
    high = Math.round(mid * 1.07);
    if (asking > high) verdict = "overpriced";
    else if (asking < low) verdict = "underpriced";
    else verdict = "fair";
  }

  return {
    currency,
    asking_price: asking,
    estimated_low: low,
    estimated_high: high,
    verdict,
    expected_mileage: expected,
    actual_mileage: mileage,
    unit,
    source: null,
    disclaimer: "",
  };
}
