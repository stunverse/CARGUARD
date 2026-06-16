// =====================================================================
// CarGuard AI — EU vehicle-history provider (abstraction / adapter)
//
// The US path uses NMVTIS (VinAudit). The EU has no free equivalent, so an
// EU history provider (carVertical-style aggregator, or a national register
// proxy) is wired here behind env vars and reuses the same TitleFlagsSection
// shape. Until a provider is configured this returns null and nothing changes.
//
//   EU_HISTORY_PROVIDER   label shown as the source (e.g. "carVertical")
//   EU_HISTORY_API_URL    POST endpoint that accepts { vin, country }
//   EU_HISTORY_API_KEY    bearer token
//
// SERVER ONLY.
// =====================================================================

import { deriveTitleFlags } from "@/lib/title-flags";
import type { TitleFlagsSection, VinHistoryReport } from "@/types";

export function isEuHistoryConfigured(): boolean {
  return Boolean(process.env.EU_HISTORY_API_URL && process.env.EU_HISTORY_API_KEY);
}

// Returns adverse title flags from an EU provider, or null when unavailable.
export async function fetchEuTitleFlags(input: {
  vin?: string | null;
  country?: string | null;
}): Promise<TitleFlagsSection | null> {
  if (!isEuHistoryConfigured() || !input.vin) return null;
  try {
    const res = await fetch(process.env.EU_HISTORY_API_URL!, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.EU_HISTORY_API_KEY}`,
      },
      body: JSON.stringify({ vin: input.vin.trim().toUpperCase(), country: input.country ?? null }),
    });
    if (!res.ok) return null;
    // TODO: map the chosen provider's payload to this generic shape. We expect
    // { brands: string[], salvage_or_total_loss?, theft_record?, provider? }.
    const data = (await res.json()) as Partial<VinHistoryReport>;
    const provider = process.env.EU_HISTORY_PROVIDER || data.provider || "EU";
    const section = deriveTitleFlags({ ...data, provider });
    return section ? { ...section, source: provider } : null;
  } catch (err) {
    console.error("EU history provider failed:", err);
    return null;
  }
}
