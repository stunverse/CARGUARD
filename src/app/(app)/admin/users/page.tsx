import { createClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { getServerLocale } from "@/lib/i18n-server";
import { t } from "@/lib/i18n";

export const metadata = { title: "Admin · Users — CarGuard AI" };

export default async function AdminUsersPage() {
  const locale = await getServerLocale();
  const supabase = await createClient();
  const { data: users } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <Card>
      <CardContent className="p-0">
        <table className="w-full text-sm">
          <thead className="border-b text-left text-muted-foreground">
            <tr>
              <th className="p-3">{t(locale, "adm.email")}</th>
              <th className="p-3">{t(locale, "adm.name")}</th>
              <th className="p-3">{t(locale, "adm.country")}</th>
              <th className="p-3">{t(locale, "adm.joined")}</th>
              <th className="p-3">{t(locale, "adm.role")}</th>
            </tr>
          </thead>
          <tbody>
            {(users ?? []).map((u) => (
              <tr key={u.id} className="border-b last:border-0">
                <td className="p-3">{u.email}</td>
                <td className="p-3">{[u.first_name, u.last_name].filter(Boolean).join(" ") || "—"}</td>
                <td className="p-3">{u.country ?? "—"}</td>
                <td className="p-3">{formatDate(u.created_at)}</td>
                <td className="p-3">
                  {u.is_admin ? <Badge>{t(locale, "adm.admin")}</Badge> : <Badge variant="secondary">{t(locale, "adm.user")}</Badge>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}
