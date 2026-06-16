import Link from "next/link";
import { FileText, ChevronRight } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/empty-state";
import { RiskLevelBadge } from "@/components/risk-indicators";
import { formatDate, vehicleLabel } from "@/lib/utils";
import { getServerLocale } from "@/lib/i18n-server";
import { t } from "@/lib/i18n";
import type { FinalReport } from "@/types";

export const metadata = { title: "Reports — CarGuard AI" };

export default async function ReportsPage() {
  const locale = await getServerLocale();
  const supabase = await createClient();

  const { data: reports } = await supabase
    .from("inspection_reports")
    .select("id, inspection_session_id, report_content, created_at")
    .order("created_at", { ascending: false });

  const list = reports ?? [];

  return (
    <div className="px-5 py-6">
      <h1 className="mb-5 text-2xl font-bold text-[#111827]">{t(locale, "list.reports")}</h1>

      {list.length === 0 ? (
        <EmptyState
          icon={FileText}
          title={t(locale, "list.noReports")}
          description={t(locale, "list.noReportsDesc")}
          actionLabel={t(locale, "list.startInspection")}
          actionHref="/inspections/new"
        />
      ) : (
        <div className="space-y-3 lg:grid lg:grid-cols-2 lg:gap-3 lg:space-y-0 xl:grid-cols-3">
          {list.map((r) => {
            const content = r.report_content as FinalReport | null;
            return (
              <Link key={r.id} href={`/inspections/${r.inspection_session_id}/report`}>
                <Card className="transition-shadow hover:shadow-md">
                  <CardContent className="flex items-center gap-3 p-4">
                    <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-[rgba(229,9,20,0.10)] text-[#E50914]">
                      <FileText className="size-6" aria-hidden />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold">
                        {content ? vehicleLabel(content.vehicle) : t(locale, "list.reportFallback")}
                      </p>
                      <p className="text-xs text-muted-foreground">{formatDate(r.created_at)}</p>
                      {content && (
                        <div className="mt-1">
                          <RiskLevelBadge level={content.summary.risk_level} />
                        </div>
                      )}
                    </div>
                    {content && (
                      <span className="text-right">
                        <span className="block text-xl font-bold">
                          {content.scores.global_score}
                        </span>
                        <span className="text-xs text-muted-foreground">/100</span>
                      </span>
                    )}
                    <ChevronRight className="size-5 text-muted-foreground" aria-hidden />
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
