import Link from "next/link";
import { Check } from "lucide-react";
import { MobileShell } from "@/components/mobile/mobile-shell";
import { PLANS, REPORT_PACKS } from "@/lib/billing";
import { cn } from "@/lib/utils";

export const metadata = { title: "Pricing — CarGuard AI" };

export default function PricingPage() {
  return (
    <MobileShell>
      <div className="text-center">
        <h1 className="text-2xl font-extrabold text-[#111827]">Simple pricing</h1>
        <p className="mt-2 text-sm text-[#6B7280]">
          Start free. Upgrade when you need more inspections and reports.
        </p>
      </div>

      <div className="mt-6 space-y-4">
        {PLANS.map((plan) => {
          const popular = plan.name === "plus";
          return (
            <div
              key={plan.name}
              className={cn(
                "rounded-2xl border bg-white p-4 shadow-sm",
                popular ? "border-[#E50914]" : "border-[#E5E7EB]",
              )}
            >
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-[#111827]">{plan.label}</h2>
                {popular && (
                  <span className="rounded-full bg-[#E50914] px-2 py-0.5 text-xs font-semibold text-white">
                    Popular
                  </span>
                )}
              </div>
              <div className="mt-1 text-2xl font-extrabold text-[#111827]">
                ${plan.priceMonthly}
                <span className="text-sm font-normal text-[#6B7280]">/mo</span>
              </div>
              <p className="text-sm text-[#6B7280]">{plan.description}</p>
              <ul className="mt-3 space-y-2">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-[#374151]">
                    <Check className="mt-0.5 size-4 shrink-0 text-[#1FAEB3]" aria-hidden />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/signup"
                className={cn(
                  "mt-4 flex h-12 w-full items-center justify-center rounded-xl text-sm font-semibold transition-transform active:scale-[0.98]",
                  popular
                    ? "text-white"
                    : "border border-[#E5E7EB] bg-white text-[#111827]",
                )}
                style={
                  popular
                    ? { backgroundImage: "linear-gradient(135deg,#FF2A2A 0%,#E50914 45%,#B00008 100%)" }
                    : undefined
                }
              >
                {plan.name === "free" ? "Get started" : "Choose plan"}
              </Link>
            </div>
          );
        })}
      </div>

      <div className="mt-10">
        <h2 className="text-center text-lg font-bold text-[#111827]">Prefer pay-per-report?</h2>
        <div className="mt-4 grid grid-cols-3 gap-3">
          {REPORT_PACKS.map((pack) => (
            <div key={pack.id} className="rounded-2xl border border-[#E5E7EB] bg-white p-3 text-center">
              <div className="text-sm font-semibold text-[#111827]">{pack.label}</div>
              <div className="mt-1 text-lg font-extrabold text-[#111827]">${pack.price}</div>
            </div>
          ))}
        </div>
      </div>
    </MobileShell>
  );
}
