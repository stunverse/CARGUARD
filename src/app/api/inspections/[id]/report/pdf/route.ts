import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { buildReportPdf } from "@/lib/pdf";
import { logActivity } from "@/lib/activity";
import type { FinalReport } from "@/types";

// pdfkit requires the Node runtime (filesystem access for font metrics).
export const runtime = "nodejs";

const BUCKET =
  process.env.STORAGE_BUCKET_INSPECTION_PHOTOS || "inspection-photos";

// GET /api/inspections/[id]/report/pdf — server-rendered PDF download.
// Also best-effort persists the PDF to storage and records report_pdf_url.
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: sessionId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: report } = await supabase
    .from("inspection_reports")
    .select("id, report_content")
    .eq("inspection_session_id", sessionId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!report?.report_content) {
    return NextResponse.json({ error: "No report to export." }, { status: 404 });
  }

  const content = report.report_content as FinalReport;
  const pdf = await buildReportPdf(content);

  // Best-effort persistence (private bucket, signed URL kept on the session).
  try {
    const path = `${user.id}/${sessionId}/report-${report.id}.pdf`;
    await supabase.storage
      .from(BUCKET)
      .upload(path, pdf, { contentType: "application/pdf", upsert: true });
    const { data: signed } = await supabase.storage
      .from(BUCKET)
      .createSignedUrl(path, 60 * 60 * 24 * 7);
    if (signed?.signedUrl) {
      await supabase
        .from("inspection_sessions")
        .update({ report_pdf_url: signed.signedUrl })
        .eq("id", sessionId);
    }
  } catch (e) {
    console.error("PDF storage upload failed (continuing with download):", e);
  }

  await logActivity(supabase, {
    userId: user.id,
    sessionId,
    action: "pdf_exported",
    description: "Report exported to PDF",
  });

  return new NextResponse(new Uint8Array(pdf), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="carguard-report-${sessionId.slice(0, 8)}.pdf"`,
    },
  });
}
