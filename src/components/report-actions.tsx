"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Download, FileText, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/lib/toast";
import { useI18n } from "@/components/i18n-provider";

export function GenerateReportButton({ sessionId }: { sessionId: string }) {
  const { t } = useI18n();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function generate() {
    setLoading(true);
    setError(null);
    const res = await fetch(`/api/inspections/${sessionId}/report`, {
      method: "POST",
    });
    const data = await res.json();
    if (!res.ok) {
      const msg = data.error ?? t("ra.couldNotGenerate");
      setError(msg);
      toast.error(msg);
      setLoading(false);
      return;
    }
    toast.success(t("ra.reportGenerated"));
    router.push(`/inspections/${sessionId}/report?generated=1`);
    router.refresh();
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <Button onClick={generate} disabled={loading}>
        <FileText className="size-4" />
        {loading ? t("ra.generating") : t("ra.generateReport")}
      </Button>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

// Server-rendered PDF (pdfkit). Falls back to browser print if the user
// prefers; the primary action downloads a real PDF file.
export function PdfExportButton({ sessionId }: { sessionId: string }) {
  const { t } = useI18n();
  const [loading, setLoading] = useState(false);

  async function download() {
    setLoading(true);
    try {
      const res = await fetch(`/api/inspections/${sessionId}/report/pdf`);
      if (!res.ok) throw new Error("PDF export failed.");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `carguard-report-${sessionId.slice(0, 8)}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      // Fallback: browser print dialog.
      window.print();
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button variant="outline" onClick={download} disabled={loading}>
      <Download className="size-4" /> {loading ? t("ra.preparing") : t("ra.exportPdf")}
    </Button>
  );
}

export function ShareReportButton({
  reportId,
  shareToken,
  isPublic,
}: {
  reportId: string;
  shareToken: string | null;
  isPublic: boolean;
}) {
  const { t } = useI18n();
  const [enabled, setEnabled] = useState(isPublic);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  const shareUrl =
    shareToken && typeof window !== "undefined"
      ? `${window.location.origin}/r/${shareToken}`
      : "";

  async function toggle() {
    setLoading(true);
    const res = await fetch(`/api/reports/${reportId}/share`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_public: !enabled }),
    });
    if (res.ok) setEnabled(!enabled);
    setLoading(false);
  }

  function copy() {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="flex items-center gap-2">
      <Button variant="outline" onClick={toggle} disabled={loading}>
        <Share2 className="size-4" />
        {enabled ? t("ra.sharingOn") : t("ra.enableShare")}
      </Button>
      {enabled && shareUrl && (
        <Button variant="ghost" size="sm" onClick={copy}>
          {copied ? t("ra.copied") : t("ra.copyLink")}
        </Button>
      )}
    </div>
  );
}
