"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Camera, CheckCircle2, SkipForward } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { STORAGE_BUCKETS } from "@/lib/constants";
import { compressImage, getUserId, uploadToStorage } from "@/lib/upload";
import { useI18n } from "@/components/i18n-provider";

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
  const { t } = useI18n();
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
    try {
      const userId = await getUserId();
      if (!userId) throw new Error(t("ui.signIn"));
      const compressed = await compressImage(file);
      const path = `${userId}/${sessionId}/followup-${request.id}.jpg`;
      await uploadToStorage(STORAGE_BUCKETS.inspectionPhotos, path, compressed);

      const res = await fetch(`/api/inspections/${sessionId}/follow-ups/${request.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ storage_path: path }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? t("ui.uploadFailed"));
      setStatus("analyzed");
      setImageUrl(data.request.image_url);
      setSummary(data.analysis?.summary ?? null);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : t("ui.uploadFailed"));
    } finally {
      setBusy(false);
    }
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
              <CheckCircle2 className="mr-1 size-3" /> {t("fu.analyzed")}
            </Badge>
          ) : status === "skipped" ? (
            <Badge variant="secondary">{t("ui.skipped")}</Badge>
          ) : (
            <Badge variant="moderate">{t("fu.requested")}</Badge>
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
              hidden
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) upload(f);
                e.target.value = "";
              }}
            />
            <Button size="sm" onClick={() => fileRef.current?.click()} disabled={busy}>
              <Camera className="size-4" /> {busy ? "…" : t("fu.uploadCloseup")}
            </Button>
            {status !== "skipped" && (
              <Button size="sm" variant="ghost" onClick={skip} disabled={busy}>
                <SkipForward className="size-4" /> {t("ui.skip")}
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
