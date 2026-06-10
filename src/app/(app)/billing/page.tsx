import { createClient } from "@/lib/supabase/server";
import { BillingPlanCard, UsageLimitBanner } from "@/components/billing-plan-card";
import { PLANS, isStripeConfigured } from "@/lib/billing";
import { DisclaimerBanner } from "@/components/disclaimer-banner";
import type { PlanName } from "@/types";

export const metadata = { title: "Billing — CarGuard AI" };

export default async function BillingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", user!.id)
    .maybeSingle();

  const current: PlanName = (subscription?.plan_name as PlanName) ?? "free";

  const { data: limits } = await supabase
    .from("usage_limits")
    .select("*")
    .eq("plan_name", current)
    .maybeSingle();

  // Count this month's usage.
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const { count: inspectionsThisMonth } = await supabase
    .from("inspection_sessions")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user!.id)
    .gte("created_at", startOfMonth.toISOString());

  return (
    <div className="container max-w-4xl py-8">
      <h1 className="mb-2 text-2xl font-bold">Billing &amp; plan</h1>
      <p className="mb-6 text-muted-foreground">
        You are on the <strong className="capitalize">{current}</strong> plan.
      </p>

      {!isStripeConfigured() && (
        <DisclaimerBanner
          className="mb-6"
          text="Online checkout is not enabled in this environment yet. Plans are shown for preview; add Stripe keys to enable upgrades."
        />
      )}

      <div className="mb-8 space-y-3">
        <UsageLimitBanner
          label="Inspections this month"
          used={inspectionsThisMonth ?? 0}
          limit={limits?.inspections_per_month ?? null}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {PLANS.map((plan) => (
          <BillingPlanCard key={plan.name} plan={plan} current={current} />
        ))}
      </div>
    </div>
  );
}
