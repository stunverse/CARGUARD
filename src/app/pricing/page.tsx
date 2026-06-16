import Link from "next/link";
import { Check } from "lucide-react";
import { MobileShell } from "@/components/mobile/mobile-shell";
import { INSPECTION_PACKS } from "@/lib/billing";
import { getServerLocale } from "@/lib/i18n-server";
import { t, formatMoney, localeCurrency } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export const metadata = { title: "Pricing — CarGuard AI" };

export default async function PricingPage() {
  const locale = await getServerLocale();
  const currency = localeCurrency(locale);
  const features = [t(locale, "wiz.pay.f1"), t(locale, "wiz.pay.f2"), t(locale, "wiz.pay.f3"), t(locale, "wiz.pay.f4")];

  return (
    <MobileShell>
      <div className="text-center">
        <h1 className="text-2xl font-extrabold text-[#111827]">{t(locale, "price.title")}</h1>
        <p className="mt-2 text-sm text-[#6B7280]">{t(locale, "price.subtitle")}</p>
      </div>

      <div className="mt-6 space-y-4 md:grid md:grid-cols-3 md:gap-4 md:space-y-0">
        {INSPECTION_PACKS.map((p, i) => {
          const best = i === INSPECTION_PACKS.length - 1;
          const per = p.price / p.credits;
          return (
            <div
              key={p.id}
              className={cn(
                "rounded-2xl border bg-white p-5 shadow-sm",
                best ? "border-[#E50914]" : "border-[#E5E7EB]",
              )}
            >
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-[#111827]">
                  {p.credits} {p.credits > 1 ? t(locale, "wiz.pay.inspections") : t(locale, "wiz.pay.inspection")}
                </h2>
                {best && (
                  <span className="rounded-full bg-[#E50914] px-2 py-0.5 text-xs font-semibold text-white">
                    {t(locale, "wiz.pay.bestValue")}
                  </span>
                )}
              </div>
              <div className="mt-1 text-3xl font-extrabold text-[#111827]">{formatMoney(p.price, currency)}</div>
              <div className="text-xs text-[#6B7280]">
                {formatMoney(per, currency)} {t(locale, "wiz.pay.perInspection")}
              </div>
              <ul className="mt-4 space-y-2">
                {features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-[#374151]">
                    <Check className="mt-0.5 size-4 shrink-0 text-[#1FAEB3]" aria-hidden />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/signup"
                className={cn(
                  "mt-5 flex h-12 w-full items-center justify-center rounded-xl text-sm font-semibold transition-transform active:scale-[0.98]",
                  best ? "text-white" : "border border-[#E5E7EB] bg-white text-[#111827]",
                )}
                style={best ? { backgroundImage: "linear-gradient(135deg,#FF2A2A 0%,#E50914 45%,#B00008 100%)" } : undefined}
              >
                {t(locale, "price.cta")}
              </Link>
            </div>
          );
        })}
      </div>

      <p className="mt-6 text-center text-xs text-[#6B7280]">{t(locale, "wiz.pay.packHelper")}</p>
    </MobileShell>
  );
}
