"use client";

import { ShieldCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  RiskScoreCircle,
  RiskLevelBadge,
  RecommendationBadge,
  ScoreBreakdown,
} from "@/components/risk-indicators";
import { Badge } from "@/components/ui/badge";
import { EngineAudioReportSection } from "@/components/engine-audio-report-section";
import { MechanicalReportSection } from "@/components/mechanical-report-section";
import { vehicleLabel } from "@/lib/utils";
import { formatMoney, formatDistance } from "@/lib/i18n";
import { useI18n } from "@/components/i18n-provider";
import type { FinalReport } from "@/types";

export function ReportPreview({ report }: { report: FinalReport }) {
  const { t } = useI18n();
  const v = report.vehicle;
  return (
    <div className="space-y-6 print:space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b pb-4">
        <div className="flex items-center gap-2 text-xl font-bold">
          <ShieldCheck className="size-7 text-primary" />
          CarGuard <span className="text-accent">AI</span>
        </div>
        <span className="text-sm text-muted-foreground">
          {new Date(report.generated_at).toLocaleString()}
        </span>
      </div>

      {/* 1. Vehicle */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t("rep.s.vehicle")}</CardTitle>
        </CardHeader>
        <CardContent>
          <h3 className="text-lg font-semibold">{vehicleLabel(v)}</h3>
          <dl className="mt-2 grid grid-cols-2 gap-2 text-sm sm:grid-cols-3">
            <Item label={t("lbl.mileage")} value={formatDistance(v.mileage ?? null, v.currency)} />
            <Item label={t("lbl.askingPrice")} value={formatMoney(v.asking_price ?? null, v.currency ?? "USD")} />
            <Item label={t("lbl.seller")} value={v.seller_type} />
            <Item label={t("lbl.vin")} value={v.vin} />
            <Item label={t("lbl.country")} value={v.country} />
          </dl>
        </CardContent>
      </Card>

      {/* 2 + 3. Summary & scores */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t("rep.s.summary")}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-6 sm:flex-row">
          <div className="flex flex-col items-center gap-3">
            <RiskScoreCircle score={report.scores.global_score} label={t("score.global")} />
            <div className="flex flex-wrap justify-center gap-2">
              <RiskLevelBadge level={report.summary.risk_level} />
              <RecommendationBadge recommendation={report.summary.recommendation} />
            </div>
            <p className="text-center text-xs text-muted-foreground">
              {report.summary.photos_analyzed} {t("rep.photosAnalyzed")} ·{" "}
              {report.summary.photo_quality_summary}
            </p>
            {report.summary.confidence != null && (
              <p className="text-center text-xs font-medium text-accent">
                {t("rep.aiConfidence")}: {report.summary.confidence}%
              </p>
            )}
          </div>
          <div className="flex-1">
            <ScoreBreakdown
              scores={[
                { label: t("score.accidentRepair"), value: report.scores.accident_repair_score },
                { label: t("score.alignment"), value: report.scores.alignment_score },
                { label: t("score.paintTone"), value: report.scores.paint_tone_score },
                { label: t("score.symmetry"), value: report.scores.symmetry_score },
                { label: t("score.bumpersLights"), value: report.scores.bumpers_lights_score },
                { label: t("score.overallConsistency"), value: report.scores.overall_consistency_score },
                ...(report.scores.mechanical_score != null
                  ? [{ label: t("score.mechanical"), value: report.scores.mechanical_score }]
                  : []),
                { label: t("score.modelRisk"), value: report.scores.model_risk_score },
              ]}
            />
          </div>
          {report.ai_summary && (
            <p className="mt-4 rounded-md bg-muted/40 p-3 text-sm text-muted-foreground">
              {report.ai_summary}
            </p>
          )}
        </CardContent>
      </Card>

      {/* 4 + 5. Points */}
      <div className="grid gap-4 md:grid-cols-2">
        <Section title={`4. ${t("rep.positive")}`} items={report.positive_points} empty="—" />
        <Section title={`5. ${t("rep.suspicious")}`} items={report.suspicious_points} empty="—" />
      </div>

      {/* 6. Photo-by-photo */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t("rep.s.photoByPhoto")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {report.photo_analysis.map((p) => (
            <div key={p.photo_point_code} className="border-b pb-3 last:border-0">
              <div className="flex items-center justify-between">
                <span className="font-medium">{p.title}</span>
                <span className="text-xs text-muted-foreground">
                  Quality {p.quality_score ?? "—"} · Risk {p.risk_score ?? "—"} · Conf {p.confidence ?? "—"}
                </span>
              </div>
              {p.observations.length > 0 && (
                <ul className="mt-1 list-disc pl-5 text-sm text-muted-foreground">
                  {p.observations.map((o, i) => (
                    <li key={i}>{o}</li>
                  ))}
                </ul>
              )}
              {p.detected_issues.map((issue, i) => (
                <div key={i} className="mt-1 text-sm">
                  <Badge variant="moderate" className="mr-2">
                    {issue.severity}
                  </Badge>
                  {issue.location}: {issue.explanation}
                </div>
              ))}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* 7 + 8 + 9 */}
      <Section title={`7. ${t("rep.sellerQuestions")}`} items={report.questions_to_ask_seller} />
      <Section title={`8. ${t("rep.negotiation")}`} items={report.negotiation_arguments} empty="—" />
      <Section title={t("rep.s.nextSteps")} items={report.recommended_next_steps} />

      {/* 10. Engine start audio (optional module) */}
      <EngineAudioReportSection section={report.engine_audio} />

      {/* 11. Engine & mechanical check (optional module) */}
      <MechanicalReportSection section={report.mechanical} />

      {/* 12. Vehicle history (free NHTSA recalls + complaints) */}
      {report.vehicle_history && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t("rep.s.history")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <p className="text-xs text-muted-foreground">
              Source: {report.vehicle_history.source} · {report.vehicle_history.vehicle}
            </p>
            <p>{report.vehicle_history.note}</p>

            {report.vehicle_history.recalls.length > 0 && (
              <div className="space-y-2">
                <p className="font-medium">Recalls ({report.vehicle_history.recall_count})</p>
                {report.vehicle_history.recalls.map((r, i) => (
                  <div key={i} className="rounded-md border p-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-medium">{r.component}</span>
                      <Badge variant="moderate">{r.campaign}</Badge>
                    </div>
                    <p className="mt-1 text-muted-foreground">{r.summary}</p>
                    {r.remedy && <p className="mt-1 text-xs">Remedy: {r.remedy}</p>}
                  </div>
                ))}
              </div>
            )}

            {report.vehicle_history.complaints_count > 0 && (
              <p>
                <span className="font-medium">
                  {report.vehicle_history.complaints_count} consumer complaint(s).
                </span>{" "}
                Most reported: {report.vehicle_history.top_complaint_components.join(", ") || "—"}.
              </p>
            )}

            <p className="text-xs text-muted-foreground">{report.vehicle_history.disclaimer}</p>
          </CardContent>
        </Card>
      )}

      {/* Disclaimer */}
      <div className="rounded-lg border bg-muted/40 p-4 text-sm text-muted-foreground">
        <strong className="text-foreground">{t("rep.disclaimer")} </strong>
        {report.disclaimer}
      </div>
    </div>
  );
}

function Item({ label, value }: { label: string; value: unknown }) {
  return (
    <div>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="font-medium">{value ? String(value) : "—"}</dd>
    </div>
  );
}

function Section({
  title,
  items,
  empty = "Nothing to show.",
}: {
  title: string;
  items: string[];
  empty?: string;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground">{empty}</p>
        ) : (
          <ul className="list-disc space-y-1 pl-5 text-sm">
            {items.map((it, i) => (
              <li key={i}>{it}</li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
