import { createClient } from "@/lib/supabase/server";
import {
  BillingPlanCard,
  ManageBillingButton,
  UsageLimitBanner,
} from "@/components/billing-plan-card";
import { PLANS, isStripeConfigured } from "@/lib/billing";
import { DisclaimerBanner } from "@/components/disclaimer-banner";
import { Badge } from "@/components/ui/badge";
import { getPlanLimits } from "@/lib/quota";
import type { PlanName } from "@/types";

export const metadata = { title: "Billing — CarGuard AI" };

export default async function BillingPage({
  searchParams,
}: {
  searchParams: Promise<{ checkout?: string }>;
}) {
  const { checkout } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", user!.id)
    .maybeSingle();

  const limits = await getPlanLimits(supabase, user!.id);
  const current: PlanName = limits.plan;

  // Monthly usage.
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const [{ count: inspectionsThisMonth }, { count: reportsThisMonth }] =
    await Promise.all([
      supabase
        .from("inspection_sessions")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user!.id)
        .gte("created_at", startOfMonth.toISOString()),
      supabase
        .from("inspection_reports")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user!.id)
        .gte("created_at", startOfMonth.toISOString()),
    ]);

  const hasCustomer = Boolean(subscription?.stripe_customer_id);

  return (
    <div className="container max-w-4xl py-8">
      <h1 className="mb-2 text-2xl font-bold">Billing &amp; plan</h1>
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <p className="text-muted-foreground">
          You are on the <strong className="capitalize">{current}</strong> plan.
        </p>
        {subscription?.status && current !== "free" && (
          <Badge variant={subscription.status === "active" ? "low" : "moderate"}>
            {subscription.status}
          </Badge>
        )}
        {isStripeConfigured() && hasCustomer && <ManageBillingButton />}
      </div>

      {checkout === "success" && (
        <div className="mb-6 rounded-lg border border-risk-low/40 bg-risk-low/10 p-4 text-sm">
          Payment received. Your plan will update within a few seconds.
        </div>
      )}
      {checkout === "cancelled" && (
        <div className="mb-6 rounded-lg border p-4 text-sm text-muted-foreground">
          Checkout cancelled — no changes were made.
        </div>
      )}

      {!isStripeConfigured() && (
        <DisclaimerBanner
          className="mb-6"
          text="Online checkout is not enabled in this environment yet. Plans are shown for preview; add Stripe keys to enable upgrades."
        />
      )}

      <div className="mb-8 grid gap-3 sm:grid-cols-2">
        <UsageLimitBanner
          label="Inspections this month"
          used={inspectionsThisMonth ?? 0}
          limit={limits.inspections_per_month}
        />
        <UsageLimitBanner
          label="Reports this month"
          used={reportsThisMonth ?? 0}
          limit={limits.reports_per_month}
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
