// =====================================================================
// CarGuard AI — Vehicle model knowledge (spec §35)
// Looks up public.vehicle_model_knowledge for the inspected vehicle and
// derives a model_risk_score plus extra seller questions / vigilance
// points. Returns a neutral result when no entry exists (empty base).
// =====================================================================

import type { SupabaseClient } from "@supabase/supabase-js";
import type { Vehicle } from "@/types";

export interface ModelKnowledgeResult {
  matched: boolean;
  model_risk_score: number; // 0-100, higher = safer
  vigilance_points: string[];
  extra_seller_questions: string[];
  notes: string | null;
}

const NEUTRAL: ModelKnowledgeResult = {
  matched: false,
  model_risk_score: 75,
  vigilance_points: [],
  extra_seller_questions: [],
  notes: null,
};

export async function getModelKnowledge(
  supabase: SupabaseClient,
  vehicle: Partial<Vehicle>,
): Promise<ModelKnowledgeResult> {
  if (!vehicle.make || !vehicle.model) return NEUTRAL;

  const { data } = await supabase
    .from("vehicle_model_knowledge")
    .select("*")
    .ilike("make", vehicle.make)
    .ilike("model", vehicle.model)
    .limit(20);

  if (!data || data.length === 0) return NEUTRAL;

  // Prefer a row whose year range covers the vehicle year.
  const year = vehicle.year ?? null;
  const row =
    data.find(
      (r) =>
        year == null ||
        ((r.year_start == null || r.year_start <= year) &&
          (r.year_end == null || r.year_end >= year)),
    ) ?? data[0];

  const asArray = (v: unknown): string[] =>
    Array.isArray(v) ? (v as string[]) : [];

  const bodyIssues = asArray(row.known_body_issues);
  const alignmentIssues = asArray(row.known_alignment_issues);
  const repaintZones = asArray(row.common_repaint_zones);

  // More documented weak spots → slightly lower (more cautious) base score.
  const concernCount =
    bodyIssues.length + alignmentIssues.length + repaintZones.length;
  const model_risk_score = Math.max(45, 85 - concernCount * 5);

  const vigilance_points = [
    ...bodyIssues.map((i) => `Known body issue on this model: ${i}.`),
    ...alignmentIssues.map((i) => `Known alignment issue on this model: ${i}.`),
    ...repaintZones.map((z) => `Commonly repainted zone on this model: ${z}.`),
  ];

  const extra_seller_questions = repaintZones.map(
    (z) => `Has the ${z} been repainted? It is a commonly repainted area on this model.`,
  );

  return {
    matched: true,
    model_risk_score,
    vigilance_points,
    extra_seller_questions,
    notes: row.structural_risk_notes ?? null,
  };
}
