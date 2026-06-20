// =====================================================================
// CarGuard AI — Engine & Mechanical Check: AI + aggregation
// Photos are analyzed by AI vision; videos/questionnaires rely on the
// buyer's guided observations (plus audio analysis where applicable).
// All scores: higher = safer. SERVER ONLY.
// =====================================================================

import { INTERACTIVE_VISION_MODEL, isMediaConfigured, isVisionConfigured, runStructuredMedia, runStructuredVision } from "./client";
import { AI_RULES, languageDirective } from "./prompts";
import {
  DEFAULT_MECHANICAL_MECHANIC_QUESTIONS,
  DEFAULT_MECHANICAL_SELLER_QUESTIONS,
  MECHANICAL_DISCLAIMER,
  MECHANICAL_POINTS,
  mechanicalRiskToRecommendation,
  mechanicalScoreToRisk,
  scoreFromObservations,
  severityFromScore,
} from "@/lib/mechanical";
import { localizedMechPoint } from "@/lib/content-i18n";
import type {
  DetectedIssue,
  MechanicalCheckItem,
  MechanicalItemAnalysis,
  MechanicalPoint,
  MechanicalPointCode,
  MechanicalReportSection,
} from "@/types";

// Concrete, localized per-check conclusion when no AI summary is available
// (questionnaire/docs checks, or a video whose frames couldn't be read).
function fallbackSummary(
  point: MechanicalPoint | undefined,
  code: MechanicalPointCode,
  suspicious: string[],
  locale: string,
  analyzed: boolean,
): string {
  const fr = locale === "fr";
  const title = point ? localizedMechPoint(point, fr ? "fr" : "en").title : code;
  if (suspicious.length) {
    return fr
      ? `Points à vérifier sur « ${title} » : ${suspicious.join(" ; ")}.`
      : `Points to verify on "${title}": ${suspicious.join("; ")}.`;
  }
  if (analyzed) {
    return fr
      ? `Aucun élément visiblement préoccupant relevé pour « ${title} ». À confirmer par un professionnel.`
      : `No visibly concerning element found for "${title}". Have a professional confirm.`;
  }
  return fr
    ? `« ${title} » enregistré. Aucun problème signalé ; conservez le média pour un mécanicien.`
    : `"${title}" recorded. No issue reported; keep the media for a mechanic to review.`;
}

interface PhotoAiPart {
  detected_issues: DetectedIssue[];
  suspicious_observations: string[];
  summary: string;
  confidence: number;
}

// AI vision pass for photo-based mechanical points (dashboard, oil, coolant…).
export async function analyzeMechanicalPhoto(
  imageUrls: string[],
  code: MechanicalPointCode,
  language?: string,
): Promise<PhotoAiPart> {
  const point = MECHANICAL_POINTS.find((p) => p.code === code);
  if (!isVisionConfigured() || imageUrls.length === 0) {
    return {
      detected_issues: [],
      suspicious_observations: [],
      summary: point
        ? `Recorded "${point.title}". Detailed AI vision not available (demo mode); the guided observations drive the score.`
        : "",
      confidence: 35,
    };
  }
  try {
    return await runStructuredVision<PhotoAiPart>({
      system: `${AI_RULES}

TASK: Analyze the image(s) for the mechanical check "${point?.title ?? code}". Focus on what is actually VISIBLE (e.g. exhaust smoke colour, warning lights, leaks, fluid colour) and do not infer sounds.
Look for: ${(point?.ai_targets ?? []).join(", ") || "relevant mechanical signs"}.
Be cautious and non-diagnostic. Return JSON exactly:
{
 "detected_issues": [{ "issue_type": "other", "location": string, "severity": "low|moderate|high|critical", "confidence": number, "explanation": string, "recommended_follow_up_photo": null }],
 "suspicious_observations": string[],
 "summary": string,
 "confidence": number
}${languageDirective(language)}`,
      userText: `Mechanical point: ${code}. Analyze and return the JSON.`,
      imageUrls,
      model: INTERACTIVE_VISION_MODEL,
    });
  } catch (err) {
    console.error("analyzeMechanicalPhoto failed, falling back:", err);
    return {
      detected_issues: [],
      suspicious_observations: [],
      summary: "Automated photo analysis was unavailable for this step.",
      confidence: 20,
    };
  }
}

// AI pass for VIDEO-based mechanical points — the full clip (with its
// soundtrack) is sent to Gemini, which can see motion AND hear the engine.
export async function analyzeMechanicalVideo(
  videoBase64: string,
  mimeType: string,
  code: MechanicalPointCode,
  language?: string,
): Promise<PhotoAiPart> {
  const point = MECHANICAL_POINTS.find((p) => p.code === code);
  if (!isMediaConfigured() || !videoBase64) {
    return {
      detected_issues: [],
      suspicious_observations: [],
      summary: point
        ? `Recorded "${point.title}". Detailed AI video analysis not available (demo mode); the guided observations drive the score.`
        : "",
      confidence: 35,
    };
  }
  // NOTE: errors propagate to the caller (the deferred /analyze step) so the
  // real failure reason can be recorded instead of silently scoring 100.
  return runStructuredMedia<PhotoAiPart>({
    system: `${AI_RULES}

TASK: Analyze the RECORDING for the mechanical check "${point?.title ?? code}". It may be a video (frames + soundtrack) or an audio-only clip. Consider anything visible if present (e.g. exhaust smoke colour, warning lights, leaks, fluid colour, vibrations) AND any audible cues (engine note, knocking, rattles, whistles, idle stability). For an audio-only clip, base the analysis entirely on the sound.
Look for: ${(point?.ai_targets ?? []).join(", ") || "relevant mechanical signs"}.
Be cautious and non-diagnostic. Return JSON exactly:
{
 "detected_issues": [{ "issue_type": "other", "location": string, "severity": "low|moderate|high|critical", "confidence": number, "explanation": string, "recommended_follow_up_photo": null }],
 "suspicious_observations": string[],
 "summary": string,
 "confidence": number
}${languageDirective(language)}`,
    userText: `Mechanical point: ${code}. Analyze the full video and return the JSON.`,
    base64: videoBase64,
    mimeType,
  });
}

// Combine the buyer's observations with the optional AI photo pass.
export function buildMechanicalItemAnalysis(
  code: MechanicalPointCode,
  observations: Record<string, boolean> | null,
  ai?: PhotoAiPart | null,
  opts?: { locale?: string; analyzed?: boolean },
): MechanicalItemAnalysis {
  const base = scoreFromObservations(code, observations);

  // AI issues add an extra penalty proportional to severity * confidence.
  const sevPenalty: Record<string, number> = { low: 6, moderate: 14, high: 24, critical: 36 };
  const aiPenalty = (ai?.detected_issues ?? []).reduce(
    (sum, i) => sum + (sevPenalty[i.severity] ?? 0) * (i.confidence / 100),
    0,
  );
  const score = Math.max(0, Math.min(100, Math.round(base.score - aiPenalty)));

  const suspicious = [
    ...base.suspicious,
    ...(ai?.suspicious_observations ?? []),
  ];
  const point = MECHANICAL_POINTS.find((p) => p.code === code);

  return {
    // Every check gets a concrete conclusion: the AI summary when the media was
    // analyzed, otherwise a specific localized statement (never a bare score).
    summary:
      ai?.summary ||
      fallbackSummary(point, code, suspicious, opts?.locale ?? "en", Boolean(opts?.analyzed)),
    score,
    severity: severityFromScore(score),
    detected_issues: ai?.detected_issues ?? [],
    suspicious_observations: suspicious,
    confidence: ai?.confidence ?? 50,
  };
}

// Aggregate completed items into the unified mechanical report section.
export function aggregateMechanical(
  items: MechanicalCheckItem[],
): MechanicalReportSection | null {
  const completed = items.filter(
    (i) => i.analysis_status === "completed" && i.score != null,
  );
  if (completed.length === 0) return null;

  const titleFor = (code: MechanicalPointCode) =>
    MECHANICAL_POINTS.find((p) => p.code === code)?.title ?? code;

  const avg = Math.round(
    completed.reduce((a, i) => a + (i.score ?? 0), 0) / completed.length,
  );
  // A single critical item caps the overall score.
  const hasCritical = completed.some((i) => i.severity === "critical");
  const mechanical_score = hasCritical ? Math.min(avg, 38) : avg;
  const risk_level = mechanicalScoreToRisk(mechanical_score);

  const suspicious = completed.flatMap(
    (i) => i.ai_analysis?.suspicious_observations ?? [],
  );

  return {
    mechanical_score,
    risk_level,
    recommendation: mechanicalRiskToRecommendation(risk_level),
    summary: suspicious.length
      ? `Based on ${completed.length} completed check(s), ${suspicious.length} point(s) warrant attention. A professional mechanic should confirm before purchase.`
      : `Based on ${completed.length} completed check(s), no obvious mechanical concern was reported. A professional inspection is still recommended.`,
    items: completed
      .sort(
        (a, b) =>
          (MECHANICAL_POINTS.find((p) => p.code === a.point_code)?.order_index ?? 0) -
          (MECHANICAL_POINTS.find((p) => p.code === b.point_code)?.order_index ?? 0),
      )
      .map((i) => ({
        point_code: i.point_code,
        title: titleFor(i.point_code),
        score: i.score,
        severity: i.severity,
        suspicious_observations: i.ai_analysis?.suspicious_observations ?? [],
        summary: i.ai_analysis?.summary ?? null,
      })),
    seller_questions: DEFAULT_MECHANICAL_SELLER_QUESTIONS,
    mechanic_questions: DEFAULT_MECHANICAL_MECHANIC_QUESTIONS,
    disclaimer: MECHANICAL_DISCLAIMER,
  };
}
