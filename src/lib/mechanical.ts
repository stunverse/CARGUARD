// =====================================================================
// CarGuard AI — Engine & Mechanical Check: point definitions + scoring
// Unified optional module (points 2-15). Each step combines optional
// media (photo/video) with GUIDED OBSERVATIONS the buyer ticks; the
// observations drive a robust score even when automatic video analysis
// is limited. Photos are additionally analyzed by AI vision.
// =====================================================================

import type {
  MechanicalPoint,
  MechanicalRecommendation,
  MechanicalRiskLevel,
  Severity,
} from "@/types";

export const MECHANICAL_DISCLAIMER =
  "This engine & mechanical check is based only on the photos, videos and observations you provide. CarGuard AI is not a certified mechanic and cannot diagnose or guarantee the condition of the engine or drivetrain. Always confirm with a professional mechanic before purchase.";

export const MECHANICAL_POINTS: MechanicalPoint[] = [
  {
    code: "cold_start",
    title: "Cold start (video)",
    order_index: 1,
    media_type: "video",
    required: true,
    instruction:
      "Record a 20–30s video with the hood open while the seller starts the engine cold. Keep the phone steady, no music.",
    why_it_matters:
      "A cold start reveals the most: slow cranking, knocking, metallic noises, shaking, smoke or a hunting idle.",
    ai_targets: [
      "exhaust_smoke_at_startup",
      "smoke_color_white_blue_black",
      "dashboard_warning_lights_still_on",
      "visible_engine_shaking_or_vibration",
      "fluid_leaks_in_engine_bay",
    ],
    observations: [
      { key: "long_to_start", label: "Engine took a long time to start", kind: "suspect", weight: 18 },
      { key: "metallic_noise", label: "Metallic / 'tin can' noise at start", kind: "suspect", weight: 22 },
      { key: "loud_knocking", label: "Loud, regular knocking ('clac clac clac')", kind: "suspect", weight: 30 },
      { key: "engine_shakes", label: "Engine visibly shaking", kind: "suspect", weight: 18 },
      { key: "smoke_at_start", label: "Smoke from the exhaust at start", kind: "suspect", weight: 16 },
      { key: "idle_hunting", label: "Idle rises and falls (hunting)", kind: "suspect", weight: 16 },
      { key: "engine_light_on", label: "Engine warning light stays on", kind: "suspect", weight: 26 },
      { key: "started_cleanly", label: "Started quickly and ran smoothly", kind: "good", weight: 0 },
    ],
  },
  {
    code: "dashboard_lights",
    title: "Dashboard warning lights (2 photos)",
    order_index: 2,
    media_type: "photo_pair",
    required: true,
    instruction:
      "Take one photo with ignition ON / engine OFF, then a second photo with the engine running. Some lights must appear at ignition then disappear after starting.",
    why_it_matters:
      "An engine light that stays on after starting is a strong warning. No lights at all at ignition can mean a cluster was tampered with.",
    ai_targets: ["dashboard_warning_lights"],
    observations: [
      { key: "engine_light_stays_on", label: "Engine light stays ON after starting", kind: "suspect", weight: 32 },
      { key: "oil_light_on", label: "Oil pressure light on", kind: "suspect", weight: 30 },
      { key: "battery_light_on", label: "Battery / charge light on", kind: "suspect", weight: 20 },
      { key: "temp_light_on", label: "Coolant temperature light on", kind: "suspect", weight: 28 },
      { key: "dpf_light_on", label: "DPF / emissions light on", kind: "suspect", weight: 18 },
      { key: "no_lights_at_ignition", label: "No lights at all at ignition (possibly masked)", kind: "suspect", weight: 24 },
      { key: "lights_normal", label: "Lights appeared at ignition then cleared", kind: "good", weight: 0 },
    ],
  },
  {
    code: "exhaust_smoke",
    title: "Exhaust smoke (video)",
    order_index: 3,
    media_type: "video",
    required: true,
    instruction:
      "Film the exhaust at start, at idle, and during a light rev. Thick smoke that persists is the suspicious part.",
    why_it_matters:
      "White (head gasket/coolant), blue (oil burning/turbo), or black (injectors/EGR/DPF) smoke each point to different risks.",
    ai_targets: [
      "exhaust_smoke_color",
      "smoke_density_thick_or_light",
      "persistent_vs_brief_smoke",
      "smoke_visible_at_tailpipe",
    ],
    observations: [
      { key: "white_thick_persistent", label: "Thick white smoke that persists", kind: "suspect", weight: 32 },
      { key: "blue_smoke", label: "Blue smoke", kind: "suspect", weight: 30 },
      { key: "black_excessive", label: "Excessive black smoke", kind: "suspect", weight: 22 },
      { key: "light_vapor_cold", label: "Only light white vapor in cold weather (normal)", kind: "good", weight: 0 },
      { key: "no_smoke", label: "No visible smoke", kind: "good", weight: 0 },
    ],
  },
  {
    code: "oil_dipstick",
    title: "Engine oil — dipstick (photo)",
    order_index: 4,
    media_type: "photo",
    required: true,
    instruction:
      "Pull the dipstick, wipe it, reinsert, pull again and photograph the tip showing the oil level and color.",
    why_it_matters:
      "Level, color and 'mayonnaise' (oil/water mix) reveal maintenance neglect or a possible head-gasket issue.",
    ai_targets: ["oil_level", "oil_color", "oil_mayonnaise"],
    observations: [
      { key: "level_below_min", label: "Level below minimum", kind: "suspect", weight: 20 },
      { key: "very_black_thick", label: "Oil very black and thick", kind: "suspect", weight: 14 },
      { key: "mayonnaise", label: "Beige 'mayonnaise' on the dipstick", kind: "suspect", weight: 34 },
      { key: "fuel_smell", label: "Strong fuel smell", kind: "suspect", weight: 22 },
      { key: "level_too_high", label: "Level much too high", kind: "suspect", weight: 18 },
      { key: "level_color_normal", label: "Level between min/max, normal color", kind: "good", weight: 0 },
    ],
  },
  {
    code: "oil_cap",
    title: "Oil filler cap underside (photo)",
    order_index: 5,
    media_type: "photo",
    required: true,
    instruction: "Unscrew the oil filler cap and photograph its underside.",
    why_it_matters:
      "A beige mayonnaise deposit or thick sludge under the cap can indicate an oil/water mix (head gasket).",
    ai_targets: ["oil_cap_mayonnaise", "sludge"],
    observations: [
      { key: "mayonnaise_deposit", label: "Beige/white mayonnaise deposit", kind: "suspect", weight: 32 },
      { key: "thick_sludge", label: "Thick sludge", kind: "suspect", weight: 22 },
      { key: "pasty_oil", label: "Abnormally pasty oil", kind: "suspect", weight: 18 },
      { key: "clean", label: "Clean underside", kind: "good", weight: 0 },
    ],
  },
  {
    code: "coolant",
    title: "Coolant reservoir (photo)",
    order_index: 6,
    media_type: "photo",
    required: true,
    instruction: "Photograph the coolant reservoir (engine cold) showing the level and liquid color.",
    why_it_matters:
      "Oil traces, muddy color or continuous bubbles in the coolant are key signs of a possible head-gasket failure.",
    ai_targets: ["coolant_level", "coolant_color", "oil_in_coolant"],
    observations: [
      { key: "level_very_low", label: "Level very low", kind: "suspect", weight: 20 },
      { key: "brown_muddy", label: "Brown / muddy liquid", kind: "suspect", weight: 24 },
      { key: "oil_traces", label: "Oil traces in the reservoir", kind: "suspect", weight: 32 },
      { key: "continuous_bubbles", label: "Continuous bubbles with engine running", kind: "suspect", weight: 30 },
      { key: "clean_normal", label: "Clean liquid, level between min/max", kind: "good", weight: 0 },
    ],
  },
  {
    code: "leaks_under_engine",
    title: "Leaks under the engine (photo)",
    order_index: 7,
    media_type: "photo",
    required: true,
    instruction:
      "Photograph under the engine and under the car (around the sump, turbo and hoses if visible).",
    why_it_matters:
      "Oil or colored coolant on the ground signals a leak. A suspiciously clean engine on an old/high-mileage car can hide a recently cleaned leak.",
    ai_targets: ["oil_leak", "coolant_leak", "overly_clean_engine"],
    observations: [
      { key: "oil_on_ground", label: "Oil on the ground", kind: "suspect", weight: 24 },
      { key: "colored_coolant", label: "Green/pink/orange coolant", kind: "suspect", weight: 24 },
      { key: "greasy_traces", label: "Greasy traces", kind: "suspect", weight: 16 },
      { key: "suspiciously_clean_engine", label: "Engine abnormally clean for the age/mileage", kind: "suspect", weight: 14 },
      { key: "no_leak", label: "No visible leak", kind: "good", weight: 0 },
    ],
  },
  {
    code: "idle_noise",
    title: "Idle engine noise (video)",
    order_index: 8,
    media_type: "video",
    required: true,
    instruction: "Film 30s at idle with the hood open. Listen for knocks, rubbing, whistles or squeals.",
    why_it_matters:
      "Noises that grow with revs, loud knocking when hot, or excessive shaking point to mechanical wear.",
    ai_targets: [
      "visible_engine_vibration_at_idle",
      "dashboard_warning_lights",
      "worn_or_loose_belt",
      "fluid_leaks_or_smoke_in_engine_bay",
    ],
    observations: [
      { key: "metallic_knock", label: "Metallic knocking", kind: "suspect", weight: 28 },
      { key: "rubbing", label: "Rubbing noise", kind: "suspect", weight: 18 },
      { key: "loud_whistle", label: "Loud whistle", kind: "suspect", weight: 20 },
      { key: "belt_squeal", label: "Belt squeal", kind: "suspect", weight: 16 },
      { key: "engine_shakes", label: "Engine shaking", kind: "suspect", weight: 18 },
      { key: "unstable_idle", label: "Unstable idle", kind: "suspect", weight: 22 },
      { key: "smooth_idle", label: "Smooth, steady idle", kind: "good", weight: 0 },
    ],
  },
  {
    code: "acceleration",
    title: "Acceleration at standstill (video)",
    order_index: 9,
    media_type: "video",
    required: true,
    instruction:
      "Have the seller gently rev to ~2,500–3,000 rpm while you film. Watch smoke, noise and how the revs climb.",
    why_it_matters:
      "Blue/black smoke, stumbling, metallic noise or unstable revs under load reveal problems a static idle hides.",
    ai_targets: [
      "exhaust_smoke_color_under_rev",
      "black_or_blue_smoke_when_revving",
      "smoke_density_increase_under_load",
      "dashboard_warning_lights",
    ],
    observations: [
      { key: "blue_black_smoke", label: "Blue or black smoke", kind: "suspect", weight: 28 },
      { key: "engine_stumbles", label: "Engine stumbles / hesitates", kind: "suspect", weight: 22 },
      { key: "metallic_noise", label: "Metallic noise", kind: "suspect", weight: 26 },
      { key: "unstable_rpm", label: "Unstable revs", kind: "suspect", weight: 20 },
      { key: "smooth_pull", label: "Smooth, clean rev climb", kind: "good", weight: 0 },
    ],
  },
  {
    code: "engine_temperature",
    title: "Engine temperature (photo after driving)",
    order_index: 10,
    media_type: "photo",
    required: true,
    instruction:
      "After 10–15 min of driving, photograph the dashboard temperature gauge / display.",
    why_it_matters:
      "Temperature should stabilize around normal (~90°C on many cars). Fast rises or an overheat message are red flags.",
    ai_targets: ["temperature_gauge", "overheat_warning"],
    observations: [
      { key: "temp_above_normal", label: "Temperature above normal", kind: "suspect", weight: 30 },
      { key: "rising_fast", label: "Temperature rising fast", kind: "suspect", weight: 28 },
      { key: "overheat_message", label: "Overheat message displayed", kind: "suspect", weight: 40 },
      { key: "fan_loud", label: "Cooling fan running abnormally hard", kind: "suspect", weight: 14 },
      { key: "stable_normal", label: "Stable around normal temperature", kind: "good", weight: 0 },
    ],
  },
  {
    code: "turbo",
    title: "Turbo check (questions)",
    order_index: 11,
    media_type: "questionnaire",
    required: true,
    instruction: "For turbo (diesel or petrol) cars, answer these. Skip if the car has no turbo.",
    why_it_matters: "Whistling, power loss, blue smoke, oil around hoses or limp mode point to turbo wear.",
    observations: [
      { key: "loud_whistle", label: "Loud whistling sound", kind: "suspect", weight: 22 },
      { key: "lacks_power", label: "Car lacks power", kind: "suspect", weight: 22 },
      { key: "blue_black_smoke", label: "Blue or black smoke", kind: "suspect", weight: 26 },
      { key: "oil_around_hoses", label: "Oil around hoses / turbo", kind: "suspect", weight: 24 },
      { key: "limp_mode", label: "Engine goes into limp mode", kind: "suspect", weight: 30 },
      { key: "not_turbo_or_ok", label: "No turbo, or no turbo issue noticed", kind: "good", weight: 0 },
    ],
  },
  {
    code: "fluid_after_test",
    title: "Fluid under the car after the test drive (photo)",
    order_index: 12,
    media_type: "photo",
    required: true,
    instruction: "After the drive, let the car sit a minute, then photograph the ground underneath.",
    why_it_matters: "A leak that appears only once the engine is hot is an important warning.",
    ai_targets: ["oil_leak", "coolant_leak"],
    observations: [
      { key: "oil_drops", label: "Oil drops", kind: "suspect", weight: 24 },
      { key: "coolant", label: "Coolant", kind: "suspect", weight: 24 },
      { key: "greasy_clear", label: "Greasy clear liquid", kind: "suspect", weight: 16 },
      { key: "fuel_smell", label: "Fuel smell", kind: "suspect", weight: 18 },
      { key: "none", label: "Nothing under the car", kind: "good", weight: 0 },
    ],
  },
  // ----- Optional -----
  {
    code: "road_test",
    title: "Road test (optional)",
    order_index: 13,
    media_type: "questionnaire",
    required: false,
    instruction: "If you can drive the car, note what you observe.",
    why_it_matters: "Behavior under real load reveals power loss, jerks, overheating or warning lights.",
    observations: [
      { key: "car_sluggish", label: "Car feels sluggish", kind: "suspect", weight: 20 },
      { key: "power_loss", label: "Power loss", kind: "suspect", weight: 22 },
      { key: "jerks", label: "Jerks / hesitation", kind: "suspect", weight: 18 },
      { key: "smoke_in_mirror", label: "Smoke visible in the mirror", kind: "suspect", weight: 24 },
      { key: "temp_rising", label: "Temperature rising abnormally", kind: "suspect", weight: 26 },
      { key: "warning_light_appears", label: "Warning light appears while driving", kind: "suspect", weight: 28 },
      { key: "burning_smell", label: "Burning smell", kind: "suspect", weight: 24 },
      { key: "all_good", label: "Drove well, no issue", kind: "good", weight: 0 },
    ],
  },
  {
    code: "maintenance_records",
    title: "Maintenance records (optional)",
    order_index: 14,
    media_type: "docs",
    required: false,
    instruction: "Upload photos of service invoices / the maintenance logbook if available.",
    why_it_matters: "A documented history strongly reduces the risk of hidden defects.",
    observations: [
      { key: "no_invoices", label: "No invoices at all", kind: "suspect", weight: 18 },
      { key: "empty_logbook", label: "Empty service logbook", kind: "suspect", weight: 16 },
      { key: "vague_seller", label: "Seller vague about service history", kind: "suspect", weight: 14 },
      { key: "mileage_inconsistent", label: "Mileage inconsistent across documents", kind: "suspect", weight: 26 },
      { key: "recent_service_documented", label: "Recent service documented with invoices", kind: "good", weight: 0 },
    ],
  },
];

export const MANDATORY_MECHANICAL_CODES = MECHANICAL_POINTS.filter(
  (p) => p.required,
).map((p) => p.code);

// --------------------------------------------------------------------
// Scoring
// --------------------------------------------------------------------
const clamp = (n: number) => Math.max(0, Math.min(100, Math.round(n)));

export function severityFromScore(score: number): Severity {
  if (score >= 85) return "none";
  if (score >= 65) return "low";
  if (score >= 40) return "moderate";
  if (score >= 20) return "high";
  return "critical";
}

// Per-item score from the buyer's ticked observations.
export function scoreFromObservations(
  code: string,
  observations: Record<string, boolean> | null | undefined,
): { score: number; severity: Severity; suspicious: string[] } {
  const point = MECHANICAL_POINTS.find((p) => p.code === code);
  if (!point || !observations) {
    return { score: 100, severity: "none", suspicious: [] };
  }
  let penalty = 0;
  const suspicious: string[] = [];
  for (const obs of point.observations) {
    if (obs.kind === "suspect" && observations[obs.key]) {
      penalty += obs.weight;
      suspicious.push(obs.label);
    }
  }
  const score = clamp(100 - penalty);
  return { score, severity: severityFromScore(score), suspicious };
}

export function mechanicalScoreToRisk(score: number): MechanicalRiskLevel {
  if (score >= 85) return "low";
  if (score >= 65) return "moderate";
  if (score >= 40) return "high";
  return "very_high";
}

export function mechanicalRiskToRecommendation(
  level: MechanicalRiskLevel,
): MechanicalRecommendation {
  switch (level) {
    case "low":
      return "normal";
    case "moderate":
      return "monitor";
    case "high":
      return "professional_inspection";
    case "very_high":
      return "avoid_without_diagnosis";
    default:
      return "insufficient_data";
  }
}

export const MECHANICAL_RISK_COPY: Record<MechanicalRiskLevel, string> = {
  low: "Normal",
  moderate: "Low to moderate risk",
  high: "Moderate to high risk",
  very_high: "High risk",
  insufficient_data: "Insufficient data",
};

export const MECHANICAL_RECOMMENDATION_COPY: Record<MechanicalRecommendation, string> = {
  normal:
    "No obvious mechanical concern was reported from the provided checks. This does not guarantee engine condition.",
  monitor:
    "A few points are worth monitoring. Ask the seller for context and maintenance records.",
  ask_seller_questions:
    "Some findings should be clarified with the seller before purchase.",
  professional_inspection:
    "Several findings may suggest a mechanical issue. A professional mechanic inspection is recommended before purchase.",
  avoid_without_diagnosis:
    "Concerning findings were reported. Do not buy without a professional mechanical diagnosis.",
  insufficient_data:
    "Not enough mechanical checks were completed for a reliable assessment.",
};

export const DEFAULT_MECHANICAL_SELLER_QUESTIONS = [
  "When was the last oil change, and do you have the invoice?",
  "Has the timing belt/chain or water pump ever been replaced?",
  "Has the head gasket ever been worked on?",
  "Are there any warning lights, even occasional ones?",
  "Has the turbo or EGR/DPF ever been replaced (if applicable)?",
  "Do you have the full maintenance history?",
];

export const DEFAULT_MECHANICAL_MECHANIC_QUESTIONS = [
  "Can you scan the car for fault codes?",
  "Can you check compression and for head-gasket symptoms?",
  "Can you inspect for oil and coolant leaks?",
  "Can you check the turbo, EGR and DPF (if applicable)?",
  "Can you verify the cooling system and operating temperature?",
];
