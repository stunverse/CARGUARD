// =====================================================================
// CarGuard AI — Safety rating (provider abstraction)
//
//  * US  → NHTSA NCAP Safety Ratings API (free, no key).
//  * EU  → Euro NCAP has no free API today; returns null until a paid/EU
//    provider is wired here behind the same SafetyRatingSection shape.
//
// Best-effort: any failure or no-match returns null (the section is hidden).
// SERVER ONLY.
// =====================================================================

import type { SafetyRatingSection } from "@/types";

function cleanRating(v?: string | null): string | null {
  if (!v) return null;
  const s = String(v).trim();
  if (!s || /not rated|not applicable|^0$/i.test(s)) return null;
  return s;
}

async function getNhtsaSafety(
  year: number,
  make: string,
  model: string,
): Promise<SafetyRatingSection | null> {
  try {
    const base = "https://api.nhtsa.gov/SafetyRatings";
    const listRes = await fetch(
      `${base}/modelyear/${year}/make/${encodeURIComponent(make)}/model/${encodeURIComponent(model)}`,
      { headers: { Accept: "application/json" } },
    );
    if (!listRes.ok) return null;
    const list = (await listRes.json()) as { Results?: { VehicleId?: number }[] };
    const id = list.Results?.find((r) => r.VehicleId)?.VehicleId;
    if (!id) return null; // no US-market rating (typical for EU-only models)

    const detRes = await fetch(`${base}/VehicleId/${id}`, {
      headers: { Accept: "application/json" },
    });
    if (!detRes.ok) return null;
    const det = (await detRes.json()) as { Results?: Record<string, string>[] };
    const r = det.Results?.[0];
    if (!r) return null;

    const section: SafetyRatingSection = {
      source: "NHTSA NCAP",
      matched: true,
      vehicle: `${year} ${make} ${model}`,
      overall: cleanRating(r.OverallRating),
      frontal: cleanRating(r.OverallFrontCrashRating),
      side: cleanRating(r.OverallSideCrashRating),
      rollover: cleanRating(r.RolloverRating),
      note: "",
      disclaimer: "",
    };
    if (!section.overall && !section.frontal && !section.side && !section.rollover) {
      return null;
    }
    return section;
  } catch (err) {
    console.error("NHTSA safety rating failed:", err);
    return null;
  }
}

// EU (Euro NCAP) — no free official API. Wired behind env for a paid/EU
// proxy provider; returns null until configured.
//   EURONCAP_API_URL  GET/POST endpoint accepting { year, make, model }
//   EURONCAP_API_KEY  bearer token
function isEuroNcapConfigured(): boolean {
  return Boolean(process.env.EURONCAP_API_URL && process.env.EURONCAP_API_KEY);
}

async function getEuroNcap(
  year: number,
  make: string,
  model: string,
): Promise<SafetyRatingSection | null> {
  if (!isEuroNcapConfigured()) return null;
  try {
    const res = await fetch(process.env.EURONCAP_API_URL!, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.EURONCAP_API_KEY}`,
      },
      body: JSON.stringify({ year, make, model }),
    });
    if (!res.ok) return null;
    // TODO: map the provider payload. Expected generic shape:
    // { overall?, frontal?, side?, rollover? } as star strings.
    const r = (await res.json()) as Record<string, string>;
    const section: SafetyRatingSection = {
      source: "Euro NCAP",
      matched: true,
      vehicle: `${year} ${make} ${model}`,
      overall: cleanRating(r.overall),
      frontal: cleanRating(r.frontal),
      side: cleanRating(r.side),
      rollover: cleanRating(r.rollover),
      note: "",
      disclaimer: "",
    };
    if (!section.overall && !section.frontal && !section.side && !section.rollover) {
      return null;
    }
    return section;
  } catch (err) {
    console.error("Euro NCAP provider failed:", err);
    return null;
  }
}

export async function getSafetyRating(input: {
  year?: number | null;
  make?: string | null;
  model?: string | null;
  country?: string | null;
}): Promise<SafetyRatingSection | null> {
  const { year, make, model } = input;
  if (!year || !make || !model) return null;

  // US path first (free, returns nothing for non-US models), then EU provider.
  const us = await getNhtsaSafety(year, make, model);
  if (us) return us;
  return getEuroNcap(year, make, model);
}
