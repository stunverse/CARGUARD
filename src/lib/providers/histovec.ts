// =====================================================================
// CarGuard AI — Histovec (France, official & free)
//
// France has NO vehicle-history API: the official source is Histovec
// (histovec.interieur.gouv.fr), a free government report the SELLER generates
// and shares (link / QR / PDF). So we don't call an API — instead the buyer
// uploads the Histovec report as a document and we read its key administrative
// signals with the existing AI vision pipeline:
//   - gage (pledge/lien)            → cannot be freely resold
//   - opposition (OTCI / gel / PV)  → registration blocked
//   - vol (declared stolen)
//   - sinistre VE/VEI (declared economically irreparable / damaged)
//   - number of previous owners
//
// The result reuses the TitleFlagsSection shape so it renders in the existing
// "Title & damage flags" report section, with source "Histovec".
// SERVER ONLY.
// =====================================================================

import { isAIConfigured, runStructuredVision } from "@/lib/ai/client";
import type { TitleFlag, TitleFlagsSection } from "@/types";

export interface HistovecExtraction {
  // Whether the uploaded document actually looks like a Histovec report.
  is_histovec: boolean;
  gage: boolean; // véhicule gagé (pledge / lien)
  opposition: boolean; // opposition administrative (OTCI, gel, PV…)
  vol: boolean; // véhicule déclaré volé
  sinistre_ve: boolean; // procédure VE/VEI (économiquement irréparable / damaged)
  owners_count: number | null; // nombre de propriétaires successifs
  first_registration: string | null; // date de 1re mise en circulation (YYYY-MM-DD)
}

const SYSTEM = `You read a French "Histovec" vehicle report (histovec.interieur.gouv.fr), the official free history document for French cars. The image(s) may be a screenshot or PDF page, in French. Extract ONLY what is explicitly shown — never guess.

Return a JSON object with exactly these keys:
- is_histovec (boolean): true only if this really looks like a Histovec report (mentions "Histovec", "situation administrative", "historique", French registration data).
- gage (boolean): true if the vehicle is "gagé" / has an active "gage" (pledge/lien). The "situation administrative" usually states "Gage : Oui/Non".
- opposition (boolean): true if there is any "opposition" (OTCI, opposition temporaire, gel, opposition for unpaid fine/PV, vol-related opposition).
- vol (boolean): true if the vehicle is reported "volé" (stolen).
- sinistre_ve (boolean): true if the history shows a "procédure VE" / "véhicule économiquement irréparable" (VEI) / "véhicule endommagé / gravement accidenté" / "sinistre" declaration.
- owners_count (integer or null): number of successive owners ("propriétaires") if shown, else null.
- first_registration (string "YYYY-MM-DD" or null): date of first registration ("1re mise en circulation") if shown, else null.

If the document is NOT a Histovec report, set is_histovec=false and all booleans false and counts null.`;

export async function analyzeHistovec(
  imageUrls: string[],
): Promise<HistovecExtraction | null> {
  if (!isAIConfigured() || imageUrls.length === 0) return null;
  try {
    const data = await runStructuredVision<Partial<HistovecExtraction>>({
      system: SYSTEM,
      userText:
        "Extract the Histovec administrative signals from this French vehicle report. Respond with the JSON object only.",
      imageUrls,
      temperature: 0,
    });
    return {
      is_histovec: Boolean(data.is_histovec),
      gage: Boolean(data.gage),
      opposition: Boolean(data.opposition),
      vol: Boolean(data.vol),
      sinistre_ve: Boolean(data.sinistre_ve),
      owners_count:
        data.owners_count != null && Number.isFinite(Number(data.owners_count))
          ? Number(data.owners_count)
          : null,
      first_registration: data.first_registration || null,
    };
  } catch (err) {
    console.error("Histovec analysis failed:", err);
    return null;
  }
}

// Map the extraction to the shared adverse-flags section (source "Histovec").
export function histovecToTitleFlags(
  ext: HistovecExtraction | null,
): TitleFlagsSection | null {
  if (!ext || !ext.is_histovec) return null;
  const flags: TitleFlag[] = [];
  if (ext.gage) flags.push({ category: "pledge", detail: "Véhicule gagé (gage actif)" });
  if (ext.opposition)
    flags.push({ category: "opposition", detail: "Opposition administrative (OTCI / gel / PV)" });
  if (ext.vol) flags.push({ category: "theft", detail: "Véhicule déclaré volé" });
  if (ext.sinistre_ve)
    flags.push({ category: "salvage", detail: "Procédure VE/VEI (véhicule endommagé déclaré)" });
  return {
    source: "Histovec",
    checked: true,
    clean: flags.length === 0,
    flags,
    disclaimer: "",
  };
}
