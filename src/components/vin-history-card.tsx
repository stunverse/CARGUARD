"use client";

import { useEffect, useState } from "react";
import { FileSearch, Lock, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { VinHistoryReport } from "@/types";

interface State {
  loading: boolean;
  owned: boolean;
  available: boolean;
  report: VinHistoryReport | null;
  priceCents?: number;
  currency?: string;
  error?: string | null;
}

export function VinHistoryCard({ sessionId, vin }: { sessionId: string; vin: string }) {
  const [s, setS] = useState<State>({ loading: true, owned: false, available: false, report: null });
  const [buying, setBuying] = useState(false);

  async function load() {
    const res = await fetch(`/api/vin-history?vin=${encodeURIComponent(vin)}`);
    const d = await res.json();
    setS({
      loading: false,
      owned: Boolean(d.owned),
      available: Boolean(d.available),
      report: d.report ?? null,
      priceCents: d.price_cents,
      currency: d.currency,
      error: d.error ?? null,
    });
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vin]);

  async function buy() {
    setBuying(true);
    const res = await fetch("/api/vin-history/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ vin, sessionId }),
    });
    const d = await res.json();
    if (d.url) {
      window.location.href = d.url;
      return;
    }
    if (d.alreadyOwned) {
      await load();
    }
    setBuying(false);
  }

  const price =
    s.priceCents != null
      ? new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: (s.currency ?? "usd").toUpperCase(),
        }).format(s.priceCents / 100)
      : "";

  if (s.loading) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <FileSearch className="size-5 text-[#E50914]" aria-hidden /> Full Vehicle History
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        {s.owned && s.report ? (
          <ReportView report={s.report} />
        ) : s.owned && !s.report ? (
          <p className="text-muted-foreground">
            {s.error ?? "Preparing your report… refresh in a moment."}
          </p>
        ) : !s.available ? (
          <p className="text-muted-foreground">
            Paid VIN history isn&apos;t enabled in this environment yet.
          </p>
        ) : (
          <>
            <p className="text-muted-foreground">
              Get the full US title &amp; salvage history for this VIN (NMVTIS):
              title brands, salvage / total-loss, odometer records and more.
            </p>
            <Button onClick={buy} disabled={buying} className="w-full">
              <Lock className="size-4" aria-hidden />
              {buying ? "Redirecting…" : `Unlock report — ${price}`}
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}

function ReportView({ report }: { report: VinHistoryReport }) {
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        {report.salvage_or_total_loss ? (
          <Badge variant="critical">
            <ShieldAlert className="mr-1 size-3" /> Salvage / total-loss record
          </Badge>
        ) : (
          <Badge variant="low">No salvage / total-loss record</Badge>
        )}
        <span className="text-xs text-muted-foreground">{report.title_count} title record(s)</span>
      </div>
      <p>{report.summary}</p>

      {report.brands.length > 0 && (
        <p className="text-xs">
          <span className="font-medium">Brands:</span> {report.brands.join(", ")}
        </p>
      )}

      {report.odometer_readings.length > 0 && (
        <div>
          <p className="font-medium">Odometer records</p>
          <ul className="mt-1 space-y-0.5 text-xs text-muted-foreground">
            {report.odometer_readings.slice(0, 8).map((o, i) => (
              <li key={i}>
                {o.date ?? "—"} · {o.mileage ?? "—"} {o.source ? `(${o.source})` : ""}
              </li>
            ))}
          </ul>
        </div>
      )}

      <p className="text-[11px] text-muted-foreground">{report.disclaimer}</p>
    </div>
  );
}
