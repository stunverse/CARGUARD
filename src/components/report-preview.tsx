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

      {/* Specifications & equipment (US + EU) */}
      {report.specifications && report.specifications.groups.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t("rep.s.specs")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <p className="text-xs text-muted-foreground">
              {t("rep.source")}: {report.specifications.source}
            </p>
            {report.specifications.groups.map((g) => (
              <div key={g.group}>
                <p className="font-medium">{t(`spec.group.${g.group}`)}</p>
                <dl className="mt-1 grid grid-cols-2 gap-x-3 gap-y-1 sm:grid-cols-3">
                  {g.items.map((it) => (
                    <div key={it.key}>
                      <dt className="text-xs text-muted-foreground">{t(`spec.${it.key}`)}</dt>
                      <dd className="font-medium">{it.value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Mileage consistency / odometer-rollback (US + EU) */}
      {report.mileage_check && report.mileage_check.status !== "unknown" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t("rep.s.mileage")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex flex-wrap items-center gap-2">
              <Badge
                variant={
                  report.mileage_check.status === "ok"
                    ? "low"
                    : report.mileage_check.status === "attention"
                      ? "moderate"
                      : "critical"
                }
              >
                {t(`mileage.status.${report.mileage_check.status}`)}
              </Badge>
              {report.mileage_check.avg_per_year != null && (
                <span className="text-muted-foreground">
                  {report.mileage_check.avg_per_year.toLocaleString()} {report.mileage_check.unit}/{t("mileage.perYear")}
                </span>
              )}
            </div>
            {report.mileage_check.flags.length > 0 && (
              <ul className="list-disc pl-5 text-muted-foreground">
                {report.mileage_check.flags.map((f) => (
                  <li key={f}>{t(`mileage.flag.${f}`)}</li>
                ))}
              </ul>
            )}
            <p className="text-xs text-muted-foreground">{t("mileage.disclaimer")}</p>
          </CardContent>
        </Card>
      )}

      {/* Safety rating (NHTSA NCAP for US; EU provider later) */}
      {report.safety && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t("rep.s.safety")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <p className="text-xs text-muted-foreground">
              {t("rep.source")}: {report.safety.source} · {report.safety.vehicle}
            </p>
            <dl className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {([
                ["safety.overall", report.safety.overall],
                ["safety.frontal", report.safety.frontal],
                ["safety.side", report.safety.side],
                ["safety.rollover", report.safety.rollover],
              ] as const).map(([k, v]) =>
                v ? (
                  <div key={k}>
                    <dt className="text-xs text-muted-foreground">{t(k)}</dt>
                    <dd className="font-semibold">{v}★</dd>
                  </div>
                ) : null,
              )}
            </dl>
            <p className="text-xs text-muted-foreground">{t("safety.disclaimer")}</p>
          </CardContent>
        </Card>
      )}

      {/* Adverse title flags (salvage / flood / theft…) — from a paid VIN report */}
      {report.title_flags && report.title_flags.checked && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t("rep.s.titleFlags")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p className="text-xs text-muted-foreground">
              {t("rep.source")}: {report.title_flags.source}
            </p>
            {report.title_flags.clean ? (
              <p className="text-risk-low">{t("flag.clean")}</p>
            ) : (
              <div className="space-y-2">
                {report.title_flags.flags.map((f, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <Badge variant="critical">{t(`flag.${f.category}`)}</Badge>
                    <span className="text-muted-foreground">{f.detail}</span>
                  </div>
                ))}
              </div>
            )}
            <p className="text-xs text-muted-foreground">{t("flag.disclaimer")}</p>
          </CardContent>
        </Card>
      )}

      {/* Market value — heuristic estimate vs asking price (worldwide) */}
      {report.market_value && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t("rep.s.marketValue")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="text-xs text-muted-foreground">{t("mv.asking")}</p>
                <p className="text-lg font-bold">
                  {formatMoney(report.market_value.asking_price, report.market_value.currency)}
                </p>
              </div>
              {report.market_value.estimated_low != null && report.market_value.estimated_high != null && (
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">{t("mv.estimatedRange")}</p>
                  <p className="text-lg font-bold">
                    {formatMoney(report.market_value.estimated_low, report.market_value.currency)} –{" "}
                    {formatMoney(report.market_value.estimated_high, report.market_value.currency)}
                  </p>
                </div>
              )}
            </div>
            {report.market_value.verdict !== "unknown" && (
              <Badge
                variant={
                  report.market_value.verdict === "underpriced"
                    ? "low"
                    : report.market_value.verdict === "fair"
                      ? "moderate"
                      : "high"
                }
              >
                {t(`mv.verdict.${report.market_value.verdict}`)}
              </Badge>
            )}
            {report.market_value.source && (
              <p className="text-xs text-muted-foreground">
                {t("rep.source")}: {report.market_value.source}
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              {report.market_value.source ? t("mv.providerDisclaimer") : t("mv.disclaimer")}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Supporting documents */}
      {report.documents && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t("rep.s.documents")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <p className="text-muted-foreground">
              {report.documents.provided_count}/{report.documents.relevant_count} {t("doc.provided")}
              {" · "}
              {report.documents.key_provided}/{report.documents.key_total} {t("doc.keyDocs")}
            </p>
            <ul className="grid gap-1.5 sm:grid-cols-2">
              {report.documents.items.map((d) => (
                <li key={d.doc_type} className="flex items-center gap-2">
                  {d.provided ? (
                    <ShieldCheck className="size-4 shrink-0 text-risk-low" aria-hidden />
                  ) : (
                    <span className="size-4 shrink-0 rounded-full border border-muted-foreground/40" aria-hidden />
                  )}
                  <span className={d.provided ? "" : "text-muted-foreground"}>
                    {t(`doc.${d.doc_type}.title`)}
                    {d.key && <span className="ml-1 text-[10px] font-semibold uppercase text-accent">{t("doc.key")}</span>}
                  </span>
                </li>
              ))}
            </ul>
            <p className="text-xs text-muted-foreground">{t("doc.disclaimer")}</p>
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
