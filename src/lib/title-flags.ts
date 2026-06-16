// =====================================================================
// CarGuard AI — Adverse title flags (provider abstraction)
//
// Derives salvage / flood / theft / total-loss / hail… flags from a purchased
// per-VIN report (NMVTIS via VinAudit, US). A pure mapping over the report's
// title brands. EU has no free equivalent — an EU provider can feed the same
// TitleFlagsSection shape later.
// SERVER ONLY (pure function).
// =====================================================================

import type { TitleFlag, TitleFlagsSection, VinHistoryReport } from "@/types";

// Order matters only for first-match-per-category de-duplication.
const FLAG_RULES: [RegExp, string][] = [
  [/salvage/i, "salvage"],
  [/total\s*loss|totaled/i, "total_loss"],
  [/flood|water/i, "flood"],
  [/fire|burn/i, "fire"],
  [/hail/i, "hail"],
  [/theft|stolen/i, "theft"],
  [/junk/i, "junk"],
  [/lemon|manufacturer\s*buyback|buy\s*back/i, "lemon"],
  [/rebuil|reconstruct|prior\s*salvage/i, "rebuilt"],
  [/odomet|mileage/i, "odometer"],
  [/hurricane|storm|disaster|catastroph|natural/i, "disaster"],
  [/damage/i, "damage"],
];

export function deriveTitleFlags(
  data: Partial<VinHistoryReport> | null | undefined,
): TitleFlagsSection | null {
  if (!data) return null;

  const brands = (data.brands ?? []).filter(Boolean) as string[];
  const flags: TitleFlag[] = [];
  const seen = new Set<string>();

  for (const brand of brands) {
    for (const [re, category] of FLAG_RULES) {
      if (re.test(brand) && !seen.has(category)) {
        seen.add(category);
        flags.push({ category, detail: brand });
      }
    }
  }

  // Provider-level booleans not always reflected in the brand strings.
  if (data.salvage_or_total_loss && !seen.has("salvage") && !seen.has("total_loss")) {
    seen.add("salvage");
    flags.push({ category: "salvage", detail: "Salvage / total-loss record" });
  }
  if (data.theft_record && !seen.has("theft")) {
    seen.add("theft");
    flags.push({ category: "theft", detail: "Theft record" });
  }

  return {
    source: data.provider ? `NMVTIS (${data.provider})` : "NMVTIS",
    checked: true,
    clean: flags.length === 0,
    flags,
    disclaimer: "",
  };
}
