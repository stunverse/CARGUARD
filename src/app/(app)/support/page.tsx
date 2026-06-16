import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SupportForm } from "@/components/support-form";
import { formatDate } from "@/lib/utils";
import { getServerLocale } from "@/lib/i18n-server";
import { t } from "@/lib/i18n";

export const metadata = { title: "Support — CarGuard AI" };

export default async function SupportPage() {
  const locale = await getServerLocale();
  const FAQ = [
    { q: t(locale, "sup.q1"), a: t(locale, "sup.a1") },
    { q: t(locale, "sup.q2"), a: t(locale, "sup.a2") },
    { q: t(locale, "sup.q3"), a: t(locale, "sup.a3") },
  ];
  const supabase = await createClient();
  const { data: tickets } = await supabase
    .from("support_tickets")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="px-5 py-6">
      <h1 className="mb-6 text-2xl font-bold">{t(locale, "page.support")}</h1>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-base">{t(locale, "sup.faq")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {FAQ.map((f) => (
            <div key={f.q}>
              <p className="font-medium">{f.q}</p>
              <p className="text-sm text-muted-foreground">{f.a}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-base">{t(locale, "sup.contact")}</CardTitle>
        </CardHeader>
        <CardContent>
          <SupportForm />
        </CardContent>
      </Card>

      {tickets && tickets.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t(locale, "sup.yourTickets")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {tickets.map((ticket) => (
              <div key={ticket.id} className="flex items-center justify-between border-b pb-2 last:border-0">
                <div>
                  <p className="text-sm font-medium">{ticket.subject}</p>
                  <p className="text-xs text-muted-foreground">{formatDate(ticket.created_at)}</p>
                </div>
                <Badge variant="outline">{ticket.status.replaceAll("_", " ")}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
