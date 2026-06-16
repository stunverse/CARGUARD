"use client";

import Link from "next/link";
import { Car, ChevronRight, Volume2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RiskLevelBadge, RecommendationBadge } from "@/components/risk-indicators";
import { useI18n } from "@/components/i18n-provider";
import { formatDate, vehicleLabel } from "@/lib/utils";
import type { EngineAudioCheck, InspectionSession, Vehicle } from "@/types";

function engineAudioLabel(check: EngineAudioCheck | null | undefined): {
  label: string;
  variant: "secondary" | "moderate" | "low" | "critical";
} | null {
  if (!check) return null;
  if (check.analysis_status === "completed") {
    const risk = ["high", "very_high"].includes(check.risk_level ?? "");
    return risk
      ? { label: "Audio: risk", variant: "critical" }
      : { label: "Audio: OK", variant: "low" };
  }
  return { label: "Audio: pending", variant: "moderate" };
}

export function InspectionCard({
  session,
  vehicle,
  engineAudio,
}: {
  session: InspectionSession;
  vehicle: Vehicle | null;
  engineAudio?: EngineAudioCheck | null;
}) {
  const { t } = useI18n();
  const complete = session.status === "report_generated";
  const href = complete
    ? `/inspections/${session.id}`
    : `/inspections/${session.id}/continue`;
  const audio = engineAudioLabel(engineAudio);

  return (
    <Link href={href}>
      <Card className="transition-shadow hover:shadow-md">
        <CardContent className="flex items-center gap-4 p-4">
          <div className="flex size-14 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
            <Car className="size-7" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate font-semibold">{vehicleLabel(vehicle ?? {})}</div>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              {complete ? (
                <>
                  <RiskLevelBadge level={session.risk_level} />
                  <RecommendationBadge recommendation={session.recommendation} />
                  {audio && (
                    <Badge variant={audio.variant as never} className="gap-1">
                      <Volume2 className="size-3" /> {audio.label}
                    </Badge>
                  )}
                </>
              ) : (
                <Badge variant="moderate">{t("list.inProgress")}</Badge>
              )}
            </div>
            <div className="mt-1 text-xs text-muted-foreground">
              {formatDate(session.created_at)}
            </div>
          </div>
          {complete && session.global_score != null ? (
            <div className="text-right">
              <div className="text-2xl font-bold">{session.global_score}</div>
              <div className="text-xs text-muted-foreground">/ 100</div>
            </div>
          ) : (
            <ChevronRight className="size-5 text-muted-foreground" aria-hidden />
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
