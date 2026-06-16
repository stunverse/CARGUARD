import { createClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/empty-state";
import { Database } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { getServerLocale } from "@/lib/i18n-server";
import { t } from "@/lib/i18n";

export const metadata = { title: "Admin · Model knowledge — CarGuard AI" };

export default async function AdminVehicleKnowledgePage() {
  const locale = await getServerLocale();
  const supabase = await createClient();
  const { data: rows } = await supabase
    .from("vehicle_model_knowledge")
    .select("*")
    .order("make");

  if (!rows || rows.length === 0) {
    return (
      <EmptyState
        icon={Database}
        title={t(locale, "adm.noModelKnowledge")}
        description={t(locale, "adm.noModelKnowledgeDesc")}
      />
    );
  }

  return (
    <Card>
      <CardContent className="p-0">
        <table className="w-full text-sm">
          <thead className="border-b text-left text-muted-foreground">
            <tr>
              <th className="p-3">{t(locale, "adm.make")}</th>
              <th className="p-3">{t(locale, "adm.model")}</th>
              <th className="p-3">{t(locale, "adm.years")}</th>
              <th className="p-3">{t(locale, "adm.body")}</th>
              <th className="p-3">{t(locale, "adm.verified")}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-b last:border-0">
                <td className="p-3">{r.make}</td>
                <td className="p-3">{r.model}</td>
                <td className="p-3">
                  {r.year_start ?? "?"}–{r.year_end ?? "?"}
                </td>
                <td className="p-3">{r.body_type ?? "—"}</td>
                <td className="p-3">{formatDate(r.last_verified_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}
