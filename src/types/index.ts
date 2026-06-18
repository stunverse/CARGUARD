// =====================================================================
// CarGuard AI — Domain types
// Mirror the database schema (supabase/migrations) and the AI JSON
// contracts (lib/ai). Keep enums in sync with SQL CHECK constraints.
// =====================================================================

export type SellerType =
  | "private"
  | "dealership"
  | "garage"
  | "marketplace"
  | "unknown";

export type InspectionGoal =
  | "check_accident"
  | "detect_repaint"
  | "suspicious"
  | "negotiate"
  | "quick_report";

export type InspectionStatus =
  | "draft"
  | "waiting_for_photos"
  | "photos_uploaded"
  | "quality_check_in_progress"
  | "quality_check_failed"
  | "ready_for_analysis"
  | "analysis_in_progress"
  | "analysis_completed"
  | "report_generated"
  | "archived";

export type RiskLevel = "low" | "moderate" | "high" | "very_high";

export type Recommendation =
  | "buy"
  | "negotiate"
  | "professional_inspection"
  | "avoid"
  | "insufficient_photos";

export type Severity = "none" | "low" | "moderate" | "high" | "critical";

export type UploadStatus = "pending" | "uploaded" | "failed";
export type QualityStatus = "pending" | "passed" | "failed" | "needs_retake" | "skipped";
export type AnalysisStatus = "pending" | "analyzing" | "completed" | "failed";

export type PhotoPointCode =
  | "front_view"
  | "rear_view"
  | "left_side_view"
  | "right_side_view"
  | "front_left_diagonal"
  | "front_right_diagonal"
  | "rear_left_diagonal"
  | "rear_right_diagonal";

export type PlanName = "free" | "starter" | "plus" | "pro";

// ---------------------------------------------------------------------
// Records
// ---------------------------------------------------------------------
export interface Profile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  phone: string | null;
  country: string | null;
  preferred_language: string | null;
  is_admin: boolean;
  terms_accepted_at: string | null;
  disclaimer_accepted_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Vehicle {
  id: string;
  user_id: string;
  make: string;
  model: string;
  year: number | null;
  generation: string | null;
  trim: string | null;
  engine: string | null;
  fuel_type: string | null;
  transmission: string | null;
  mileage: number | null;
  asking_price: number | null;
  currency: string | null;
  seller_type: SellerType | null;
  listing_url: string | null;
  vin: string | null;
  country: string | null;
  city: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface InspectionSession {
  id: string;
  user_id: string;
  vehicle_id: string | null;
  goal: InspectionGoal | null;
  status: InspectionStatus;
  global_score: number | null;
  accident_repair_score: number | null;
  alignment_score: number | null;
  paint_tone_score: number | null;
  symmetry_score: number | null;
  bumpers_lights_score: number | null;
  overall_consistency_score: number | null;
  model_risk_score: number | null;
  recommendation: Recommendation | null;
  risk_level: RiskLevel | null;
  ai_summary: string | null;
  final_report: FinalReport | null;
  report_pdf_url: string | null;
  // Unified engine & mechanical module (optional).
  mechanical_score: number | null;
  mechanical_risk_level: MechanicalRiskLevel | null;
  mechanical_recommendation: MechanicalRecommendation | null;
  created_at: string;
  updated_at: string;
}

export interface PhotoPoint {
  id: string;
  code: PhotoPointCode;
  title: string;
  description: string | null;
  required: boolean;
  order_index: number;
  category: string | null;
  instruction: string | null;
  why_it_matters: string | null;
  expected_angle: string | null;
  example_image_url: string | null;
  ai_detection_targets: string[] | null;
  created_at: string;
  updated_at: string;
}

export interface InspectionPhoto {
  id: string;
  user_id: string;
  inspection_session_id: string;
  photo_point_id: string | null;
  photo_point_code: PhotoPointCode | null;
  image_url: string | null;
  storage_path: string | null;
  original_file_name: string | null;
  mime_type: string | null;
  file_size: number | null;
  upload_status: UploadStatus;
  quality_status: QualityStatus;
  quality_feedback: string | null;
  analysis_status: AnalysisStatus;
  ai_quality_check: PhotoQualityResult | null;
  ai_analysis: PhotoAnalysisResult | null;
  detected_issues: DetectedIssue[] | null;
  severity: Severity | null;
  confidence: number | null;
  created_at: string;
  updated_at: string;
}

// ---------------------------------------------------------------------
// AI contracts (see lib/ai)
// ---------------------------------------------------------------------
export interface PhotoQualityResult {
  is_usable: boolean;
  quality_score: number; // 0-100
  detected_angle: PhotoPointCode | "unknown";
  matches_requested_angle: boolean;
  issues: string[];
  retake_required: boolean;
  retake_instructions: string;
  confidence: number; // 0-100
}

export type IssueType =
  | "alignment_issue"
  | "color_mismatch"
  | "bumper_misalignment"
  | "headlight_replacement_suspected"
  | "trunk_misalignment"
  | "door_alignment_issue"
  | "possible_repaint"
  | "visible_damage"
  | "other";

export interface DetectedIssue {
  issue_type: IssueType;
  location: string;
  severity: Exclude<Severity, "none">;
  confidence: number;
  explanation: string;
  recommended_follow_up_photo: string | null;
}

export interface PhotoAnalysisResult {
  photo_point_code: PhotoPointCode;
  summary: string;
  normal_observations: string[];
  suspicious_observations: string[];
  detected_issues: DetectedIssue[];
  risk_score: number; // 0-100 (higher = safer, see scoring spec)
  confidence: number;
  needs_follow_up_photos: boolean;
  follow_up_photo_requests: FollowUpRequestSeed[];
}

export interface FollowUpRequestSeed {
  title: string;
  instruction: string;
  reason: string;
  target_area: string;
}

export interface FullInspectionResult {
  global_summary: string;
  accident_repair_score: number;
  alignment_score: number;
  paint_tone_score: number;
  symmetry_score: number;
  bumpers_lights_score: number;
  overall_consistency_score: number;
  model_risk_score: number;
  risk_level: RiskLevel;
  recommendation: Recommendation;
  positive_points: string[];
  suspicious_points: string[];
  most_concerning_photos: PhotoPointCode[];
  questions_to_ask_seller: string[];
  negotiation_arguments: string[];
  recommended_next_steps: string[];
  professional_inspection_recommended: boolean;
  disclaimer: string;
}

// ---------------------------------------------------------------------
// Final report (stored in inspection_reports.report_content)
// ---------------------------------------------------------------------
export interface FinalReport {
  generated_at: string;
  vehicle: Partial<Vehicle>;
  // Prose summary covering all modules (photos + engine + history).
  ai_summary?: string;
  summary: {
    photos_analyzed: number;
    photo_quality_summary: string;
    risk_level: RiskLevel;
    recommendation: Recommendation;
    // Overall AI confidence in this analysis (0-100). Optional for older reports.
    confidence?: number;
  };
  scores: {
    global_score: number;
    accident_repair_score: number;
    alignment_score: number;
    paint_tone_score: number;
    symmetry_score: number;
    bumpers_lights_score: number;
    overall_consistency_score: number;
    model_risk_score: number;
    mechanical_score?: number | null;
  };
  positive_points: string[];
  suspicious_points: string[];
  photo_analysis: Array<{
    photo_point_code: PhotoPointCode;
    title: string;
    quality_score: number | null;
    risk_score: number | null;
    observations: string[];
    detected_issues: DetectedIssue[];
    confidence: number | null;
  }>;
  questions_to_ask_seller: string[];
  negotiation_arguments: string[];
  recommended_next_steps: string[];
  disclaimer: string;
  // Optional engine-start audio module (null when no audio was provided).
  engine_audio?: EngineAudioReportSection | null;
  // Optional engine & mechanical module (null when not performed).
  mechanical?: MechanicalReportSection | null;
  // Optional vehicle history (recalls/complaints) — null when unavailable.
  vehicle_history?: VehicleHistorySection | null;
  // Specifications & equipment (VIN decode + provided data). US + EU.
  specifications?: VehicleSpecsSection | null;
  // Mileage consistency / odometer-rollback heuristic. US + EU.
  mileage_check?: MileageCheckSection | null;
  // Safety rating (NHTSA NCAP for US; EU provider later). Null when unavailable.
  safety?: SafetyRatingSection | null;
  // Adverse title flags (salvage/flood/theft…) from a paid VIN report. US now.
  title_flags?: TitleFlagsSection | null;
  // Heuristic market-value estimate vs asking price. Works worldwide.
  market_value?: MarketValueSection | null;
  // Supporting documents the buyer photographed (maintenance, registration…).
  documents?: DocumentsSection | null;
}

// ---------------------------------------------------------------------
// Supporting documents (maintenance, registration, non-pledge, MOT…).
// Their presence raises the report's confidence.
// ---------------------------------------------------------------------
export interface ReportDocument {
  doc_type: string; // i18n key suffix (doc.<code>.title)
  provided: boolean;
  key: boolean; // a key document (weighs more in confidence)
  summary?: string | null; // optional AI-read summary
}
export interface DocumentsSection {
  provided_count: number;
  relevant_count: number;
  key_provided: number;
  key_total: number;
  items: ReportDocument[];
  note: string;
  disclaimer: string;
}

// ---------------------------------------------------------------------
// Market value — heuristic estimate (no provider). Compares the asking price
// to a fair band derived from the vehicle age and mileage. Works worldwide.
// ---------------------------------------------------------------------
export type MarketValueVerdict = "underpriced" | "fair" | "overpriced" | "unknown";
export interface MarketValueSection {
  currency: string;
  asking_price: number | null;
  estimated_low: number | null;
  estimated_high: number | null;
  verdict: MarketValueVerdict;
  expected_mileage: number | null;
  actual_mileage: number | null;
  unit: "km" | "mi";
  // When set, the range comes from a real data provider (not the heuristic).
  source?: string | null;
  disclaimer: string;
}

// ---------------------------------------------------------------------
// Safety rating. US via NHTSA NCAP (free). EU (Euro NCAP) has no free API
// today — a provider can be wired later behind the same shape.
// ---------------------------------------------------------------------
export interface SafetyRatingSection {
  source: string; // "NHTSA NCAP"
  matched: boolean;
  vehicle: string;
  overall: string | null;
  frontal: string | null;
  side: string | null;
  rollover: string | null;
  note: string;
  disclaimer: string;
}

// ---------------------------------------------------------------------
// Adverse title flags (salvage / flood / theft / total-loss…). Derived from
// a purchased per-VIN report (NMVTIS via VinAudit). EU provider later.
// ---------------------------------------------------------------------
export interface TitleFlag {
  category: string; // i18n key suffix, e.g. "salvage", "flood", "theft"
  detail: string; // raw brand text from the provider
}
export interface TitleFlagsSection {
  source: string; // "NMVTIS"
  checked: boolean; // a paid report was available
  clean: boolean; // no adverse brand found
  flags: TitleFlag[];
  disclaimer: string;
}

// ---------------------------------------------------------------------
// Specifications & equipment (NHTSA vPIC decode + user-provided data).
// Works worldwide: richer with a decodable VIN, falls back to the fields
// the buyer entered (make/model/year/fuel/transmission…).
// ---------------------------------------------------------------------
export interface VehicleSpecItem {
  key: string; // i18n key suffix, e.g. "displacement_l"
  value: string;
}
export interface VehicleSpecGroup {
  group: "identity" | "engine" | "drivetrain" | "manufacture" | "safety";
  items: VehicleSpecItem[];
}
export interface VehicleSpecsSection {
  source: string; // "NHTSA vPIC" or "Provided"
  vin_decoded: boolean;
  groups: VehicleSpecGroup[];
}

// ---------------------------------------------------------------------
// Mileage consistency (odometer-rollback heuristic). US + EU.
// ---------------------------------------------------------------------
export type MileageCheckStatus = "ok" | "attention" | "suspicious" | "unknown";
export interface MileageCheckSection {
  status: MileageCheckStatus;
  mileage: number | null;
  unit: "km" | "mi";
  vehicle_age_years: number | null;
  avg_per_year: number | null;
  expected_per_year: number;
  flags: string[]; // i18n key suffixes, e.g. "very_low_for_age"
  note: string;
  disclaimer: string;
}

// ---------------------------------------------------------------------
// Vehicle history (free sources — US NHTSA: recalls + complaints)
// ---------------------------------------------------------------------
export interface VehicleRecall {
  campaign: string;
  component: string;
  summary: string;
  remedy: string;
  date: string;
}

export interface VehicleHistorySection {
  source: string; // e.g. "NHTSA"
  matched: boolean;
  vehicle: string; // "2020 Honda Accord"
  recalls: VehicleRecall[];
  recall_count: number;
  complaints_count: number;
  top_complaint_components: string[];
  note: string;
  disclaimer: string;
}

// Paid per-VIN report (VinAudit / NMVTIS).
export interface VinTitleRecord {
  state?: string;
  date?: string;
  brand?: string;
  mileage?: string;
}

export interface VinHistoryReport {
  vin: string;
  provider: string;
  fetched_at: string;
  titles: VinTitleRecord[];
  brands: string[]; // salvage, flood, junk, rebuilt, lemon…
  title_count: number;
  salvage_or_total_loss: boolean;
  theft_record: boolean | null;
  odometer_readings: { date?: string; mileage?: string; source?: string }[];
  sale_listings: { date?: string; price?: string; odometer?: string }[];
  summary: string;
  disclaimer: string;
}

// ---------------------------------------------------------------------
// Engine Start Audio Analysis (optional module)
// ---------------------------------------------------------------------
export type EngineAudioRiskLevel =
  | "low"
  | "moderate"
  | "high"
  | "very_high"
  | "insufficient_audio";

export type EngineAudioRecommendation =
  | "normal_sound"
  | "monitor"
  | "ask_seller_questions"
  | "professional_inspection"
  | "avoid_without_diagnosis"
  | "insufficient_audio";

export type EngineSoundType =
  | "hard_start"
  | "knocking"
  | "metallic_rattling"
  | "timing_chain_rattle"
  | "belt_squeal"
  | "rough_idle"
  | "misfire_like_sound"
  | "starter_issue"
  | "exhaust_leak_suspicion"
  | "air_leak_suspicion"
  | "turbo_whistle_abnormal"
  | "normal_startup"
  | "other";

export interface DetectedEngineSound {
  sound_type: EngineSoundType;
  severity: "low" | "moderate" | "high" | "critical";
  confidence: number;
  timestamp_start: number;
  timestamp_end: number;
  explanation: string;
  possible_causes: string[];
  recommended_action: string;
}

export interface EngineAudioQualityCheck {
  is_usable: boolean;
  audio_quality_score: number;
  duration_seconds: number;
  engine_start_detected: boolean;
  engine_idle_detected: boolean;
  background_noise_level: "low" | "moderate" | "high";
  volume_level: "too_low" | "good" | "too_high" | "saturated";
  issues: { type: string; explanation: string }[];
  retake_required: boolean;
  retake_instructions: string;
  confidence: number;
}

export interface EngineAudioAnalysis {
  summary: string;
  engine_audio_score: number;
  startup_quality_score: number;
  idle_stability_score: number;
  mechanical_noise_score: number;
  belt_chain_noise_score: number;
  exhaust_noise_score: number;
  risk_level: EngineAudioRiskLevel;
  recommendation: EngineAudioRecommendation;
  detected_sounds: DetectedEngineSound[];
  positive_observations: string[];
  suspicious_observations: string[];
  seller_questions: string[];
  mechanic_questions: string[];
  next_steps: string[];
  disclaimer: string;
  confidence_score: number;
}

export type EngineAudioUploadStatus = "pending" | "uploaded" | "failed";
export type EngineAudioQualityStatus = "pending" | "passed" | "failed" | "needs_retake";
export type EngineAudioAnalysisStatus = "pending" | "analyzing" | "completed" | "failed";

export interface EngineAudioCheck {
  id: string;
  user_id: string;
  inspection_session_id: string;
  vehicle_id: string | null;
  file_url: string | null;
  storage_path: string | null;
  original_file_name: string | null;
  file_type: string | null;
  mime_type: string | null;
  file_size: number | null;
  duration_seconds: number | null;
  upload_status: EngineAudioUploadStatus;
  quality_status: EngineAudioQualityStatus;
  analysis_status: EngineAudioAnalysisStatus;
  audio_quality_score: number | null;
  engine_audio_score: number | null;
  startup_quality_score: number | null;
  idle_stability_score: number | null;
  mechanical_noise_score: number | null;
  belt_chain_noise_score: number | null;
  exhaust_noise_score: number | null;
  confidence_score: number | null;
  risk_level: EngineAudioRiskLevel | null;
  recommendation: EngineAudioRecommendation | null;
  ai_quality_check: EngineAudioQualityCheck | null;
  ai_analysis: EngineAudioAnalysis | null;
  detected_sounds: DetectedEngineSound[] | null;
  seller_questions: string[] | null;
  mechanic_questions: string[] | null;
  created_at: string;
  updated_at: string;
}

// Embedded in the final report.
export interface EngineAudioReportSection {
  file_name: string | null;
  duration_seconds: number | null;
  audio_quality_score: number | null;
  engine_audio_score: number | null;
  risk_level: EngineAudioRiskLevel;
  recommendation: EngineAudioRecommendation;
  detected_sounds: DetectedEngineSound[];
  summary: string;
  seller_questions: string[];
  mechanic_questions: string[];
  disclaimer: string;
}

// ---------------------------------------------------------------------
// Engine & Mechanical Check (unified optional module, points 2-15)
// ---------------------------------------------------------------------
export type MechanicalPointCode =
  | "cold_start"
  | "dashboard_lights"
  | "exhaust_smoke"
  | "oil_dipstick"
  | "oil_cap"
  | "coolant"
  | "leaks_under_engine"
  | "idle_noise"
  | "acceleration"
  | "engine_temperature"
  | "turbo"
  | "fluid_after_test"
  | "road_test"
  | "maintenance_records";

export type MechanicalMediaType =
  | "photo"
  | "photo_pair"
  | "video"
  | "questionnaire"
  | "docs";

export type MechanicalRiskLevel =
  | "low"
  | "moderate"
  | "high"
  | "very_high"
  | "insufficient_data";

export type MechanicalRecommendation =
  | "normal"
  | "monitor"
  | "ask_seller_questions"
  | "professional_inspection"
  | "avoid_without_diagnosis"
  | "insufficient_data";

// A guided checkbox/question on a mechanical step.
export interface MechanicalObservation {
  key: string;
  label: string;
  // "suspect" lowers the score by `weight`; "good" is reassuring (weight 0).
  kind: "suspect" | "good";
  weight: number; // 0-40 severity contribution
}

export interface MechanicalPoint {
  code: MechanicalPointCode;
  title: string;
  order_index: number;
  media_type: MechanicalMediaType;
  required: boolean;
  instruction: string;
  why_it_matters: string;
  observations: MechanicalObservation[];
  ai_targets?: string[];
}

export interface MechanicalItemAnalysis {
  summary: string;
  score: number; // 0-100, higher = safer
  severity: Severity;
  detected_issues: DetectedIssue[];
  suspicious_observations: string[];
  confidence: number;
}

export interface MechanicalCheckItem {
  id: string;
  user_id: string;
  inspection_session_id: string;
  vehicle_id: string | null;
  point_code: MechanicalPointCode;
  media_type: MechanicalMediaType | null;
  image_url: string | null;
  image_url_2: string | null;
  video_url: string | null;
  storage_path: string | null;
  storage_path_2: string | null;
  video_storage_path: string | null;
  doc_urls: string[] | null;
  mime_type: string | null;
  file_size: number | null;
  duration_seconds: number | null;
  observations: Record<string, boolean> | null;
  questionnaire_answers: Record<string, string> | null;
  upload_status: "pending" | "uploaded" | "failed";
  quality_status: "pending" | "passed" | "failed" | "needs_retake" | "skipped";
  analysis_status: "pending" | "analyzing" | "completed" | "failed";
  score: number | null;
  severity: Severity | null;
  confidence: number | null;
  ai_analysis: MechanicalItemAnalysis | null;
  detected_issues: DetectedIssue[] | null;
  created_at: string;
  updated_at: string;
}

export interface MechanicalReportSection {
  mechanical_score: number;
  risk_level: MechanicalRiskLevel;
  recommendation: MechanicalRecommendation;
  summary: string;
  items: Array<{
    point_code: MechanicalPointCode;
    title: string;
    score: number | null;
    severity: Severity | null;
    suspicious_observations: string[];
    summary: string | null;
  }>;
  seller_questions: string[];
  mechanic_questions: string[];
  disclaimer: string;
}
