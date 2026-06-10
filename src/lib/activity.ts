// Activity log helper (spec §34). Best-effort: never throws into the flow.
import type { SupabaseClient } from "@supabase/supabase-js";

export type ActivityAction =
  | "inspection_created"
  | "vehicle_info_updated"
  | "photo_uploaded"
  | "photo_quality_checked"
  | "photo_retake_requested"
  | "photo_analyzed"
  | "follow_up_photo_requested"
  | "global_analysis_completed"
  | "report_generated"
  | "pdf_exported"
  | "report_shared"
  | "engine_audio_uploaded"
  | "engine_audio_quality_checked"
  | "engine_audio_retake_requested"
  | "engine_audio_analysis_started"
  | "engine_audio_analysis_completed"
  | "engine_audio_added_to_report";

export async function logActivity(
  supabase: SupabaseClient,
  params: {
    userId: string;
    sessionId?: string | null;
    action: ActivityAction;
    description?: string;
    metadata?: Record<string, unknown>;
  },
): Promise<void> {
  try {
    await supabase.from("activity_logs").insert({
      user_id: params.userId,
      inspection_session_id: params.sessionId ?? null,
      action_type: params.action,
      action_description: params.description ?? null,
      metadata: params.metadata ?? null,
    });
  } catch (err) {
    console.error("logActivity failed:", err);
  }
}
