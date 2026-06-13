import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  RiskScoreCircle,
  RiskLevelBadge,
  RecommendationBadge,
  ScoreBreakdown,
} from "@/components/risk-indicators";
import {
  NegotiationArgumentsList,
  PositivePointsList,
  SellerQuestionsList,
  SuspiciousPointsList,
} from "@/components/analysis-lists";
import { PhotoAnalysisCard } from "@/components/photo-analysis-card";
import { GenerateReportButton } from "@/components/report-actions";
import { DisclaimerBanner } from "@/components/disclaimer-banner";
import { EmptyState } from "@/components/empty-state";
import { RECOMMENDATION_COPY, REPORT_DISCLAIMER } from "@/lib/constants";
import type { FinalReport, InspectionPhoto, InspectionSession } from "@/types";

export const metadata = { title: "AI Analysis — CarGuard AI" };

export default async function AnalysisPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: s } = await supabase
    .from("inspection_sessions")
    .select("*")
    .eq("id", id)
    .single();
  if (!s) notFound();
  const session = s as InspectionSession;

  const { data: photos } = await supabase
    .from("inspection_photos")
    .select("*")
    .eq("inspection_session_id", id)
    .order("photo_point_code");

  const analyzed = (photos ?? []).filter(
    (p: InspectionPhoto) => p.ai_analysis,
  ) as InspectionPhoto[];

  if (session.global_score == null) {
    return (
      <div className="px-5 py-6">
        <EmptyState
          title="No analysis yet"
          description="Upload the 8 photos and run the AI analysis from the scanner."
          actionLabel="Go to scanner"
          actionHref={`/inspections/${id}/photos`}
        />
      </div>
    );
  }

  const report = session.final_report as FinalReport | null;
  const rec = session.recommendation;

  return (
    <div className="px-5 py-6">
      <Link
        href={`/inspections/${id}`}
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> Back to inspection
      </Link>

      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">AI Analysis</h1>
        <GenerateReportButton sessionId={id} />
      </div>

      {/* Summary */}
      <Card className="mb-6">
        <CardContent className="flex flex-col items-center gap-6 p-6 sm:flex-row">
          <RiskScoreCircle score={session.global_score} label="Global score" />
          <div className="flex-1 space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <RiskLevelBadge level={session.risk_level} />
              <RecommendationBadge recommendation={rec} />
            </div>
            <p className="text-sm text-muted-foreground">{session.ai_summary}</p>
            {rec && (
              <p className="rounded-md bg-muted/50 p-3 text-sm">
                {RECOMMENDATION_COPY[rec].text}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Scores */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-base">Score breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <ScoreBreakdown
            scores={[
              { label: "Accident / repair", value: session.accident_repair_score },
              { label: "Alignment", value: session.alignment_score },
              { label: "Paint / tone", value: session.paint_tone_score },
              { label: "Symmetry", value: session.symmetry_score },
              { label: "Bumpers / lights", value: session.bumpers_lights_score },
              { label: "Overall consistency", value: session.overall_consistency_score },
              { label: "Model risk", value: session.model_risk_score },
            ]}
          />
        </CardContent>
      </Card>

      {/* Points + questions */}
      <div className="mb-6 grid gap-4 md:grid-cols-2">
        <PositivePointsList items={report?.positive_points ?? []} />
        <SuspiciousPointsList items={report?.suspicious_points ?? []} />
        <SellerQuestionsList items={report?.questions_to_ask_seller ?? []} />
        <NegotiationArgumentsList items={report?.negotiation_arguments ?? []} />
      </div>

      {/* Photo-by-photo */}
      <h2 className="mb-3 text-lg font-semibold">Photo-by-photo analysis</h2>
      <div className="mb-6 grid gap-4 md:grid-cols-2">
        {analyzed.map((p) => (
          <PhotoAnalysisCard key={p.id} photo={p} />
        ))}
      </div>

      <DisclaimerBanner text={REPORT_DISCLAIMER} />
    </div>
  );
}
