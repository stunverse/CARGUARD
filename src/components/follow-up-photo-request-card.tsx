"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Camera, CheckCircle2, SkipForward } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface FollowUp {
  id: string;
  title: string;
  instruction: string | null;
  reason: string | null;
  target_area: string | null;
  status: string;
  image_url: string | null;
  ai_analysis: { summary?: string } | null;
}

export function FollowUpPhotoRequestCard({
  sessionId,
  request,
}: {
  sessionId: string;
  request: FollowUp;
}) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState(request.status);
  const [imageUrl, setImageUrl] = useState(request.image_url);
  const [summary, setSummary] = useState(request.ai_analysis?.summary ?? null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function upload(file: File) {
    setBusy(true);
    setError(null);
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch(
      `/api/inspections/${sessionId}/follow-ups/${request.id}`,
      { method: "POST", body: fd },
    );
    const data = await res.json();
    setBusy(false);
    if (!res.ok) {
      setError(data.error ?? "Upload failed.");
      return;
    }
    setStatus("analyzed");
    setImageUrl(data.request.image_url);
    setSummary(data.analysis?.summary ?? null);
    router.refresh();
  }

  async function skip() {
    setBusy(true);
    await fetch(`/api/inspections/${sessionId}/follow-ups/${request.id}`, {
      method: "PUT",
    });
    setBusy(false);
    setStatus("skipped");
    router.refresh();
  }

  return (
    <Card>
      <CardContent className="space-y-3 p-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h4 className="font-medium">{request.title}</h4>
            {request.reason && (
              <p className="text-sm text-muted-foreground">{request.reason}</p>
            )}
          </div>
          {status === "analyzed" ? (
            <Badge variant="low">
              <CheckCircle2 className="mr-1 size-3" /> Analyzed
            </Badge>
          ) : status === "skipped" ? (
            <Badge variant="secondary">Skipped</Badge>
          ) : (
            <Badge variant="moderate">Requested</Badge>
          )}
        </div>

        {request.instruction && (
          <p className="rounded-md bg-accent/5 p-2 text-xs">{request.instruction}</p>
        )}

        {imageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={imageUrl} alt={request.title} className="aspect-video w-full rounded-md object-cover" />
        )}
        {summary && <p className="text-sm">{summary}</p>}
        {error && <p className="text-sm text-destructive">{error}</p>}

        {status !== "analyzed" && (
          <div className="flex gap-2">
            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/heic,image/webp"
              capture="environment"
              hidden
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) upload(f);
                e.target.value = "";
              }}
            />
            <Button size="sm" onClick={() => fileRef.current?.click()} disabled={busy}>
              <Camera className="size-4" /> {busy ? "…" : "Upload close-up"}
            </Button>
            {status !== "skipped" && (
              <Button size="sm" variant="ghost" onClick={skip} disabled={busy}>
                <SkipForward className="size-4" /> Skip
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
