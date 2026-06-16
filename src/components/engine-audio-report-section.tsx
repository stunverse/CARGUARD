"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ENGINE_AUDIO_RECOMMENDATION_COPY,
  ENGINE_AUDIO_RISK_COPY,
  ENGINE_SOUND_LABELS,
} from "@/lib/constants";
import { useI18n } from "@/components/i18n-provider";
import {
  ENGINE_AUDIO_RECO_FR,
  ENGINE_AUDIO_RISK_FR,
  ENGINE_SOUND_FR,
  pick,
} from "@/lib/content-i18n";
import type { EngineAudioReportSection as Section } from "@/types";

const riskVariant: Record<string, "low" | "moderate" | "high" | "critical" | "secondary"> = {
  low: "low",
  moderate: "moderate",
  high: "high",
  very_high: "critical",
  insufficient_audio: "secondary",
};

export function EngineAudioReportSection({ section }: { section: Section | null | undefined }) {
  const { locale, t } = useI18n();
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{t("rep.s.engineAudio")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        {!section ? (
          <p className="text-muted-foreground">{t("rep.noEngineAudio")}</p>
        ) : (
          <>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant={riskVariant[section.risk_level] ?? "secondary"}>
                {pick(locale, section.risk_level, ENGINE_AUDIO_RISK_FR, ENGINE_AUDIO_RISK_COPY)}
              </Badge>
              <span className="text-muted-foreground">
                {t("rep.engineAudioScore")}: <strong>{section.engine_audio_score ?? "—"}/100</strong>
                {" · "}{t("rep.quality")}: {section.audio_quality_score ?? "—"}/100
                {section.duration_seconds ? ` · ${section.duration_seconds}s` : ""}
              </span>
            </div>
            {section.file_name && (
              <p className="text-xs text-muted-foreground">{t("rep.file")}: {section.file_name}</p>
            )}
            <p>{section.summary}</p>

            {section.detected_sounds.length > 0 && (
              <div className="space-y-1">
                <p className="font-medium">{t("rep.detectedSounds")}</p>
                {section.detected_sounds.map((s, i) => (
                  <div key={i} className="rounded-md border p-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">
                        {pick(locale, s.sound_type, ENGINE_SOUND_FR, ENGINE_SOUND_LABELS)}
                      </span>
                      <Badge variant={riskVariant[s.severity === "critical" ? "very_high" : s.severity] ?? "moderate"}>
                        {s.severity} · {s.confidence}%
                      </Badge>
                    </div>
                    <p className="mt-1 text-muted-foreground">{s.explanation}</p>
                  </div>
                ))}
              </div>
            )}

            <p className="rounded-md bg-muted/50 p-2">
              {pick(locale, section.recommendation, ENGINE_AUDIO_RECO_FR, ENGINE_AUDIO_RECOMMENDATION_COPY)}
            </p>

            {section.seller_questions.length > 0 && (
              <div>
                <p className="font-medium">{t("rep.sellerQuestions")}</p>
                <ul className="list-disc pl-5 text-muted-foreground">
                  {section.seller_questions.map((q, i) => (
                    <li key={i}>{q}</li>
                  ))}
                </ul>
              </div>
            )}
            {section.mechanic_questions.length > 0 && (
              <div>
                <p className="font-medium">{t("rep.mechanicQuestions")}</p>
                <ul className="list-disc pl-5 text-muted-foreground">
                  {section.mechanic_questions.map((q, i) => (
                    <li key={i}>{q}</li>
                  ))}
                </ul>
              </div>
            )}

            <p className="text-xs text-muted-foreground">{section.disclaimer}</p>
          </>
        )}
      </CardContent>
    </Card>
  );
}
