import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { ReportPreview } from "@/components/report-preview";
import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import {
  PdfExportButton,
  ShareReportButton,
} from "@/components/report-actions";
import { getServerLocale } from "@/lib/i18n-server";
import { t } from "@/lib/i18n";
import type { FinalReport } from "@/types";

export const metadata = { title: "Report — CarGuard AI" };

export default async function ReportPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ generated?: string }>;
}) {
  const { id } = await params;
  const { generated } = await searchParams;
  const locale = await getServerLocale();
  const supabase = await createClient();

  const { data: report } = await supabase
    .from("inspection_reports")
    .select("*")
    .eq("inspection_session_id", id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!report) {
    return (
      <div className="px-5 py-6">
        <EmptyState
          title={t(locale, "rp.noReport")}
          description={t(locale, "rp.noReportDesc")}
          actionLabel={t(locale, "rp.goAnalysis")}
          actionHref={`/inspections/${id}/analysis`}
        />
      </div>
    );
  }

  const content = report.report_content as FinalReport;
  if (!content) notFound();

  return (
    <div className="px-5 py-6">
      {generated && (
        <div className="mb-5 flex items-center gap-3 rounded-2xl border border-risk-low/40 bg-risk-low/10 p-4 print:hidden">
          <CheckCircle2 className="size-7 shrink-0 text-risk-low" aria-hidden />
          <div>
            <p className="font-semibold text-[#111827]">{t(locale, "rp.ready")}</p>
            <p className="text-sm text-muted-foreground">
              {t(locale, "rp.readyDesc")}
            </p>
          </div>
        </div>
      )}
      <div className="mb-4 flex items-center justify-between print:hidden">
        <Link
          href={`/inspections/${id}`}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" /> {t(locale, "rp.back")}
        </Link>
        <div className="flex items-center gap-2">
          <ShareReportButton
            reportId={report.id}
            shareToken={report.share_token}
            isPublic={report.is_public}
          />
          <PdfExportButton sessionId={id} />
        </div>
      </div>

      <ReportPreview report={content} />

      <div className="mt-6 flex justify-center print:hidden">
        <Button asChild variant="outline">
          <Link href="/dashboard">{t(locale, "rp.backDashboard")}</Link>
        </Button>
      </div>
    </div>
  );
}
