import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ReportPreview } from "@/components/report-preview";
import type { FinalReport } from "@/types";

export const metadata = { title: "Shared report — CarGuard AI" };

// Public, read-only report view. RLS policy "reports_public_read" allows
// anonymous SELECT when is_public = true.
export default async function SharedReportPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const supabase = await createClient();

  const { data: report } = await supabase
    .from("inspection_reports")
    .select("report_content, is_public")
    .eq("share_token", token)
    .eq("is_public", true)
    .maybeSingle();

  if (!report) notFound();
  const content = report.report_content as FinalReport;

  return (
    <div className="min-h-screen bg-muted/30 py-8">
      <div className="container max-w-3xl">
        <ReportPreview report={content} />
      </div>
    </div>
  );
}
