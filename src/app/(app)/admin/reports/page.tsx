import { createClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { getServerLocale } from "@/lib/i18n-server";
import { t } from "@/lib/i18n";

export const metadata = { title: "Admin · Reports — CarGuard AI" };

export default async function AdminReportsPage() {
  const locale = await getServerLocale();
  const supabase = await createClient();
  const { data: reports } = await supabase
    .from("inspection_reports")
    .select("id, created_at, is_public")
    .order("created_at", { ascending: false })
    .limit(200);

  return (
    <Card>
      <CardContent className="p-0">
        <table className="w-full text-sm">
          <thead className="border-b text-left text-muted-foreground">
            <tr>
              <th className="p-3">{t(locale, "adm.reportId")}</th>
              <th className="p-3">{t(locale, "adm.shared")}</th>
              <th className="p-3">{t(locale, "adm.created")}</th>
            </tr>
          </thead>
          <tbody>
            {(reports ?? []).map((r) => (
              <tr key={r.id} className="border-b last:border-0">
                <td className="p-3 font-mono text-xs">{r.id}</td>
                <td className="p-3">
                  {r.is_public ? <Badge variant="accent">{t(locale, "adm.public")}</Badge> : <Badge variant="secondary">{t(locale, "adm.private")}</Badge>}
                </td>
                <td className="p-3">{formatDate(r.created_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}
