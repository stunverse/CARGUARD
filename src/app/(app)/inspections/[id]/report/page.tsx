import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { ReportPreview } from "@/components/report-preview";
import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import {
  PdfExportButton,
  ShareReportButton,
} from "@/components/report-actions";
import type { FinalReport } from "@/types";

export const metadata = { title: "Report — CarGuard AI" };

export default async function ReportPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
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
          title="No report yet"
          description="Run the analysis and generate a report first."
          actionLabel="Go to analysis"
          actionHref={`/inspections/${id}/analysis`}
        />
      </div>
    );
  }

  const content = report.report_content as FinalReport;
  if (!content) notFound();

  return (
    <div className="px-5 py-6">
      <div className="mb-4 flex items-center justify-between print:hidden">
        <Link
          href={`/inspections/${id}`}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" /> Back
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
          <Link href="/dashboard">Back to dashboard</Link>
        </Button>
      </div>
    </div>
  );
}
