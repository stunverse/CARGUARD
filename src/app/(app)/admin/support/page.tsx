import { createClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/empty-state";
import { LifeBuoy } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { getServerLocale } from "@/lib/i18n-server";
import { t } from "@/lib/i18n";

export const metadata = { title: "Admin · Support — CarGuard AI" };

export default async function AdminSupportPage() {
  const locale = await getServerLocale();
  const supabase = await createClient();
  const { data: tickets } = await supabase
    .from("support_tickets")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200);

  if (!tickets || tickets.length === 0) {
    return <EmptyState icon={LifeBuoy} title={t(locale, "adm.noTickets")} />;
  }

  return (
    <Card>
      <CardContent className="p-0">
        <table className="w-full text-sm">
          <thead className="border-b text-left text-muted-foreground">
            <tr>
              <th className="p-3">{t(locale, "adm.subject")}</th>
              <th className="p-3">{t(locale, "adm.priority")}</th>
              <th className="p-3">{t(locale, "adm.status")}</th>
              <th className="p-3">{t(locale, "adm.created")}</th>
            </tr>
          </thead>
          <tbody>
            {tickets.map((ticket) => (
              <tr key={ticket.id} className="border-b last:border-0">
                <td className="p-3">{ticket.subject}</td>
                <td className="p-3">{ticket.priority}</td>
                <td className="p-3"><Badge variant="outline">{ticket.status.replaceAll("_", " ")}</Badge></td>
                <td className="p-3">{formatDate(ticket.created_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}
