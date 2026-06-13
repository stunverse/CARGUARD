import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MECHANICAL_RECOMMENDATION_COPY, MECHANICAL_RISK_COPY } from "@/lib/mechanical";
import type { MechanicalReportSection as Section, Severity } from "@/types";

const sevBadge: Record<Severity, "low" | "moderate" | "high" | "critical" | "secondary"> = {
  none: "low",
  low: "low",
  moderate: "moderate",
  high: "high",
  critical: "critical",
};

export function MechanicalReportSection({ section }: { section: Section | null | undefined }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">11. Engine &amp; Mechanical Check</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        {!section ? (
          <p className="text-muted-foreground">
            No engine &amp; mechanical check was performed for this inspection.
          </p>
        ) : (
          <>
            <div className="flex flex-wrap items-center gap-2">
              <Badge
                variant={["high", "very_high"].includes(section.risk_level) ? "critical" : "low"}
              >
                {MECHANICAL_RISK_COPY[section.risk_level]}
              </Badge>
              <span className="text-muted-foreground">
                Mechanical score: <strong>{section.mechanical_score}/100</strong>
              </span>
            </div>
            <p>{section.summary}</p>

            <div className="space-y-1">
              {section.items.map((it) => (
                <div key={it.point_code} className="flex items-start justify-between gap-2 border-b py-1 last:border-0">
                  <div>
                    <span className="font-medium">{it.title}</span>
                    {it.suspicious_observations.length > 0 && (
                      <p className="text-xs text-muted-foreground">
                        {it.suspicious_observations.join(" · ")}
                      </p>
                    )}
                  </div>
                  {it.severity && it.score != null && (
                    <Badge variant={sevBadge[it.severity]}>{it.score}</Badge>
                  )}
                </div>
              ))}
            </div>

            <p className="rounded-md bg-muted/50 p-2">
              {MECHANICAL_RECOMMENDATION_COPY[section.recommendation]}
            </p>

            {section.seller_questions.length > 0 && (
              <div>
                <p className="font-medium">Questions for the seller</p>
                <ul className="list-disc pl-5 text-muted-foreground">
                  {section.seller_questions.map((q, i) => (
                    <li key={i}>{q}</li>
                  ))}
                </ul>
              </div>
            )}
            {section.mechanic_questions.length > 0 && (
              <div>
                <p className="font-medium">Questions for the mechanic</p>
                <ul className="list-disc pl-5 text-muted-foreground">
                  {section.mechanic_questions.map((q, i) => (
                    <li key={i}>{q}</li>
                  ))}
                </ul>
              </div>
            )}

            <p className="text-xs text-muted-foreground">{section.disclaimer}</p>
          </>
        )}
      </CardContent>
    </Card>
  );
}
