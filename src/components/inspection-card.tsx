import Link from "next/link";
import { Car } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RiskLevelBadge, RecommendationBadge } from "@/components/risk-indicators";
import { formatDate, vehicleLabel } from "@/lib/utils";
import type { InspectionSession, Vehicle } from "@/types";

export function InspectionCard({
  session,
  vehicle,
}: {
  session: InspectionSession;
  vehicle: Vehicle | null;
}) {
  return (
    <Link href={`/inspections/${session.id}`}>
      <Card className="transition-shadow hover:shadow-md">
        <CardContent className="flex items-center gap-4 p-4">
          <div className="flex size-14 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
            <Car className="size-7" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate font-semibold">
              {vehicleLabel(vehicle ?? {})}
            </div>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <RiskLevelBadge level={session.risk_level} />
              <RecommendationBadge recommendation={session.recommendation} />
              <Badge variant="outline">{session.status.replaceAll("_", " ")}</Badge>
            </div>
            <div className="mt-1 text-xs text-muted-foreground">
              {formatDate(session.created_at)}
            </div>
          </div>
          {session.global_score != null && (
            <div className="text-right">
              <div className="text-2xl font-bold">{session.global_score}</div>
              <div className="text-xs text-muted-foreground">/ 100</div>
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
