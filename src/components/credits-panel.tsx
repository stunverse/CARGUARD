"use client";

import { useEffect, useState } from "react";
import { Car, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { toast } from "@/lib/toast";
import { useI18n } from "@/components/i18n-provider";
import { INSPECTION_PACKS } from "@/lib/billing";

// Credit balance + buy-more packs (pay-per-inspection model).
export function CreditsPanel() {
  const { t, formatMoney, currency } = useI18n();
  const [credits, setCredits] = useState<number | null>(null);
  const [loading, setLoading] = useState<string | null>(null);

  function refresh() {
    fetch("/api/billing/credits")
      .then((r) => r.json())
      .then((d) => setCredits(typeof d.credits === "number" ? d.credits : 0))
      .catch(() => setCredits(0));
  }

  useEffect(() => {
    refresh();
    const params = new URLSearchParams(window.location.search);
    if (params.get("credits") === "success") toast.success(t("bill.credits.added"));
    if (params.get("credits") === "cancelled") toast.error(t("wiz.pay.cancelled"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function buy(pack: string) {
    setLoading(pack);
    try {
      const res = await fetch("/api/billing/credits/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pack }),
      });
      const d = await res.json();
      if (d.url) {
        window.location.href = d.url;
        return;
      }
      // Demo mode: credits granted immediately.
      toast.success(t("bill.credits.added"));
      refresh();
    } catch {
      toast.error(t("bpc.checkoutUnavailable"));
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="flex items-center gap-4 p-6">
          <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-[rgba(229,9,20,0.10)] text-[#E50914]">
            <Car className="size-7" aria-hidden />
          </span>
          <div>
            <div className="text-3xl font-extrabold text-[#111827]">{credits ?? "—"}</div>
            <p className="text-sm text-muted-foreground">{t("bill.credits.balance")}</p>
          </div>
        </CardContent>
      </Card>

      <div>
        <h2 className="mb-3 text-base font-semibold">{t("bill.credits.buyMore")}</h2>
        <div className="grid gap-3 sm:grid-cols-3">
          {INSPECTION_PACKS.map((p, i) => {
            const best = i === INSPECTION_PACKS.length - 1;
            return (
              <Card key={p.id} className={cn(best && "border-[#E50914]")}>
                <CardContent className="p-4 text-center">
                  <div className="text-sm font-semibold text-[#111827]">
                    {p.credits} {p.credits > 1 ? t("wiz.pay.inspections") : t("wiz.pay.inspection")}
                  </div>
                  <div className="mt-1 text-2xl font-extrabold text-[#111827]">
                    {formatMoney(p.price, currency)}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {formatMoney(p.price / p.credits, currency)} {t("wiz.pay.perInspection")}
                  </div>
                  <Button className="mt-3 w-full" onClick={() => buy(p.id)} disabled={loading !== null}>
                    <Plus className="size-4" /> {loading === p.id ? "…" : t("bill.credits.buy")}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
