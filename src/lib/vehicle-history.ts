// =====================================================================
// CarGuard AI — Vehicle history (free sources)
//
// US market: NHTSA (gov, free, no key) — manufacturer recalls and
// consumer complaints, by make/model/year. Data is model-level, not
// VIN-specific (per-VIN accident/title history requires paid NMVTIS
// providers). Provider abstraction so DVLA (UK) / others can be added.
//
// SERVER ONLY.
// =====================================================================

import { decodeVin } from "@/lib/vehicle-lookup";
import type { VehicleHistorySection, VehicleRecall } from "@/types";

const HISTORY_DISCLAIMER =
  "Recall and complaint data is from the US NHTSA database and is model-level (by make/model/year), not specific to this exact VIN. It does not include private accident or title history (those require a paid history report).";

interface HistoryQuery {
  vin?: string | null;
  make?: string | null;
  model?: string | null;
  year?: number | null;
}

async function fetchJson(url: string): Promise<unknown | null> {
  try {
    const res = await fetch(url, { headers: { Accept: "application/json" } });
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    console.error("vehicle-history fetch failed:", url, err);
    return null;
  }
}

// Resolve make/model/year, decoding the VIN if needed.
async function resolveVehicle(q: HistoryQuery): Promise<{ make: string; model: string; year: number } | null> {
  if (q.make && q.model && q.year) {
    return { make: q.make, model: q.model, year: q.year };
  }
  if (q.vin) {
    const decoded = await decodeVin(q.vin);
    if (decoded.ok && decoded.data?.make && decoded.data.model && decoded.data.year) {
      return { make: decoded.data.make, model: decoded.data.model, year: decoded.data.year };
    }
  }
  return null;
}

export async function getVehicleHistory(
  q: HistoryQuery,
): Promise<VehicleHistorySection | null> {
  const v = await resolveVehicle(q);
  if (!v) return null;

  const enc = encodeURIComponent;
  const [recallsJson, complaintsJson] = await Promise.all([
    fetchJson(
      `https://api.nhtsa.gov/recalls/recallsByVehicle?make=${enc(v.make)}&model=${enc(v.model)}&modelYear=${v.year}`,
    ),
    fetchJson(
      `https://api.nhtsa.gov/complaints/complaintsByVehicle?make=${enc(v.make)}&model=${enc(v.model)}&modelYear=${v.year}`,
    ),
  ]);

  // Recalls.
  const recallResults =
    (recallsJson as { results?: Record<string, string>[] } | null)?.results ?? [];
  const recalls: VehicleRecall[] = recallResults.slice(0, 15).map((r) => ({
    campaign: r.NHTSACampaignNumber ?? "",
    component: r.Component ?? "",
    summary: r.Summary ?? "",
    remedy: r.Remedy ?? "",
    date: r.ReportReceivedDate ?? "",
  }));

  // Complaints — count + most-reported components.
  const complaintResults =
    (complaintsJson as { results?: { components?: string }[] } | null)?.results ?? [];
  const componentCounts = new Map<string, number>();
  for (const c of complaintResults) {
    for (const comp of (c.components ?? "").split(/[,;]/)) {
      const name = comp.trim();
      if (name) componentCounts.set(name, (componentCounts.get(name) ?? 0) + 1);
    }
  }
  const top_complaint_components = [...componentCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name]) => name);

  const note =
    recalls.length === 0 && complaintResults.length === 0
      ? "No NHTSA recalls or complaints were found for this make/model/year."
      : `Found ${recalls.length} recall(s) and ${complaintResults.length} consumer complaint(s) for this model. Ask the seller whether open recalls have been fixed.`;

  return {
    source: "NHTSA",
    matched: true,
    vehicle: `${v.year} ${v.make} ${v.model}`,
    recalls,
    recall_count: recalls.length,
    complaints_count: complaintResults.length,
    top_complaint_components,
    note,
    disclaimer: HISTORY_DISCLAIMER,
  };
}
