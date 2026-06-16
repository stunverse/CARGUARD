import { createClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { AdminMetricCard } from "@/components/admin-metric-card";
import { CreditCard } from "lucide-react";
import { PLANS } from "@/lib/billing";
import { getServerLocale } from "@/lib/i18n-server";
import { t } from "@/lib/i18n";

export const metadata = { title: "Admin · Billing — CarGuard AI" };

export default async function AdminBillingPage() {
  const locale = await getServerLocale();
  const supabase = await createClient();
  const { data: subs } = await supabase.from("subscriptions").select("plan_name, status");

  const byPlan = new Map<string, number>();
  for (const s of subs ?? []) {
    byPlan.set(s.plan_name, (byPlan.get(s.plan_name) ?? 0) + 1);
  }
  const active = (subs ?? []).filter((s) => s.status === "active").length;
  const mrr = PLANS.reduce(
    (sum, p) => sum + (byPlan.get(p.name) ?? 0) * p.priceMonthly,
    0,
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
        <AdminMetricCard label={t(locale, "adm.activeSubs")} value={active} icon={CreditCard} />
        <AdminMetricCard label={t(locale, "adm.estMrr")} value={`$${mrr.toFixed(2)}`} icon={CreditCard} />
      </div>
      <Card>
        <CardContent className="p-4 text-sm text-muted-foreground">
          {/* TODO: surface real MRR via Stripe once billing is wired. */}
          {t(locale, "adm.subsByPlan")}{" "}
          {PLANS.map((p) => `${p.label}: ${byPlan.get(p.name) ?? 0}`).join(" · ")}
        </CardContent>
      </Card>
    </div>
  );
}
