import Link from "next/link";
import { Check } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PLANS, REPORT_PACKS } from "@/lib/billing";
import { cn } from "@/lib/utils";

export const metadata = { title: "Pricing — CarGuard AI" };

export default function PricingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="container py-16">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="text-4xl font-bold">Simple, transparent pricing</h1>
          <p className="mt-3 text-muted-foreground">
            Start free. Upgrade when you need more inspections and reports.
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-4">
          {PLANS.map((plan) => (
            <Card
              key={plan.name}
              className={cn(plan.name === "plus" && "border-primary shadow-md")}
            >
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  {plan.label}
                  {plan.name === "plus" && (
                    <span className="rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">
                      Popular
                    </span>
                  )}
                </CardTitle>
                <div className="text-3xl font-bold">
                  ${plan.priceMonthly}
                  <span className="text-sm font-normal text-muted-foreground">
                    /mo
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">{plan.description}</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2 text-sm">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2">
                      <Check className="mt-0.5 size-4 shrink-0 text-accent" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Button asChild className="w-full" variant={plan.name === "plus" ? "default" : "outline"}>
                  <Link href="/signup">
                    {plan.name === "free" ? "Get started" : "Choose plan"}
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mx-auto mt-16 max-w-2xl text-center">
          <h2 className="text-2xl font-bold">Prefer pay-per-report?</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            {REPORT_PACKS.map((pack) => (
              <Card key={pack.id}>
                <CardContent className="pt-6 text-center">
                  <div className="text-lg font-semibold">{pack.label}</div>
                  <div className="mt-1 text-2xl font-bold">${pack.price}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
