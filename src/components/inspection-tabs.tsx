"use client";

import Link from "next/link";
import { Camera, Car, Volume2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { FollowUpPhotoRequestCard } from "@/components/follow-up-photo-request-card";
import { EngineAudioTab } from "@/components/engine-audio-tab";
import { MechanicalCheckTab } from "@/components/mechanical-check-tab";
import { VinHistoryCard } from "@/components/vin-history-card";
import { ReportPreview } from "@/components/report-preview";
import {
  GenerateReportButton,
  PdfExportButton,
} from "@/components/report-actions";
import { EmptyState } from "@/components/empty-state";
import { PHOTO_POINTS, RECOMMENDATION_COPY } from "@/lib/constants";
import { MECHANICAL_RISK_COPY } from "@/lib/mechanical";
import { formatDate, formatPrice } from "@/lib/utils";
import type {
  EngineAudioCheck,
  FinalReport,
  InspectionPhoto,
  InspectionSession,
  MechanicalCheckItem,
  Vehicle,
} from "@/types";

const SCORE_HELP: Record<string, string> = {
  "Accident / repair": "Overall likelihood of previous accident or body repair signs.",
  Alignment: "Hood, trunk, doors, fenders, bumpers, lights gaps.",
  "Paint / tone": "Color/gloss differences and possible repaint.",
  Symmetry: "Left/right and front/rear visual balance.",
  "Bumpers / lights": "Bumper fitment and replaced headlights/taillights.",
  "Overall consistency": "Repetition of anomalies across all photos.",
  "Model risk": "Known weak spots for this make/model (when available).",
};

export function InspectionTabs({
  session,
  vehicle,
  photos,
  followUps,
  logs,
  report,
  engineAudio,
  mechanicalItems,
}: {
  session: InspectionSession;
  vehicle: Vehicle | null;
  photos: InspectionPhoto[];
  engineAudio: EngineAudioCheck | null;
  mechanicalItems: MechanicalCheckItem[];
  followUps: {
    id: string;
    title: string;
    instruction: string | null;
    reason: string | null;
    target_area: string | null;
    status: string;
    image_url: string | null;
    ai_analysis: { summary?: string } | null;
  }[];
  logs: {
    id: string;
    action_type: string;
    action_description: string | null;
    created_at: string;
  }[];
  report: FinalReport | null;
}) {
  const analyzed = session.global_score != null;
  const completed = photos.filter((p) =>
    ["passed", "skipped"].includes(p.quality_status),
  ).length;
  const analyzedPhotos = photos.filter((p) => p.ai_analysis);
  const rec = session.recommendation;

  return (
    <Tabs defaultValue="overview">
      <TabsList>
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="photos">Photos</TabsTrigger>
        <TabsTrigger value="analysis">AI Analysis</TabsTrigger>
        <TabsTrigger value="scores">Scores</TabsTrigger>
        <TabsTrigger value="followups">Follow-up photos</TabsTrigger>
        <TabsTrigger value="engine-mechanical">Engine &amp; Mechanical</TabsTrigger>
        <TabsTrigger value="report">Report</TabsTrigger>
        <TabsTrigger value="activity">Activity log</TabsTrigger>
      </TabsList>

      {/* Overview */}
      <TabsContent value="overview">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Car className="size-5 text-primary" /> Vehicle information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid grid-cols-2 gap-3 text-sm">
                <Info label="Make" value={vehicle?.make} />
                <Info label="Model" value={vehicle?.model} />
                <Info label="Year" value={vehicle?.year} />
                <Info label="Mileage" value={vehicle?.mileage} />
                <Info label="Asking price" value={formatPrice(vehicle?.asking_price, vehicle?.currency ?? "USD")} />
                <Info label="Seller" value={vehicle?.seller_type} />
                <Info label="VIN" value={vehicle?.vin} />
                <Info label="Country" value={vehicle?.country} />
              </dl>
              {analyzed && session.ai_summary && (
                <p className="mt-4 rounded-md bg-muted/50 p-3 text-sm text-muted-foreground">
                  {session.ai_summary}
                </p>
              )}
            </CardContent>
          </Card>

          <div className="space-y-4">
            {analyzed ? (
              <Card>
                <CardContent className="flex flex-col items-center gap-3 p-6">
                  <RiskScoreCircle score={session.global_score} label="Global score" />
                  <div className="flex flex-wrap justify-center gap-2">
                    <RiskLevelBadge level={session.risk_level} />
                    <RecommendationBadge recommendation={rec} />
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="border-accent/30 bg-accent/5">
                <CardContent className="p-6 text-center">
                  <Camera className="mx-auto mb-2 size-8 text-accent" />
                  <p className="text-sm">{completed}/8 photos completed.</p>
                  <Button asChild className="mt-3 w-full">
                    <Link href={`/inspections/${session.id}/photos`}>Continue scanner</Link>
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Engine & Mechanical (optional) */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Volume2 className="size-4 text-accent" /> Engine &amp; Mechanical
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                {session.mechanical_score != null ? (
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge
                      variant={
                        ["high", "very_high"].includes(session.mechanical_risk_level ?? "")
                          ? "critical"
                          : "low"
                      }
                    >
                      {session.mechanical_score}/100
                    </Badge>
                    <span className="text-muted-foreground">
                      {session.mechanical_risk_level
                        ? MECHANICAL_RISK_COPY[session.mechanical_risk_level]
                        : ""}
                    </span>
                  </div>
                ) : (
                  <Badge variant="secondary">Not started</Badge>
                )}
                <p className="text-xs text-muted-foreground">
                  Optional: guided engine checks (cold start, smoke, oil, coolant,
                  leaks, noises…) + AI startup-sound analysis.
                </p>
              </CardContent>
            </Card>

            {/* Paid per-VIN history (NMVTIS via VinAudit) */}
            {vehicle?.vin && <VinHistoryCard sessionId={session.id} vin={vehicle.vin} />}
          </div>
        </div>
      </TabsContent>

      {/* Photos */}
      <TabsContent value="photos">
        <div className="mb-4 flex justify-end">
          <Button asChild variant="outline">
            <Link href={`/inspections/${session.id}/photos`}>
              <Camera className="size-4" /> Open scanner
            </Link>
          </Button>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {PHOTO_POINTS.map((p) => {
            const ph = photos.find((x) => x.photo_point_code === p.code);
            return (
              <Card key={p.code}>
                <CardContent className="flex items-center gap-3 p-4">
                  {ph?.image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={ph.image_url} alt={p.title} className="size-16 rounded-md object-cover" />
                  ) : (
                    <div className="flex size-16 items-center justify-center rounded-md bg-muted text-muted-foreground">
                      <Camera className="size-6" />
                    </div>
                  )}
                  <div className="flex-1">
                    <div className="text-sm font-medium">{p.order_index}. {p.title}</div>
                    <Badge
                      variant={
                        ph?.quality_status === "passed"
                          ? "low"
                          : ph?.quality_status === "needs_retake"
                            ? "moderate"
                            : ph?.quality_status === "skipped"
                              ? "secondary"
                              : "outline"
                      }
                    >
                      {ph?.quality_status ?? "pending"}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </TabsContent>

      {/* AI Analysis */}
      <TabsContent value="analysis">
        {!analyzed ? (
          <EmptyState title="No analysis yet" description="Run the AI analysis from the scanner." actionLabel="Go to scanner" actionHref={`/inspections/${session.id}/photos`} />
        ) : (
          <div className="space-y-6">
            {rec && (
              <Card>
                <CardContent className="p-4 text-sm">{RECOMMENDATION_COPY[rec].text}</CardContent>
              </Card>
            )}
            <div className="grid gap-4 md:grid-cols-2">
              <PositivePointsList items={report?.positive_points ?? []} />
              <SuspiciousPointsList items={report?.suspicious_points ?? []} />
              <SellerQuestionsList items={report?.questions_to_ask_seller ?? []} />
              <NegotiationArgumentsList items={report?.negotiation_arguments ?? []} />
            </div>
            <h3 className="text-lg font-semibold">Photo-by-photo</h3>
            <div className="grid gap-4 md:grid-cols-2">
              {analyzedPhotos.map((p) => (
                <PhotoAnalysisCard key={p.id} photo={p} />
              ))}
            </div>
          </div>
        )}
      </TabsContent>

      {/* Scores */}
      <TabsContent value="scores">
        {!analyzed ? (
          <EmptyState title="No scores yet" description="Run the analysis to compute scores." />
        ) : (
          <Card>
            <CardContent className="p-6">
              <ScoreBreakdown
                scores={[
                  { label: "Accident / repair", value: session.accident_repair_score, description: SCORE_HELP["Accident / repair"] },
                  { label: "Alignment", value: session.alignment_score, description: SCORE_HELP["Alignment"] },
                  { label: "Paint / tone", value: session.paint_tone_score, description: SCORE_HELP["Paint / tone"] },
                  { label: "Symmetry", value: session.symmetry_score, description: SCORE_HELP["Symmetry"] },
                  { label: "Bumpers / lights", value: session.bumpers_lights_score, description: SCORE_HELP["Bumpers / lights"] },
                  { label: "Overall consistency", value: session.overall_consistency_score, description: SCORE_HELP["Overall consistency"] },
                  { label: "Model risk", value: session.model_risk_score, description: SCORE_HELP["Model risk"] },
                ]}
              />
            </CardContent>
          </Card>
        )}
      </TabsContent>

      {/* Follow-up photos */}
      <TabsContent value="followups">
        {followUps.length === 0 ? (
          <EmptyState title="No follow-up photos requested" description="The AI requests close-ups only when it detects something worth a second look." />
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {followUps.map((f) => (
              <FollowUpPhotoRequestCard key={f.id} sessionId={session.id} request={f} />
            ))}
          </div>
        )}
      </TabsContent>

      {/* Engine & Mechanical (unified optional module) */}
      <TabsContent value="engine-mechanical">
        <div className="space-y-8">
          <MechanicalCheckTab
            sessionId={session.id}
            initialItems={mechanicalItems}
            mechanicalScore={session.mechanical_score}
            mechanicalRisk={session.mechanical_risk_level}
          />
          <div>
            <h3 className="mb-1 text-lg font-semibold">Deep engine-sound analysis (AI)</h3>
            <p className="mb-3 text-sm text-muted-foreground">
              Optional: upload an MP3/WAV of the cold start for an AI analysis of
              the startup sound (complements the cold-start step above).
            </p>
            <EngineAudioTab sessionId={session.id} initialCheck={engineAudio} />
          </div>
        </div>
      </TabsContent>

      {/* Report */}
      <TabsContent value="report">
        {report ? (
          <div className="space-y-4">
            <div className="flex flex-wrap justify-end gap-2">
              <PdfExportButton sessionId={session.id} />
            </div>
            <ReportPreview report={report} />
          </div>
        ) : analyzed ? (
          <div className="flex flex-col items-center gap-4 py-10">
            <p className="text-muted-foreground">No report generated yet.</p>
            <GenerateReportButton sessionId={session.id} />
          </div>
        ) : (
          <EmptyState title="No report yet" description="Run the analysis first." />
        )}
      </TabsContent>

      {/* Activity log */}
      <TabsContent value="activity">
        <Card>
          <CardContent className="space-y-2 p-4 text-sm">
            {logs.length === 0 && <p className="text-muted-foreground">No activity yet.</p>}
            {logs.map((l) => (
              <div key={l.id} className="flex justify-between gap-3 border-b pb-2 last:border-0">
                <span>{l.action_description || l.action_type.replaceAll("_", " ")}</span>
                <span className="shrink-0 text-muted-foreground">{formatDate(l.created_at)}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}

function Info({ label, value }: { label: string; value: unknown }) {
  return (
    <div>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="font-medium">{value ? String(value) : "—"}</dd>
    </div>
  );
}

