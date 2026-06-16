"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useI18n } from "@/components/i18n-provider";
import type { Plan } from "@/lib/billing";
import type { PlanName } from "@/types";

export function BillingPlanCard({
  plan,
  current,
}: {
  plan: Plan;
  current: PlanName;
}) {
  const { t } = useI18n();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isCurrent = plan.name === current;

  async function choose() {
    if (plan.name === "free") return;
    setLoading(true);
    setError(null);
    const res = await fetch("/api/billing/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan: plan.name }),
    });
    const data = await res.json();
    setLoading(false);
    if (res.ok && data.url) {
      window.location.href = data.url;
    } else {
      setError(data.error ?? t("bpc.checkoutUnavailable"));
    }
  }

  return (
    <Card className={cn(isCurrent && "border-primary shadow-md")}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          {plan.label}
          {isCurrent && (
            <span className="rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">
              {t("bpc.current")}
            </span>
          )}
        </CardTitle>
        <div className="text-2xl font-bold">
          ${plan.priceMonthly}
          <span className="text-sm font-normal text-muted-foreground">{t("bpc.perMo")}</span>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <ul className="space-y-1.5 text-sm">
          {plan.features.map((f) => (
            <li key={f} className="flex items-start gap-2">
              <Check className="mt-0.5 size-4 shrink-0 text-accent" />
              {f}
            </li>
          ))}
        </ul>
        {!isCurrent && plan.name !== "free" && (
          <Button className="w-full" onClick={choose} disabled={loading}>
            {loading ? "…" : t("bpc.choosePlan")}
          </Button>
        )}
        {error && <p className="text-xs text-destructive">{error}</p>}
      </CardContent>
    </Card>
  );
}

export function ManageBillingButton() {
  const { t } = useI18n();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function openPortal() {
    setLoading(true);
    setError(null);
    const res = await fetch("/api/billing/portal", { method: "POST" });
    const data = await res.json();
    setLoading(false);
    if (res.ok && data.url) {
      window.location.href = data.url;
    } else {
      setError(data.error ?? t("bpc.unablePortal"));
    }
  }

  return (
    <div className="flex flex-col items-start gap-1">
      <Button variant="outline" onClick={openPortal} disabled={loading}>
        {loading ? t("bpc.opening") : t("bpc.manageSub")}
      </Button>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

export function UsageLimitBanner({
  used,
  limit,
  label,
}: {
  used: number;
  limit: number | null;
  label: string;
}) {
  if (limit == null) return null;
  const pct = Math.min(100, Math.round((used / limit) * 100));
  const over = used >= limit;
  return (
    <div className="rounded-lg border p-4">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium">{label}</span>
        <span className={cn("text-muted-foreground", over && "text-destructive")}>
          {used}/{limit}
        </span>
      </div>
      <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-muted">
        <div
          className={cn("h-full rounded-full", over ? "bg-destructive" : "bg-accent")}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
