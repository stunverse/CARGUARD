// =====================================================================
// CarGuard AI — AI functions (spec §41)
//
// Each function returns structured JSON. When OPENAI_API_KEY is absent
// (or a call fails), a deterministic, cautious MOCK is returned so the
// full product flow remains usable in development / demos.
//
// SERVER ONLY — never import from client components.
// =====================================================================

import {
  INTERACTIVE_VISION_MODEL,
  isVisionConfigured as isAIConfigured,
  runStructuredVision,
} from "./client";
import {
  fullInspectionPrompt,
  languageDirective,
  photoAnalysisPrompt,
  qualityCheckPrompt,
} from "./prompts";
import {
  PHOTO_POINTS,
  REPORT_DISCLAIMER,
  scoreToRiskLevel,
  riskLevelToRecommendation,
} from "@/lib/constants";
import type {
  DetectedIssue,
  FullInspectionResult,
  PhotoAnalysisResult,
  PhotoPointCode,
  PhotoQualityResult,
  Recommendation,
  Vehicle,
} from "@/types";

const MOCK_NOTICE =
  "[Demo mode] OpenAI is not configured, so this is a neutral placeholder result, not a real visual analysis.";

// ---------------------------------------------------------------------
// 1. checkPhotoQuality()
// ---------------------------------------------------------------------
export async function checkPhotoQuality(
  imageUrl: string,
  requestedCode: PhotoPointCode,
  language?: string,
): Promise<PhotoQualityResult> {
  if (!isAIConfigured()) {
    return {
      is_usable: true,
      quality_score: 80,
      detected_angle: requestedCode,
      matches_requested_angle: true,
      issues: [],
      retake_required: false,
      retake_instructions: "",
      confidence: 50,
    };
  }
  try {
    return await runStructuredVision<PhotoQualityResult>({
      system: qualityCheckPrompt() + languageDirective(language),
      userText: `Requested angle: ${requestedCode}. Quality-check this photo and return the JSON schema.`,
      imageUrls: [imageUrl],
      // Fast model: a usability/angle check doesn't need the heavy model.
      model: INTERACTIVE_VISION_MODEL,
    });
  } catch (err) {
    console.error("checkPhotoQuality failed, falling back:", err);
    return {
      is_usable: true,
      quality_score: 70,
      detected_angle: requestedCode,
      matches_requested_angle: true,
      issues: ["Automated quality check unavailable; proceeding."],
      retake_required: false,
      retake_instructions: "",
      confidence: 30,
    };
  }
}

// ---------------------------------------------------------------------
// 2. analyzeInspectionPhoto()
// ---------------------------------------------------------------------
export async function analyzeInspectionPhoto(
  imageUrl: string,
  code: PhotoPointCode,
  language?: string,
): Promise<PhotoAnalysisResult> {
  if (!isAIConfigured()) {
    const point = PHOTO_POINTS.find((p) => p.code === code);
    return {
      photo_point_code: code,
      summary: `${MOCK_NOTICE} Based on the ${point?.title ?? code} photo, no obvious sign was detected in this placeholder analysis.`,
      normal_observations: [
        "Panels appear visually consistent in this placeholder result.",
      ],
      suspicious_observations: [],
      detected_issues: [],
      risk_score: 88,
      confidence: 40,
      needs_follow_up_photos: false,
      follow_up_photo_requests: [],
    };
  }
  try {
    return await runStructuredVision<PhotoAnalysisResult>({
      system: photoAnalysisPrompt() + languageDirective(language),
      userText: `This photo is for angle "${code}". Analyze it and return the JSON schema. Set photo_point_code to "${code}".`,
      imageUrls: [imageUrl],
    });
  } catch (err) {
    console.error("analyzeInspectionPhoto failed, falling back:", err);
    return {
      photo_point_code: code,
      summary:
        "Automated analysis was unavailable for this photo. A professional inspection is recommended.",
      normal_observations: [],
      suspicious_observations: [],
      detected_issues: [],
      risk_score: 70,
      confidence: 20,
      needs_follow_up_photos: false,
      follow_up_photo_requests: [],
    };
  }
}

// ---------------------------------------------------------------------
// 3. analyzeFullInspection()  (also drives scores + recommendation)
// ---------------------------------------------------------------------
export async function analyzeFullInspection(
  vehicle: Partial<Vehicle>,
  photoResults: PhotoAnalysisResult[],
  language?: string,
): Promise<FullInspectionResult> {
  if (!isAIConfigured()) {
    const scores = calculateInspectionScores(photoResults);
    const risk = scoreToRiskLevel(scores.global_score);
    return {
      global_summary: `${MOCK_NOTICE} Based on ${photoResults.length} photo(s), no major visual concern was detected in this placeholder analysis. A professional inspection is still recommended before purchase.`,
      accident_repair_score: scores.accident_repair_score,
      alignment_score: scores.alignment_score,
      paint_tone_score: scores.paint_tone_score,
      symmetry_score: scores.symmetry_score,
      bumpers_lights_score: scores.bumpers_lights_score,
      overall_consistency_score: scores.overall_consistency_score,
      model_risk_score: scores.model_risk_score,
      risk_level: risk,
      recommendation: riskLevelToRecommendation(risk),
      positive_points: [
        "Panels appear visually consistent across the provided photos (placeholder).",
      ],
      suspicious_points: [],
      most_concerning_photos: [],
      questions_to_ask_seller: defaultSellerQuestions(),
      negotiation_arguments: [],
      recommended_next_steps: [
        "Request the vehicle history report (Carfax / AutoCheck or local equivalent).",
        "Consider an independent professional inspection before purchase.",
      ],
      professional_inspection_recommended: true,
      disclaimer: REPORT_DISCLAIMER,
    };
  }
  try {
    const result = await runStructuredVision<FullInspectionResult>({
      system: fullInspectionPrompt() + languageDirective(language),
      userText: JSON.stringify({
        vehicle,
        per_photo_results: photoResults,
        instructions:
          "Aggregate into the global JSON schema. Be cautious and non-accusatory.",
      }),
      temperature: 0.3,
    });
    return { ...result, disclaimer: result.disclaimer || REPORT_DISCLAIMER };
  } catch (err) {
    console.error("analyzeFullInspection failed, falling back:", err);
    const scores = calculateInspectionScores(photoResults);
    const risk = scoreToRiskLevel(scores.global_score);
    return {
      global_summary:
        "Automated global analysis was unavailable. Scores below are derived from per-photo results. A professional inspection is recommended.",
      ...scores,
      risk_level: risk,
      recommendation: riskLevelToRecommendation(risk),
      positive_points: [],
      suspicious_points: [],
      most_concerning_photos: [],
      questions_to_ask_seller: defaultSellerQuestions(),
      negotiation_arguments: [],
      recommended_next_steps: [
        "Consider an independent professional inspection before purchase.",
      ],
      professional_inspection_recommended: true,
      disclaimer: REPORT_DISCLAIMER,
    };
  }
}

// ---------------------------------------------------------------------
// 4. calculateInspectionScores()  (deterministic aggregation)
// ---------------------------------------------------------------------
export interface InspectionScores {
  global_score: number;
  accident_repair_score: number;
  alignment_score: number;
  paint_tone_score: number;
  symmetry_score: number;
  bumpers_lights_score: number;
  overall_consistency_score: number;
  model_risk_score: number;
}

export function calculateInspectionScores(
  photoResults: PhotoAnalysisResult[],
  modelRiskScore = 75,
): InspectionScores {
  if (photoResults.length === 0) {
    return {
      global_score: 0,
      accident_repair_score: 0,
      alignment_score: 0,
      paint_tone_score: 0,
      symmetry_score: 0,
      bumpers_lights_score: 0,
      overall_consistency_score: 0,
      model_risk_score: modelRiskScore,
    };
  }

  const avg = (xs: number[]) =>
    Math.round(xs.reduce((a, b) => a + b, 0) / xs.length);

  // Penalty per issue by severity, applied to relevant sub-scores.
  const severityPenalty = { low: 6, moderate: 14, high: 24, critical: 38 };
  const allIssues = photoResults.flatMap((p) => p.detected_issues ?? []);

  const penaltyFor = (types: string[]) =>
    allIssues
      .filter((i) => types.includes(i.issue_type))
      .reduce(
        (sum, i) =>
          sum + (severityPenalty[i.severity] ?? 0) * (i.confidence / 100),
        0,
      );

  const base = avg(photoResults.map((p) => p.risk_score));
  const clamp = (n: number) => Math.max(0, Math.min(100, Math.round(n)));

  const alignment_score = clamp(
    base -
      penaltyFor([
        "alignment_issue",
        "bumper_misalignment",
        "trunk_misalignment",
        "door_alignment_issue",
      ]),
  );
  const paint_tone_score = clamp(
    base - penaltyFor(["color_mismatch", "possible_repaint"]),
  );
  const bumpers_lights_score = clamp(
    base -
      penaltyFor([
        "bumper_misalignment",
        "headlight_replacement_suspected",
      ]),
  );
  const symmetry_score = clamp(base - penaltyFor(["alignment_issue"]) * 0.5);
  const overall_consistency_score = clamp(
    base - penaltyFor(["color_mismatch", "visible_damage"]) * 0.5,
  );
  const accident_repair_score = clamp(
    avg([
      alignment_score,
      paint_tone_score,
      bumpers_lights_score,
      symmetry_score,
      overall_consistency_score,
    ]),
  );
  // Supplied by the vehicle model knowledge base (neutral 75 when absent).
  const model_risk_score = clamp(modelRiskScore);

  const global_score = clamp(
    accident_repair_score * 0.6 + overall_consistency_score * 0.25 + symmetry_score * 0.15,
  );

  return {
    global_score,
    accident_repair_score,
    alignment_score,
    paint_tone_score,
    symmetry_score,
    bumpers_lights_score,
    overall_consistency_score,
    model_risk_score,
  };
}

// ---------------------------------------------------------------------
// 5. generateSellerQuestions()
// ---------------------------------------------------------------------
export function defaultSellerQuestions(): string[] {
  return [
    "Has the vehicle ever been involved in an accident?",
    "Has any body panel been repainted?",
    "Has the front or rear bumper been replaced?",
    "Do you have invoices for any body repairs?",
    "Can you provide a Carfax / AutoCheck (or local) history report?",
    "Has the vehicle ever had a salvage, rebuilt, or flood title?",
    "Are all body panels original?",
    "Can I have the car inspected by an independent body shop?",
  ];
}

export function generateSellerQuestions(
  result: Pick<FullInspectionResult, "questions_to_ask_seller">,
): string[] {
  const qs = result.questions_to_ask_seller ?? [];
  return qs.length ? qs : defaultSellerQuestions();
}

// ---------------------------------------------------------------------
// 6. generateNegotiationArguments()
// ---------------------------------------------------------------------
export function generateNegotiationArguments(
  result: Pick<FullInspectionResult, "negotiation_arguments" | "suspicious_points">,
): string[] {
  if (result.negotiation_arguments?.length) return result.negotiation_arguments;
  // Derive cautious, non-accusatory arguments from suspicious points.
  return (result.suspicious_points ?? []).map(
    (p) =>
      `${p} I would like to have this inspected or adjust the price to reflect the potential risk.`,
  );
}

// ---------------------------------------------------------------------
// 7. generateFinalReport()  — assembled in lib/report.ts from these parts.
// 8. generateFollowUpPhotoRequests()
// ---------------------------------------------------------------------
export interface FollowUpRequest {
  title: string;
  instruction: string;
  reason: string;
  target_area: string;
  triggered_by_photo_code: PhotoPointCode;
}

export function generateFollowUpPhotoRequests(
  photoResults: PhotoAnalysisResult[],
): FollowUpRequest[] {
  const requests: FollowUpRequest[] = [];
  for (const p of photoResults) {
    for (const seed of p.follow_up_photo_requests ?? []) {
      requests.push({ ...seed, triggered_by_photo_code: p.photo_point_code });
    }
    // Also derive from high/critical issues that lack an explicit request.
    for (const issue of p.detected_issues ?? []) {
      if (
        (issue.severity === "high" || issue.severity === "critical") &&
        issue.recommended_follow_up_photo
      ) {
        requests.push({
          title: `Close-up: ${issue.location}`,
          instruction: issue.recommended_follow_up_photo,
          reason: issue.explanation,
          target_area: issue.location,
          triggered_by_photo_code: p.photo_point_code,
        });
      }
    }
  }
  return requests;
}

export function recommendationFromScore(score: number): Recommendation {
  return riskLevelToRecommendation(scoreToRiskLevel(score));
}

// ---------------------------------------------------------------------
// Follow-up close-up analysis (optional photos requested by the AI).
// ---------------------------------------------------------------------
export interface FollowUpAnalysis {
  summary: string;
  suspicious_observations: string[];
  detected_issues: DetectedIssue[];
  confidence: number;
}

export async function analyzeFollowUpPhoto(
  imageUrl: string,
  targetArea: string,
  language?: string,
): Promise<FollowUpAnalysis> {
  if (!isAIConfigured()) {
    return {
      summary: `${MOCK_NOTICE} Close-up of "${targetArea}" recorded; no detailed analysis in demo mode.`,
      suspicious_observations: [],
      detected_issues: [],
      confidence: 40,
    };
  }
  try {
    return await runStructuredVision<FollowUpAnalysis>({
      system: photoAnalysisPrompt() + languageDirective(language),
      userText: `This is a close-up follow-up photo of "${targetArea}". Analyze it for signs of repair/repaint/damage and return JSON with keys: summary (string), suspicious_observations (string[]), detected_issues (array as in the schema), confidence (number).`,
      imageUrls: [imageUrl],
    });
  } catch (err) {
    console.error("analyzeFollowUpPhoto failed, falling back:", err);
    return {
      summary: "Automated close-up analysis was unavailable.",
      suspicious_observations: [],
      detected_issues: [],
      confidence: 20,
    };
  }
}
