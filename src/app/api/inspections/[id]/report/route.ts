import { NextResponse, type NextRequest } from "next/server";
import { randomBytes } from "crypto";
import { createClient } from "@/lib/supabase/server";
import { generateFinalReport } from "@/lib/report";
import {
  analyzeFullInspection,
  calculateInspectionScores,
} from "@/lib/ai/functions";
import { logActivity } from "@/lib/activity";
import { scoreToRiskLevel } from "@/lib/constants";
import type { InspectionPhoto, PhotoAnalysisResult } from "@/types";

// POST /api/inspections/[id]/report — assemble + persist the final report.
export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: sessionId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: session } = await supabase
    .from("inspection_sessions")
    .select("*, vehicles(*)")
    .eq("id", sessionId)
    .single();
  if (!session) return NextResponse.json({ error: "Inspection not found." }, { status: 404 });

  const { data: photos } = await supabase
    .from("inspection_photos")
    .select("*")
    .eq("inspection_session_id", sessionId);
  const photoList = (photos ?? []) as InspectionPhoto[];

  const results: PhotoAnalysisResult[] = photoList
    .map((p) => p.ai_analysis)
    .filter(Boolean) as PhotoAnalysisResult[];

  if (results.length === 0) {
    return NextResponse.json(
      { error: "Run the analysis before generating a report." },
      { status: 400 },
    );
  }

  const vehicle = (session as { vehicles?: unknown }).vehicles ?? {};
  const scores = calculateInspectionScores(results);
  const global = await analyzeFullInspection(vehicle as never, results);

  const report = generateFinalReport({
    vehicle: vehicle as never,
    photos: photoList,
    global,
    globalScore: scores.global_score,
  });

  const shareToken = randomBytes(16).toString("hex");

  // Upsert the report (one per session for the MVP).
  await supabase
    .from("inspection_reports")
    .delete()
    .eq("inspection_session_id", sessionId);

  const { data: saved, error } = await supabase
    .from("inspection_reports")
    .insert({
      user_id: user.id,
      inspection_session_id: sessionId,
      report_content: report,
      share_token: shareToken,
      is_public: false,
    })
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await supabase
    .from("inspection_sessions")
    .update({
      status: "report_generated",
      final_report: report,
      risk_level: scoreToRiskLevel(scores.global_score),
    })
    .eq("id", sessionId);

  await logActivity(supabase, {
    userId: user.id,
    sessionId,
    action: "report_generated",
    description: `Report ${saved.id} generated`,
  });

  return NextResponse.json({ report: saved, content: report });
}
