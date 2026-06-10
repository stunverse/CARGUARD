"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Download, FileText, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function GenerateReportButton({ sessionId }: { sessionId: string }) {
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
      setError(data.error ?? "Could not generate report.");
      setLoading(false);
      return;
    }
    router.push(`/inspections/${sessionId}/report`);
    router.refresh();
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <Button onClick={generate} disabled={loading}>
        <FileText className="size-4" />
        {loading ? "Generating…" : "Generate report"}
      </Button>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

// Browser print-to-PDF (dependency-free). A server PDF renderer can
// replace this later — see TODO in lib/report.ts.
export function PdfExportButton() {
  return (
    <Button variant="outline" onClick={() => window.print()}>
      <Download className="size-4" /> Export PDF
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
        {enabled ? "Sharing on" : "Enable share link"}
      </Button>
      {enabled && shareUrl && (
        <Button variant="ghost" size="sm" onClick={copy}>
          {copied ? "Copied!" : "Copy link"}
        </Button>
      )}
    </div>
  );
}
