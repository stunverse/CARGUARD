import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ENGINE_AUDIO_RECOMMENDATION_COPY,
  ENGINE_AUDIO_RISK_COPY,
  ENGINE_SOUND_LABELS,
} from "@/lib/constants";
import type { EngineAudioReportSection as Section } from "@/types";

const riskVariant: Record<string, "low" | "moderate" | "high" | "critical" | "secondary"> = {
  low: "low",
  moderate: "moderate",
  high: "high",
  very_high: "critical",
  insufficient_audio: "secondary",
};

export function EngineAudioReportSection({ section }: { section: Section | null | undefined }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Engine Start Audio Analysis</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        {!section ? (
          <p className="text-muted-foreground">
            No engine start audio was provided for this inspection.
          </p>
        ) : (
          <>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant={riskVariant[section.risk_level] ?? "secondary"}>
                {ENGINE_AUDIO_RISK_COPY[section.risk_level]}
              </Badge>
              <span className="text-muted-foreground">
                Engine audio score: <strong>{section.engine_audio_score ?? "—"}/100</strong>
                {" · "}Quality: {section.audio_quality_score ?? "—"}/100
                {section.duration_seconds ? ` · ${section.duration_seconds}s` : ""}
              </span>
            </div>
            {section.file_name && (
              <p className="text-xs text-muted-foreground">File: {section.file_name}</p>
            )}
            <p>{section.summary}</p>

            {section.detected_sounds.length > 0 && (
              <div className="space-y-1">
                <p className="font-medium">Detected sounds</p>
                {section.detected_sounds.map((s, i) => (
                  <div key={i} className="rounded-md border p-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">
                        {ENGINE_SOUND_LABELS[s.sound_type] ?? s.sound_type}
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
              {ENGINE_AUDIO_RECOMMENDATION_COPY[section.recommendation]}
            </p>

            {section.seller_questions.length > 0 && (
              <div>
                <p className="font-medium">Questions for the seller</p>
                <ul className="list-disc pl-5 text-muted-foreground">
                  {section.seller_questions.map((q, i) => (
                    <li key={i}>{q}</li>
                  ))}
                </ul>
              </div>
            )}
            {section.mechanic_questions.length > 0 && (
              <div>
                <p className="font-medium">Questions for the mechanic</p>
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
