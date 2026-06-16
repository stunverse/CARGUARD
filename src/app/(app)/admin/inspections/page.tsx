import { createClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { RiskLevelBadge, RecommendationBadge } from "@/components/risk-indicators";
import { formatDate } from "@/lib/utils";
import { getServerLocale } from "@/lib/i18n-server";
import { t } from "@/lib/i18n";
import type { InspectionSession } from "@/types";

export const metadata = { title: "Admin · Inspections — CarGuard AI" };

export default async function AdminInspectionsPage() {
  const locale = await getServerLocale();
  const supabase = await createClient();
  const { data: sessions } = await supabase
    .from("inspection_sessions")
    .select("*, vehicles(make, model, year)")
    .order("created_at", { ascending: false })
    .limit(200);

  return (
    <Card>
      <CardContent className="p-0">
        <table className="w-full text-sm">
          <thead className="border-b text-left text-muted-foreground">
            <tr>
              <th className="p-3">{t(locale, "adm.vehicle")}</th>
              <th className="p-3">{t(locale, "adm.status")}</th>
              <th className="p-3">{t(locale, "adm.score")}</th>
              <th className="p-3">{t(locale, "adm.risk")}</th>
              <th className="p-3">{t(locale, "adm.recommendation")}</th>
              <th className="p-3">{t(locale, "adm.created")}</th>
            </tr>
          </thead>
          <tbody>
            {((sessions ?? []) as (InspectionSession & { vehicles: { make: string; model: string; year: number } | null })[]).map((s) => (
              <tr key={s.id} className="border-b last:border-0">
                <td className="p-3">
                  {s.vehicles
                    ? `${s.vehicles.year ?? ""} ${s.vehicles.make} ${s.vehicles.model}`.trim()
                    : "—"}
                </td>
                <td className="p-3">{s.status.replaceAll("_", " ")}</td>
                <td className="p-3">{s.global_score ?? "—"}</td>
                <td className="p-3"><RiskLevelBadge level={s.risk_level} /></td>
                <td className="p-3"><RecommendationBadge recommendation={s.recommendation} /></td>
                <td className="p-3">{formatDate(s.created_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}
