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
  summary: {
    photos_analyzed: number;
    photo_quality_summary: string;
    risk_level: RiskLevel;
    recommendation: Recommendation;
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
}
