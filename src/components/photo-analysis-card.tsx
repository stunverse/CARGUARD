"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PHOTO_POINTS } from "@/lib/constants";
import { useI18n } from "@/components/i18n-provider";
import type { InspectionPhoto } from "@/types";

const severityVariant = {
  low: "moderate",
  moderate: "moderate",
  high: "high",
  critical: "critical",
} as const;

export function PhotoAnalysisCard({ photo }: { photo: InspectionPhoto }) {
  const { t } = useI18n();
  const point = PHOTO_POINTS.find((p) => p.code === photo.photo_point_code);
  const a = photo.ai_analysis;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-base">
          <span>{point?.title ?? photo.photo_point_code}</span>
          <span className="flex items-center gap-2 text-xs font-normal text-muted-foreground">
            {photo.ai_quality_check?.quality_score != null && (
              <span>{t("pac.quality")} {photo.ai_quality_check.quality_score}</span>
            )}
            {a?.risk_score != null && <span>{t("pac.risk")} {a.risk_score}/100</span>}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {photo.image_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={photo.image_url}
            alt={point?.title ?? ""}
            className="aspect-video w-full rounded-md object-cover"
          />
        )}
        {a?.summary && <p className="text-sm">{a.summary}</p>}

        {a?.suspicious_observations && a.suspicious_observations.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-risk-moderate">{t("pac.suspiciousObs")}</p>
            <ul className="mt-1 space-y-1 text-sm">
              {a.suspicious_observations.map((o, i) => (
                <li key={i}>• {o}</li>
              ))}
            </ul>
          </div>
        )}

        {a?.detected_issues && a.detected_issues.length > 0 && (
          <div className="space-y-2">
            {a.detected_issues.map((issue, i) => (
              <div key={i} className="rounded-md border p-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{issue.issue_type.replaceAll("_", " ")}</span>
                  <Badge variant={severityVariant[issue.severity]}>
                    {issue.severity} · {issue.confidence}%
                  </Badge>
                </div>
                <p className="mt-1 text-muted-foreground">{issue.explanation}</p>
              </div>
            ))}
          </div>
        )}

        {(!a?.detected_issues || a.detected_issues.length === 0) && (
          <p className="text-sm text-risk-low">{t("pac.noIssue")}</p>
        )}
      </CardContent>
    </Card>
  );
}
