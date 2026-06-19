// =====================================================================
// CarGuard AI — Shared constants
// Disclaimers, brand copy, scoring thresholds, recommendation texts.
// =====================================================================

import type {
  PhotoPointCode,
  Recommendation,
  RiskLevel,
} from "@/types";

export const BRAND = {
  name: "CarGuard AI",
  tagline: "AI-powered hidden damage detection for used car buyers.",
  promise:
    "Take 8 guided exterior photos. CarGuard AI helps you detect signs of previous accidents, repainting, body repairs, or hidden damage before buying a used car.",
};

// Canonical public base URL (no trailing slash). Used for SEO metadata,
// sitemap, robots and structured data. Override per environment if needed.
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://www.carguard-ai.com"
).replace(/\/+$/, "");

// Public contact email surfaced in legal pages and structured data.
export const CONTACT_EMAIL = "contact@carguard-ai.com";

// ---------------------------------------------------------------------
// Disclaimers (shown at signup, and before every report)
// ---------------------------------------------------------------------
export const SIGNUP_DISCLAIMER =
  "CarGuard AI provides photo-based informational assistance only. It does not replace a professional vehicle inspection, mechanic, body shop specialist, or certified automotive expert. Results are based only on the photos and information provided by the user. CarGuard AI cannot guarantee that a vehicle has or has not been involved in an accident.";

export const REPORT_DISCLAIMER =
  "This report is AI-generated and based only on the uploaded photos. It should be used as a preliminary screening tool, not as a definitive inspection. Always request vehicle history documents and consider a professional inspection before purchase.";

// ---------------------------------------------------------------------
// The 8 mandatory exterior photo points.
// Fallback used if the DB seed has not run yet (keeps the scanner usable).
// Source of truth is public.inspection_photo_points.
// ---------------------------------------------------------------------
export interface PhotoPointSeed {
  code: PhotoPointCode;
  title: string;
  order_index: number;
  instruction: string;
  why_it_matters: string;
  ai_detection_targets: string[];
}

export const PHOTO_POINTS: PhotoPointSeed[] = [
  {
    code: "front_view",
    title: "Front view",
    order_index: 1,
    instruction:
      "Stand directly in front of the vehicle. Take a clear photo showing the entire front of the car, including the hood, headlights, grille, bumper, and both front corners.",
    why_it_matters:
      "Reveals hood/headlight/bumper alignment, grille replacement, color differences across front panels, visible front impact, and front symmetry.",
    ai_detection_targets: [
      "hood_alignment",
      "headlight_alignment",
      "front_bumper_alignment",
      "grille_alignment",
      "front_symmetry",
      "color_difference_front_panels",
      "visible_damage_front",
      "possible_previous_front_repair",
    ],
  },
  {
    code: "rear_view",
    title: "Rear view",
    order_index: 2,
    instruction:
      "Stand directly behind the vehicle. Take a clear photo showing the entire rear of the car, including the trunk, rear lights, bumper, and both rear corners.",
    why_it_matters:
      "Reveals trunk/tail-light/bumper alignment, color differences, replaced bumper, possible rear impact, and rear symmetry.",
    ai_detection_targets: [
      "trunk_alignment",
      "rear_light_alignment",
      "rear_bumper_alignment",
      "rear_symmetry",
      "color_difference_rear_panels",
      "visible_damage_rear",
      "possible_previous_rear_repair",
    ],
  },
  {
    code: "left_side_view",
    title: "Left side view",
    order_index: 3,
    instruction:
      "Stand on the left side of the vehicle. Take a clear photo showing the entire side from front bumper to rear bumper.",
    why_it_matters:
      "Reveals fender/door/quarter-panel alignment, rocker panel condition, side color consistency, lateral impact, and replaced/repainted panels.",
    ai_detection_targets: [
      "left_front_fender_alignment",
      "left_front_door_alignment",
      "left_rear_door_alignment",
      "left_rear_quarter_alignment",
      "left_rocker_panel_condition",
      "left_side_color_consistency",
      "left_side_visible_damage",
      "possible_left_side_repair",
    ],
  },
  {
    code: "right_side_view",
    title: "Right side view",
    order_index: 4,
    instruction:
      "Stand on the right side of the vehicle. Take a clear photo showing the entire side from front bumper to rear bumper.",
    why_it_matters:
      "Reveals fender/door/quarter-panel alignment, rocker panel condition, side color consistency, lateral impact, and replaced/repainted panels.",
    ai_detection_targets: [
      "right_front_fender_alignment",
      "right_front_door_alignment",
      "right_rear_door_alignment",
      "right_rear_quarter_alignment",
      "right_rocker_panel_condition",
      "right_side_color_consistency",
      "right_side_visible_damage",
      "possible_right_side_repair",
    ],
  },
  {
    code: "front_left_diagonal",
    title: "Front-left diagonal view",
    order_index: 5,
    instruction:
      "Stand at the front-left corner of the vehicle. Take a photo showing both the front and the left side of the car.",
    why_it_matters:
      "Reveals consistency between front and left side, hood-to-fender gap, bumper-to-fender alignment, left headlight, reflections/tone, and front-left impact.",
    ai_detection_targets: [
      "front_left_corner_alignment",
      "hood_to_left_fender_gap",
      "bumper_to_left_fender_alignment",
      "left_headlight_position",
      "left_front_panel_color_consistency",
      "front_left_visible_damage",
      "possible_front_left_repair",
    ],
  },
  {
    code: "front_right_diagonal",
    title: "Front-right diagonal view",
    order_index: 6,
    instruction:
      "Stand at the front-right corner of the vehicle. Take a photo showing both the front and the right side of the car.",
    why_it_matters:
      "Reveals consistency between front and right side, hood-to-fender gap, bumper-to-fender alignment, right headlight, reflections/tone, and front-right impact.",
    ai_detection_targets: [
      "front_right_corner_alignment",
      "hood_to_right_fender_gap",
      "bumper_to_right_fender_alignment",
      "right_headlight_position",
      "right_front_panel_color_consistency",
      "front_right_visible_damage",
      "possible_front_right_repair",
    ],
  },
  {
    code: "rear_left_diagonal",
    title: "Rear-left diagonal view",
    order_index: 7,
    instruction:
      "Stand at the rear-left corner of the vehicle. Take a photo showing both the rear and the left side of the car.",
    why_it_matters:
      "Reveals consistency between rear and left side, trunk-to-quarter gap, bumper-to-quarter alignment, left tail light, reflections/tone, and rear-left impact.",
    ai_detection_targets: [
      "rear_left_corner_alignment",
      "trunk_to_left_quarter_gap",
      "rear_bumper_to_left_quarter_alignment",
      "left_tail_light_position",
      "left_rear_panel_color_consistency",
      "rear_left_visible_damage",
      "possible_rear_left_repair",
    ],
  },
  {
    code: "rear_right_diagonal",
    title: "Rear-right diagonal view",
    order_index: 8,
    instruction:
      "Stand at the rear-right corner of the vehicle. Take a photo showing both the rear and the right side of the car.",
    why_it_matters:
      "Reveals consistency between rear and right side, trunk-to-quarter gap, bumper-to-quarter alignment, right tail light, reflections/tone, and rear-right impact.",
    ai_detection_targets: [
      "rear_right_corner_alignment",
      "trunk_to_right_quarter_gap",
      "rear_bumper_to_right_quarter_alignment",
      "right_tail_light_position",
      "right_rear_panel_color_consistency",
      "rear_right_visible_damage",
      "possible_rear_right_repair",
    ],
  },
];

export const REQUIRED_PHOTO_COUNT = PHOTO_POINTS.length; // 8

// ---------------------------------------------------------------------
// Scoring → risk level. Higher score = lower risk (visible safety).
// ---------------------------------------------------------------------
export function scoreToRiskLevel(score: number): RiskLevel {
  if (score >= 85) return "low";
  if (score >= 65) return "moderate";
  if (score >= 40) return "high";
  return "very_high";
}

export function riskLevelToRecommendation(level: RiskLevel): Recommendation {
  switch (level) {
    case "low":
      return "buy";
    case "moderate":
      return "negotiate";
    case "high":
      return "professional_inspection";
    case "very_high":
      return "avoid";
  }
}

// ---------------------------------------------------------------------
// Recommendation display copy (prudent phrasing — never accusatory).
// ---------------------------------------------------------------------
export const RECOMMENDATION_COPY: Record<
  Recommendation,
  { label: string; text: string }
> = {
  buy: {
    label: "Low risk",
    text: "No obvious sign of previous accident or major body repair was detected from the provided photos. The vehicle appears visually consistent. However, this does not guarantee the vehicle has never been damaged. A professional inspection and vehicle history report are still recommended.",
  },
  negotiate: {
    label: "Moderate risk",
    text: "Some visual elements should be verified before purchase. Ask the seller about previous body repairs, repainting, or accident history. Use the highlighted points as negotiation arguments.",
  },
  professional_inspection: {
    label: "High risk",
    text: "Several visual signs may suggest previous repairs or possible accident damage. Do not make a deposit before a professional inspection or body shop review.",
  },
  avoid: {
    label: "Very high risk",
    text: "The photos show multiple concerning signs compatible with previous accident damage or body repairs. It may be safer to avoid this vehicle unless a professional inspection confirms otherwise.",
  },
  insufficient_photos: {
    label: "Insufficient photos",
    text: "The provided photos are not sufficient for a reliable analysis. Please retake the flagged photos with the full vehicle visible in good lighting.",
  },
};

export const RISK_LEVEL_COPY: Record<RiskLevel, string> = {
  low: "Low risk",
  moderate: "Moderate risk",
  high: "High risk",
  very_high: "Very high risk",
};

export const SELLER_TYPE_OPTIONS = [
  { value: "private", label: "Private seller" },
  { value: "dealership", label: "Dealership" },
  { value: "garage", label: "Garage" },
  { value: "marketplace", label: "Marketplace seller" },
  { value: "unknown", label: "Unknown" },
] as const;

export const INSPECTION_GOAL_OPTIONS = [
  { value: "check_accident", label: "I want to check if the car may have been accidented" },
  { value: "detect_repaint", label: "I want to detect repainting or body repairs" },
  { value: "suspicious", label: "I want to know if the car looks suspicious" },
  { value: "negotiate", label: "I want arguments to negotiate" },
  { value: "quick_report", label: "I want a quick risk report before buying" },
] as const;

// Allowed upload types & size (security spec).
export const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/heic",
  "image/webp",
];
export const MAX_IMAGE_BYTES = 15 * 1024 * 1024; // 15 MB

// ---------------------------------------------------------------------
// Engine Start Audio Analysis (optional module)
// ---------------------------------------------------------------------
export const ALLOWED_AUDIO_TYPES = [
  "audio/mp3",
  "audio/mpeg",
  "audio/wav",
  "audio/x-wav",
  "audio/m4a",
  "audio/x-m4a",
  "audio/aac",
  "audio/ogg",
  "audio/webm",
];
export const ALLOWED_VIDEO_TYPES = [
  "video/mp4",
  "video/quicktime",
  "video/webm",
];
export const MAX_AUDIO_BYTES = 25 * 1024 * 1024; // 25 MB
export const MAX_VIDEO_BYTES = 50 * 1024 * 1024; // 50 MB (Supabase default cap)

// Public (non-secret) storage bucket names — used by the browser to
// upload directly to Supabase Storage, bypassing the serverless body limit.
export const STORAGE_BUCKETS = {
  inspectionPhotos: "inspection-photos",
  engineAudio: "engine-audio",
  mechanical: "mechanical-media",
  documents: "inspection-documents",
} as const;

export const ENGINE_AUDIO_DISCLAIMER =
  "This engine-sound analysis is based only on the uploaded audio and its quality. CarGuard AI is not a certified mechanic and cannot diagnose or guarantee the condition of the engine. Always confirm with a professional mechanic before purchase.";

export const ENGINE_SOUND_LABELS: Record<string, string> = {
  hard_start: "Hard start",
  knocking: "Knocking",
  metallic_rattling: "Metallic rattling",
  timing_chain_rattle: "Timing chain rattle",
  belt_squeal: "Belt squeal",
  rough_idle: "Rough idle",
  misfire_like_sound: "Misfire-like sound",
  starter_issue: "Starter issue",
  exhaust_leak_suspicion: "Exhaust leak suspicion",
  air_leak_suspicion: "Air / vacuum leak suspicion",
  turbo_whistle_abnormal: "Abnormal turbo whistle",
  normal_startup: "Normal startup",
  other: "Other",
};

export const ENGINE_AUDIO_RISK_COPY: Record<string, string> = {
  low: "Normal sound",
  moderate: "Low to moderate risk",
  high: "Moderate to high risk",
  very_high: "High risk",
  insufficient_audio: "Insufficient audio",
};

export const ENGINE_AUDIO_RECOMMENDATION_COPY: Record<string, string> = {
  normal_sound:
    "The startup sound appears normal in the provided audio. No obvious suspicious noise was detected. This does not guarantee engine condition.",
  monitor:
    "A few sounds are worth monitoring, but nothing critical was detected. Keep them in mind and ask the seller for context.",
  ask_seller_questions:
    "Some sounds should be clarified with the seller before purchase. Use the questions below.",
  professional_inspection:
    "Suspicious sounds may suggest a mechanical issue. A professional mechanic inspection is recommended before purchase.",
  avoid_without_diagnosis:
    "Concerning sounds were detected. Do not buy without a professional mechanical diagnosis.",
  insufficient_audio:
    "The audio is not sufficient for a reliable analysis. Please re-record in a quieter place with the engine clearly audible from startup.",
};

export function engineAudioScoreToRisk(
  score: number,
): "low" | "moderate" | "high" | "very_high" {
  if (score >= 85) return "low";
  if (score >= 65) return "moderate";
  if (score >= 40) return "high";
  return "very_high";
}

export function engineAudioRiskToRecommendation(
  level: "low" | "moderate" | "high" | "very_high",
): "normal_sound" | "monitor" | "professional_inspection" | "avoid_without_diagnosis" {
  switch (level) {
    case "low":
      return "normal_sound";
    case "moderate":
      return "monitor";
    case "high":
      return "professional_inspection";
    case "very_high":
      return "avoid_without_diagnosis";
  }
}

export const DEFAULT_SELLER_AUDIO_QUESTIONS = [
  "Has the engine always sounded like this at startup?",
  "When was the last oil change?",
  "Has the timing chain or timing belt ever been replaced?",
  "Has the starter motor ever been replaced?",
  "Are there any dashboard warning lights?",
  "Does the engine make this noise only when cold?",
  "Has the vehicle had any engine repairs?",
  "Can I have the car inspected by a mechanic before purchase?",
];

export const DEFAULT_MECHANIC_QUESTIONS = [
  "Can you check for timing chain noise at cold start?",
  "Can you inspect the belt tensioner and pulleys?",
  "Can you check for engine misfires?",
  "Can you inspect for exhaust leaks?",
  "Can you scan the vehicle for fault codes?",
  "Can you check the engine mounts?",
  "Can you verify oil pressure and maintenance history?",
];
