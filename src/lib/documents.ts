// =====================================================================
// CarGuard AI — Inspection documents catalog (US + EU)
// The buyer photographs the paperwork before the report. Presence of these
// documents raises the report's confidence (a documented car is more
// verifiable) and is summarized in a dedicated report section.
// =====================================================================

import type { DocumentsSection, ReportDocument } from "@/types";

export type DocRegion = "both" | "eu" | "us";

export interface DocumentType {
  code: string;
  region: DocRegion;
  // Whether providing it materially strengthens confidence (key documents).
  key?: boolean;
}

// i18n titles/why live under doc.<code>.title / doc.<code>.why
export const DOCUMENT_TYPES: DocumentType[] = [
  { code: "registration", region: "both", key: true }, // carte grise / V5C / US title+registration
  { code: "maintenance", region: "both", key: true }, // service book / invoices
  { code: "technical_inspection", region: "both", key: true }, // CT / MOT / state safety inspection
  { code: "history_report", region: "both", key: true }, // Histovec / Carfax / AutoCheck
  { code: "purchase_invoice", region: "both" }, // facture / bill of sale
  { code: "emissions", region: "both" }, // CT pollution / smog certificate
  { code: "insurance", region: "both" }, // attestation d'assurance
  { code: "non_pledge", region: "eu", key: true }, // certificat de situation administrative (non-gage)
  { code: "odometer_disclosure", region: "us" }, // US federal odometer disclosure
];

export function isUsCountry(country?: string | null): boolean {
  const c = (country || "").trim().toUpperCase();
  return ["US", "USA", "UNITED STATES", "ÉTATS-UNIS", "ETATS-UNIS"].includes(c);
}

// Documents relevant to the vehicle's market (both + region-specific).
export function documentsForRegion(country?: string | null): DocumentType[] {
  const region: DocRegion = isUsCountry(country) ? "us" : "eu";
  return DOCUMENT_TYPES.filter((d) => d.region === "both" || d.region === region);
}

// Build the report section from the provided doc types + the vehicle market.
export function buildDocumentsSection(
  providedTypes: string[],
  country?: string | null,
): DocumentsSection | null {
  const relevant = documentsForRegion(country);
  if (relevant.length === 0) return null;
  const provided = new Set(providedTypes);
  const items: ReportDocument[] = relevant.map((d) => ({
    doc_type: d.code,
    provided: provided.has(d.code),
    key: Boolean(d.key),
    summary: null,
  }));
  const provided_count = items.filter((i) => i.provided).length;
  const key_total = relevant.filter((d) => d.key).length;
  const key_provided = relevant.filter((d) => d.key && provided.has(d.code)).length;
  return {
    provided_count,
    relevant_count: relevant.length,
    key_provided,
    key_total,
    items,
    note: "",
    disclaimer: "",
  };
}

// 0..1 completeness, key documents weighted double.
export function documentsRatio(section: DocumentsSection | null | undefined): number {
  if (!section) return 0;
  const nonKeyTotal = section.relevant_count - section.key_total;
  const nonKeyProvided = section.provided_count - section.key_provided;
  const denom = section.key_total * 2 + nonKeyTotal;
  if (denom <= 0) return 0;
  return Math.max(0, Math.min(1, (section.key_provided * 2 + nonKeyProvided) / denom));
}
