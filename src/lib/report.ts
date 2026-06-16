// =====================================================================
// CarGuard AI — Final report assembler (spec §31, AI fn #7)
// Combines vehicle data, per-photo analysis and the global result into
// the FinalReport JSON stored in inspection_reports.report_content.
// =====================================================================

import { PHOTO_POINTS, REPORT_DISCLAIMER } from "@/lib/constants";
import type {
  EngineAudioCheck,
  EngineAudioReportSection,
  FinalReport,
  FullInspectionResult,
  InspectionPhoto,
  MechanicalReportSection,
  MileageCheckSection,
  PhotoPointCode,
  SafetyRatingSection,
  TitleFlagsSection,
  Vehicle,
  VehicleHistorySection,
  VehicleSpecsSection,
} from "@/types";

// Build the embedded report section from a completed engine-audio check.
export function engineAudioToReportSection(
  check: EngineAudioCheck | null | undefined,
): EngineAudioReportSection | null {
  if (!check || check.analysis_status !== "completed" || !check.ai_analysis) {
    return null;
  }
  const a = check.ai_analysis;
  return {
    file_name: check.original_file_name,
    duration_seconds: check.duration_seconds,
    audio_quality_score: check.audio_quality_score,
    engine_audio_score: check.engine_audio_score,
    risk_level: a.risk_level,
    recommendation: a.recommendation,
    detected_sounds: a.detected_sounds ?? [],
    summary: a.summary,
    seller_questions: a.seller_questions ?? [],
    mechanic_questions: a.mechanic_questions ?? [],
    disclaimer: a.disclaimer,
  };
}

export function generateFinalReport(params: {
  vehicle: Partial<Vehicle>;
  photos: InspectionPhoto[];
  global: FullInspectionResult;
  globalScore: number;
  engineAudio?: EngineAudioReportSection | null;
  mechanical?: MechanicalReportSection | null;
  vehicleHistory?: VehicleHistorySection | null;
  specifications?: VehicleSpecsSection | null;
  mileageCheck?: MileageCheckSection | null;
  safety?: SafetyRatingSection | null;
  titleFlags?: TitleFlagsSection | null;
  /** Overall confidence across all modules (falls back to photo avg). */
  overallConfidence?: number;
}): FinalReport {
  const {
    vehicle,
    photos,
    global,
    globalScore,
    engineAudio,
    mechanical,
    vehicleHistory,
    specifications,
    mileageCheck,
    safety,
    titleFlags,
    overallConfidence,
  } = params;

  const titleFor = (code: PhotoPointCode) =>
    PHOTO_POINTS.find((p) => p.code === code)?.title ?? code;

  const usable = photos.filter((p) => p.quality_status !== "skipped");
  const passed = photos.filter((p) => p.quality_status === "passed").length;

  const photo_analysis = PHOTO_POINTS.map((point) => {
    const photo = photos.find((p) => p.photo_point_code === point.code);
    const analysis = photo?.ai_analysis ?? null;
    return {
      photo_point_code: point.code,
      title: point.title,
      quality_score: photo?.ai_quality_check?.quality_score ?? null,
      risk_score: analysis?.risk_score ?? null,
      observations: [
        ...(analysis?.normal_observations ?? []),
        ...(analysis?.suspicious_observations ?? []),
      ],
      detected_issues: analysis?.detected_issues ?? [],
      confidence: analysis?.confidence ?? null,
    };
  });

  // Overall AI confidence: use the cross-module value when provided,
  // otherwise fall back to the average of per-photo confidences.
  const photoConfidences = photo_analysis
    .map((p) => p.confidence)
    .filter((c): c is number => c != null);
  const confidence =
    overallConfidence ??
    (photoConfidences.length
      ? Math.round(photoConfidences.reduce((a, b) => a + b, 0) / photoConfidences.length)
      : undefined);

  return {
    generated_at: new Date().toISOString(),
    vehicle,
    ai_summary: global.global_summary,
    summary: {
      photos_analyzed: usable.length,
      photo_quality_summary: `${passed} of ${photos.length} photos passed quality control.`,
      risk_level: global.risk_level,
      recommendation: global.recommendation,
      confidence,
    },
    scores: {
      global_score: globalScore,
      accident_repair_score: global.accident_repair_score,
      alignment_score: global.alignment_score,
      paint_tone_score: global.paint_tone_score,
      symmetry_score: global.symmetry_score,
      bumpers_lights_score: global.bumpers_lights_score,
      overall_consistency_score: global.overall_consistency_score,
      model_risk_score: global.model_risk_score,
      mechanical_score: mechanical?.mechanical_score ?? null,
    },
    positive_points: global.positive_points,
    suspicious_points: global.suspicious_points,
    photo_analysis,
    questions_to_ask_seller: global.questions_to_ask_seller,
    negotiation_arguments: global.negotiation_arguments,
    recommended_next_steps: global.recommended_next_steps,
    disclaimer: global.disclaimer || REPORT_DISCLAIMER,
    engine_audio: engineAudio ?? null,
    mechanical: mechanical ?? null,
    vehicle_history: vehicleHistory ?? null,
    specifications: specifications ?? null,
    mileage_check: mileageCheck ?? null,
    safety: safety ?? null,
    title_flags: titleFlags ?? null,
  };
}

// Lightweight, dependency-free HTML the browser can print to PDF.
// (A server-side PDF renderer can replace this later — see TODO.)
export function reportToPrintableHtml(report: FinalReport): string {
  const esc = (s: unknown) =>
    String(s ?? "").replace(/[&<>]/g, (c) =>
      c === "&" ? "&amp;" : c === "<" ? "&lt;" : "&gt;",
    );
  const list = (items: string[]) =>
    items.length
      ? `<ul>${items.map((i) => `<li>${esc(i)}</li>`).join("")}</ul>`
      : "<p class='muted'>None.</p>";

  return `<!doctype html><html><head><meta charset="utf-8"/>
<title>CarGuard AI Report</title>
<style>
  body{font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;color:#171717;margin:32px;line-height:1.5}
  h1{color:#b91c1c} h2{border-bottom:2px solid #eee;padding-bottom:6px;margin-top:28px}
  .muted{color:#777} .badge{display:inline-block;padding:4px 10px;border-radius:999px;background:#fee;color:#b91c1c;font-weight:600}
  table{border-collapse:collapse;width:100%} td,th{border:1px solid #eee;padding:6px;text-align:left}
  .disc{margin-top:32px;padding:14px;background:#fafafa;border:1px solid #eee;border-radius:8px;font-size:13px;color:#555}
</style></head><body>
<h1>CarGuard AI — Inspection Report</h1>
<p class="muted">Generated ${esc(new Date(report.generated_at).toLocaleString())}</p>

<h2>1. Vehicle information</h2>
<p>${esc([report.vehicle.year, report.vehicle.make, report.vehicle.model].filter(Boolean).join(" "))}
 — Mileage: ${esc(report.vehicle.mileage ?? "—")} — Asking price: ${esc(report.vehicle.asking_price ?? "—")} ${esc(report.vehicle.currency ?? "")}
 — Seller: ${esc(report.vehicle.seller_type ?? "—")}${report.vehicle.vin ? ` — VIN: ${esc(report.vehicle.vin)}` : ""}</p>

<h2>2. Inspection summary</h2>
<p>Photos analyzed: ${esc(report.summary.photos_analyzed)} — ${esc(report.summary.photo_quality_summary)}</p>
<p>Risk level: <span class="badge">${esc(report.summary.risk_level)}</span> — Recommendation: <strong>${esc(report.summary.recommendation)}</strong></p>

<h2>3. Scores (higher = safer)</h2>
<table>
<tr><th>Global</th><td>${report.scores.global_score}/100</td></tr>
<tr><th>Accident / repair</th><td>${report.scores.accident_repair_score}/100</td></tr>
<tr><th>Alignment</th><td>${report.scores.alignment_score}/100</td></tr>
<tr><th>Paint / tone</th><td>${report.scores.paint_tone_score}/100</td></tr>
<tr><th>Symmetry</th><td>${report.scores.symmetry_score}/100</td></tr>
<tr><th>Bumpers / lights</th><td>${report.scores.bumpers_lights_score}/100</td></tr>
<tr><th>Overall consistency</th><td>${report.scores.overall_consistency_score}/100</td></tr>
<tr><th>Model risk</th><td>${report.scores.model_risk_score}/100</td></tr>
</table>

<h2>4. Positive points</h2>${list(report.positive_points)}
<h2>5. Suspicious points</h2>${list(report.suspicious_points)}

<h2>6. Photo-by-photo analysis</h2>
${report.photo_analysis
  .map(
    (p) => `<h3>${esc(p.title)}</h3>
<p class="muted">Quality: ${p.quality_score ?? "—"} — Risk: ${p.risk_score ?? "—"} — Confidence: ${p.confidence ?? "—"}</p>
${list(p.observations)}
${
  p.detected_issues.length
    ? `<ul>${p.detected_issues
        .map(
          (i) =>
            `<li><strong>${esc(i.issue_type)}</strong> (${esc(i.severity)}, ${i.confidence}%) — ${esc(i.location)}: ${esc(i.explanation)}</li>`,
        )
        .join("")}</ul>`
    : ""
}`,
  )
  .join("")}

<h2>7. Questions to ask the seller</h2>${list(report.questions_to_ask_seller)}
<h2>8. Negotiation arguments</h2>${list(report.negotiation_arguments)}
<h2>9. Recommended next steps</h2>${list(report.recommended_next_steps)}

<div class="disc"><strong>Disclaimer.</strong> ${esc(report.disclaimer)}</div>
</body></html>`;
}
