// =====================================================================
// CarGuard AI — Overall inspection score + confidence
// Blends the three modules into a single score/confidence:
//   bodywork photos + engine & mechanical + vehicle history.
// All 0-100, higher = safer. SERVER-safe (pure functions).
// =====================================================================

import type { VehicleHistorySection } from "@/types";

export interface OverallInput {
  photoScore: number; // bodywork accident/repair (0-100)
  photoConfidence: number; // 0-100
  mechanicalScore?: number | null;
  mechanicalConfidence?: number | null;
  engineAudioScore?: number | null; // engine start-up sound analysis (0-100)
  engineAudioConfidence?: number | null; // 0-100
  history?: VehicleHistorySection | null;
  salvageTitle?: boolean; // confirmed salvage/total-loss (paid VIN history)
  documentsRatio?: number; // 0-1 completeness of supporting documents
  documentsProvided?: number; // how many documents were photographed
}

export interface OverallResult {
  score: number;
  confidence: number;
}

function clamp(n: number) {
  return Math.max(0, Math.min(100, Math.round(n)));
}

// Convert NHTSA recalls/complaints into a light, cautious score factor.
function historyScore(h: VehicleHistorySection): number {
  let s = 90;
  s -= Math.min(10, (h.recall_count ?? 0) * 2);
  s -= Math.min(8, Math.floor((h.complaints_count ?? 0) / 50) * 2);
  return Math.max(40, s);
}

export function computeOverall(i: OverallInput): OverallResult {
  // --- Score: weighted blend of available modules ---
  const parts: { v: number; w: number }[] = [{ v: i.photoScore, w: 0.5 }];
  if (i.mechanicalScore != null) parts.push({ v: i.mechanicalScore, w: 0.5 });
  // Engine start-up sound analysis (when provided) — a real risk signal.
  if (i.engineAudioScore != null) parts.push({ v: i.engineAudioScore, w: 0.25 });
  if (i.history?.matched) parts.push({ v: historyScore(i.history), w: 0.12 });
  // Supporting documents lightly reduce risk (a documented car is safer).
  if (i.documentsProvided && i.documentsProvided > 0) {
    parts.push({ v: 60 + (i.documentsRatio ?? 0) * 35, w: 0.07 });
  }

  const totalW = parts.reduce((a, p) => a + p.w, 0);
  let score = clamp(parts.reduce((a, p) => a + p.v * p.w, 0) / totalW);

  // A confirmed salvage / total-loss title overrides everything.
  if (i.salvageTitle) score = Math.min(score, 35);

  // --- Confidence: reflects how complete/known the inspection is ---
  const conf: { v: number; w: number }[] = [{ v: i.photoConfidence, w: 0.45 }];
  if (i.mechanicalConfidence != null) conf.push({ v: i.mechanicalConfidence, w: 0.45 });
  if (i.engineAudioConfidence != null) conf.push({ v: i.engineAudioConfidence, w: 0.2 });
  if (i.history?.matched) conf.push({ v: 70, w: 0.1 });
  // Provided documents make the inspection more verifiable → more confidence.
  if (i.documentsProvided && i.documentsProvided > 0) {
    conf.push({ v: 35 + (i.documentsRatio ?? 0) * 65, w: 0.14 });
  }
  const cW = conf.reduce((a, p) => a + p.w, 0);
  const confidence = clamp(conf.reduce((a, p) => a + p.v * p.w, 0) / cW);

  return { score, confidence };
}
