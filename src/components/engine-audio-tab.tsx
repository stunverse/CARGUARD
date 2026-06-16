"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  CheckCircle2,
  Circle,
  Mic,
  Square,
  Upload,
  Volume2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RiskScoreCircle } from "@/components/risk-indicators";
import { DisclaimerBanner } from "@/components/disclaimer-banner";
import {
  ENGINE_AUDIO_RECOMMENDATION_COPY,
  ENGINE_AUDIO_RISK_COPY,
  ENGINE_SOUND_LABELS,
} from "@/lib/constants";
import { cn } from "@/lib/utils";
import { toast } from "@/lib/toast";
import { STORAGE_BUCKETS } from "@/lib/constants";
import { fileExt, getUserId, uploadToStorage } from "@/lib/upload";
import { useI18n } from "@/components/i18n-provider";
import { ENGINE_AUDIO_RECO_FR, ENGINE_AUDIO_RISK_FR, ENGINE_SOUND_FR, pick } from "@/lib/content-i18n";
import type {
  DetectedEngineSound,
  EngineAudioCheck,
  EngineAudioRiskLevel,
} from "@/types";

const RECORDING_TIP_KEYS = [
  "eat.tips.radio",
  "eat.tips.doors",
  "eat.tips.noRev",
  "eat.tips.before",
  "eat.tips.after",
  "eat.tips.hood",
  "eat.tips.noisy",
  "eat.tips.exhaust",
  "eat.tips.noTouch",
];

const riskVariant: Record<EngineAudioRiskLevel, "low" | "moderate" | "high" | "critical" | "secondary"> = {
  low: "low",
  moderate: "moderate",
  high: "high",
  very_high: "critical",
  insufficient_audio: "secondary",
};

export function EngineAudioTab({
  sessionId,
  initialCheck,
}: {
  sessionId: string;
  initialCheck: EngineAudioCheck | null;
}) {
  const { locale, t } = useI18n();
  const router = useRouter();
  const [check, setCheck] = useState<EngineAudioCheck | null>(initialCheck);
  const [busy, setBusy] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recording, setRecording] = useState(false);

  const fileRef = useRef<HTMLInputElement>(null);
  const mediaRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const startedAtRef = useRef<number>(0);

  async function startRecording() {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      chunksRef.current = [];
      mr.ondataavailable = (e) => e.data.size > 0 && chunksRef.current.push(e.data);
      mr.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        const duration = Math.round((Date.now() - startedAtRef.current) / 1000);
        const file = new File([blob], `engine-recording-${Date.now()}.webm`, {
          type: "audio/webm",
        });
        upload(file, duration);
      };
      startedAtRef.current = Date.now();
      mr.start();
      mediaRef.current = mr;
      setRecording(true);
    } catch {
      setError(t("eat.micDenied"));
    }
  }

  function stopRecording() {
    mediaRef.current?.stop();
    setRecording(false);
  }

  async function upload(file: File, durationSeconds = 0) {
    setBusy(true);
    setError(null);
    try {
      const userId = await getUserId();
      if (!userId) throw new Error(t("ui.signIn"));
      const isVideo = file.type.startsWith("video/");
      const path = `${userId}/${sessionId}/engine.${fileExt(file)}`;
      await uploadToStorage(STORAGE_BUCKETS.engineAudio, path, file);

      const res = await fetch(`/api/inspections/${sessionId}/engine-audio`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          storage_path: path,
          mime_type: file.type,
          file_type: isVideo ? "video" : "audio",
          original_file_name: file.name,
          duration_seconds: durationSeconds,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? t("ui.uploadFailed"));
      setCheck(data.check);
      router.refresh();
    } catch (e) {
      const msg = e instanceof Error ? e.message : t("ui.uploadFailed");
      setError(msg);
      toast.error(msg);
    } finally {
      setBusy(false);
    }
  }

  async function analyze() {
    if (!check) return;
    setAnalyzing(true);
    setError(null);
    const res = await fetch(
      `/api/inspections/${sessionId}/engine-audio/${check.id}/analyze`,
      { method: "POST" },
    );
    const data = await res.json();
    setAnalyzing(false);
    if (!res.ok) {
      setError(data.error ?? t("eat.analysisFailed"));
      toast.error(data.error ?? t("eat.analysisFailedToast"));
      return;
    }
    toast.success(t("eat.analyzedToast"));
    setCheck(data.check);
    router.refresh();
  }

  const quality = check?.ai_quality_check;
  const analysis = check?.ai_analysis;
  const analyzed = check?.analysis_status === "completed" && analysis;

  return (
    <div className="space-y-6">
      {/* Section 1 — intro + actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Volume2 className="size-5 text-accent" /> {t("eat.title")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">{t("eat.intro")}</p>

          <input
            ref={fileRef}
            type="file"
            accept="audio/*,video/mp4,video/quicktime,video/webm"
            hidden
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) upload(f);
              e.target.value = "";
            }}
          />
          <div className="flex flex-wrap gap-2">
            {recording ? (
              <Button variant="destructive" onClick={stopRecording}>
                <Square className="size-4" /> {t("eat.stopRecording")}
              </Button>
            ) : (
              <Button onClick={startRecording} disabled={busy}>
                <Mic className="size-4" /> {t("eat.recordAudio")}
              </Button>
            )}
            <Button variant="outline" onClick={() => fileRef.current?.click()} disabled={busy || recording}>
              <Upload className="size-4" /> {t("eat.uploadFile")}
            </Button>
          </div>
          {busy && <p className="text-sm text-muted-foreground">{t("eat.uploadingChecking")}</p>}
          {error && <p className="text-sm text-destructive">{error}</p>}
          <p className="text-xs text-muted-foreground">
            {t("eat.tipFormatPre")} <strong>{t("eat.tipFormatStrong")}</strong>{t("eat.tipFormatPost")}
          </p>
        </CardContent>
      </Card>

      {/* Section 2 — instructions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t("eat.howToRecord")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>{t("eat.howToRecordDesc")}</p>
          <ul className="grid gap-1 sm:grid-cols-2">
            {RECORDING_TIP_KEYS.map((key) => (
              <li key={key} className="flex items-start gap-2">
                <Circle className="mt-1.5 size-1.5 shrink-0 fill-current" /> {t(key)}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Section 3 — uploaded file + quality */}
      {check && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t("eat.uploadedRecording")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex flex-wrap items-center gap-3 text-sm">
              <span className="font-medium">{check.original_file_name}</span>
              {check.duration_seconds ? (
                <span className="text-muted-foreground">{check.duration_seconds}s</span>
              ) : null}
              <QualityBadge status={check.quality_status} />
              {quality?.audio_quality_score != null && (
                <span className="text-muted-foreground">
                  {t("eat.quality")} {quality.audio_quality_score}/100
                </span>
              )}
            </div>
            {check.file_url && (
              <audio controls src={check.file_url} className="w-full">
                {t("eat.audioUnsupported")}
              </audio>
            )}
            {check.quality_status === "needs_retake" && quality?.retake_instructions && (
              <div className="rounded-md border border-risk-moderate/40 bg-risk-moderate/10 p-3 text-sm text-risk-moderate">
                {quality.retake_instructions}
              </div>
            )}
            {!analyzed && (
              <Button onClick={analyze} disabled={analyzing}>
                {analyzing ? t("eat.analyzing") : t("eat.analyzeBtn")}
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Section 4 — results */}
      {analyzed && analysis && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t("eat.analysisTitle")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="flex flex-col items-center gap-4 sm:flex-row">
              <RiskScoreCircle score={analysis.engine_audio_score} label={t("eat.engineAudioScore")} />
              <div className="flex-1 space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant={riskVariant[analysis.risk_level]}>
                    {pick(locale, analysis.risk_level, ENGINE_AUDIO_RISK_FR, ENGINE_AUDIO_RISK_COPY)}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {t("eat.confidence")} {analysis.confidence_score}%
                  </span>
                </div>
                <p className="text-sm">{analysis.summary}</p>
                <p className="rounded-md bg-muted/50 p-2 text-sm">
                  {pick(locale, analysis.recommendation, ENGINE_AUDIO_RECO_FR, ENGINE_AUDIO_RECOMMENDATION_COPY)}
                </p>
              </div>
            </div>

            {/* Detected sounds */}
            {analysis.detected_sounds.length > 0 ? (
              <div className="space-y-2">
                <h4 className="font-semibold">{t("eat.detectedSounds")}</h4>
                {analysis.detected_sounds.map((s, i) => (
                  <DetectedSoundCard key={i} sound={s} />
                ))}
              </div>
            ) : (
              <p className="text-sm text-risk-low">{t("eat.noSuspicious")}</p>
            )}

            {/* Questions */}
            <div className="grid gap-4 md:grid-cols-2">
              <QuestionList title={t("eat.qSeller")} items={analysis.seller_questions} />
              <QuestionList title={t("eat.qMechanic")} items={analysis.mechanic_questions} />
            </div>

            {analysis.next_steps.length > 0 && (
              <QuestionList title={t("eat.nextSteps")} items={analysis.next_steps} />
            )}
          </CardContent>
        </Card>
      )}

      <DisclaimerBanner text={t("eat.disclaimer")} />
    </div>
  );
}

function QualityBadge({ status }: { status: string }) {
  const { t } = useI18n();
  if (status === "passed")
    return (
      <Badge variant="low">
        <CheckCircle2 className="mr-1 size-3" /> {t("eat.qualityOK")}
      </Badge>
    );
  if (status === "needs_retake")
    return (
      <Badge variant="moderate">
        <AlertTriangle className="mr-1 size-3" /> {t("eat.retakeRecommended")}
      </Badge>
    );
  if (status === "failed") return <Badge variant="critical">{t("eat.failed")}</Badge>;
  return <Badge variant="secondary">{t("eat.pending")}</Badge>;
}

function DetectedSoundCard({ sound }: { sound: DetectedEngineSound }) {
  const { locale, t } = useI18n();
  const sevVariant =
    sound.severity === "critical"
      ? "critical"
      : sound.severity === "high"
        ? "high"
        : "moderate";
  return (
    <div className="rounded-md border p-3 text-sm">
      <div className="flex items-center justify-between">
        <span className="font-medium">
          {pick(locale, sound.sound_type, ENGINE_SOUND_FR, ENGINE_SOUND_LABELS)}
        </span>
        <Badge variant={sevVariant as never}>
          {sound.severity} · {sound.confidence}%
        </Badge>
      </div>
      <p className="mt-1 text-muted-foreground">{sound.explanation}</p>
      {(sound.timestamp_start > 0 || sound.timestamp_end > 0) && (
        <p className="mt-1 text-xs text-muted-foreground">
          {t("eat.around")} {sound.timestamp_start}s–{sound.timestamp_end}s
        </p>
      )}
      {sound.possible_causes?.length > 0 && (
        <p className="mt-1 text-xs">
          {t("eat.possibleCauses")} {sound.possible_causes.join(", ")}
        </p>
      )}
      {sound.recommended_action && (
        <p className={cn("mt-1 text-xs font-medium")}>→ {sound.recommended_action}</p>
      )}
    </div>
  );
}

function QuestionList({ title, items }: { title: string; items: string[] }) {
  if (!items?.length) return null;
  return (
    <div>
      <h4 className="mb-1 font-semibold">{title}</h4>
      <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
        {items.map((q, i) => (
          <li key={i}>{q}</li>
        ))}
      </ul>
    </div>
  );
}
