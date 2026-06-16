"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  RECOMMENDATION_COPY,
  RISK_LEVEL_COPY,
  scoreToRiskLevel,
} from "@/lib/constants";
import { useI18n } from "@/components/i18n-provider";
import { RECOMMENDATION_LABEL_FR, RISK_LEVEL_FR } from "@/lib/content-i18n";
import type { Recommendation, RiskLevel } from "@/types";

const riskVariant: Record<RiskLevel, "low" | "moderate" | "high" | "critical"> = {
  low: "low",
  moderate: "moderate",
  high: "high",
  very_high: "critical",
};

export function RiskLevelBadge({ level }: { level: RiskLevel | null | undefined }) {
  const { locale, t } = useI18n();
  if (!level) return <Badge variant="secondary">{t("badge.notAnalyzed")}</Badge>;
  const copy = locale === "fr" ? RISK_LEVEL_FR[level] : RISK_LEVEL_COPY[level];
  return <Badge variant={riskVariant[level]}>{copy}</Badge>;
}

export function RecommendationBadge({
  recommendation,
}: {
  recommendation: Recommendation | null | undefined;
}) {
  const { locale, t } = useI18n();
  if (!recommendation) return <Badge variant="secondary">{t("badge.pending")}</Badge>;
  const variant =
    recommendation === "buy"
      ? "low"
      : recommendation === "negotiate"
        ? "moderate"
        : recommendation === "professional_inspection"
          ? "high"
          : recommendation === "avoid"
            ? "critical"
            : "secondary";
  const label =
    locale === "fr" ? RECOMMENDATION_LABEL_FR[recommendation] : RECOMMENDATION_COPY[recommendation].label;
  return <Badge variant={variant as never}>{label}</Badge>;
}

// Circular score gauge (SVG, no deps). Higher score = safer (greener).
export function RiskScoreCircle({
  score,
  size = 120,
  label = "Risk score",
}: {
  score: number | null | undefined;
  size?: number;
  label?: string;
}) {
  const value = score ?? 0;
  const radius = (size - 12) / 2;
  const circ = 2 * Math.PI * radius;
  const offset = circ - (value / 100) * circ;
  const level = scoreToRiskLevel(value);
  const color = {
    low: "hsl(142 71% 45%)",
    moderate: "hsl(38 92% 50%)",
    high: "hsl(24 95% 53%)",
    very_high: "hsl(0 84% 45%)",
  }[level];

  return (
    <div className="inline-flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            strokeWidth={10}
            className="stroke-muted"
            fill="none"
          />
          {score != null && (
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              strokeWidth={10}
              stroke={color}
              strokeLinecap="round"
              fill="none"
              strokeDasharray={circ}
              strokeDashoffset={offset}
            />
          )}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold">{score ?? "—"}</span>
          <span className="text-xs text-muted-foreground">/ 100</span>
        </div>
      </div>
      <span className="text-sm text-muted-foreground">{label}</span>
    </div>
  );
}

export function ScoreBreakdown({
  scores,
}: {
  scores: {
    label: string;
    value: number | null;
    description?: string;
  }[];
}) {
  return (
    <div className="space-y-3">
      {scores.map((s) => {
        const v = s.value ?? 0;
        const level = scoreToRiskLevel(v);
        const barColor = {
          low: "bg-risk-low",
          moderate: "bg-risk-moderate",
          high: "bg-risk-high",
          very_high: "bg-risk-critical",
        }[level];
        return (
          <div key={s.label}>
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">{s.label}</span>
              <span className="text-muted-foreground">{s.value ?? "—"}/100</span>
            </div>
            <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-muted">
              <div
                className={cn("h-full rounded-full transition-all", barColor)}
                style={{ width: `${v}%` }}
              />
            </div>
            {s.description && (
              <p className="mt-1 text-xs text-muted-foreground">{s.description}</p>
            )}
          </div>
        );
      })}
    </div>
  );
}
