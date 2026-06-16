// =====================================================================
// CarGuard AI — Server-side PDF rendering (pdfkit, no browser needed)
// Renders a FinalReport into a real PDF Buffer using built-in Helvetica
// fonts. Used by /api/inspections/[id]/report/pdf.
// =====================================================================

import PDFDocument from "pdfkit";
import type { FinalReport } from "@/types";
import { vehicleLabel } from "@/lib/utils";
import { ENGINE_SOUND_LABELS } from "@/lib/constants";

const RED = "#b91c1c";
const MUTED = "#6b7280";

export function buildReportPdf(report: FinalReport): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: "A4", margin: 50 });
    const chunks: Buffer[] = [];
    doc.on("data", (c: Buffer) => chunks.push(c));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    const h1 = (t: string) =>
      doc.moveDown(0.6).fillColor(RED).fontSize(15).font("Helvetica-Bold").text(t).fillColor("#111");
    const body = (t: string) =>
      doc.fontSize(10).font("Helvetica").fillColor("#111").text(t);
    const muted = (t: string) =>
      doc.fontSize(9).font("Helvetica").fillColor(MUTED).text(t).fillColor("#111");
    const bullets = (items: string[]) => {
      if (!items.length) {
        muted("None.");
        return;
      }
      doc.fontSize(10).font("Helvetica").fillColor("#111").list(items, { bulletRadius: 1.5 });
    };

    // Title
    doc.fillColor(RED).fontSize(22).font("Helvetica-Bold").text("CarGuard AI");
    doc.fillColor(MUTED).fontSize(11).font("Helvetica").text("Inspection report");
    muted(`Generated ${new Date(report.generated_at).toLocaleString()}`);

    // 1. Vehicle
    h1("1. Vehicle information");
    body(vehicleLabel(report.vehicle));
    muted(
      [
        `Mileage: ${report.vehicle.mileage ?? "—"}`,
        `Asking price: ${report.vehicle.asking_price ?? "—"} ${report.vehicle.currency ?? ""}`,
        `Seller: ${report.vehicle.seller_type ?? "—"}`,
        report.vehicle.vin ? `VIN: ${report.vehicle.vin}` : "",
      ]
        .filter(Boolean)
        .join("  •  "),
    );

    // 2. Summary
    h1("2. Inspection summary");
    body(
      `Photos analyzed: ${report.summary.photos_analyzed}. ${report.summary.photo_quality_summary}`,
    );
    body(
      `Risk level: ${report.summary.risk_level.toUpperCase()}  •  Recommendation: ${report.summary.recommendation}`,
    );
    if (report.summary.confidence != null) {
      body(`AI confidence: ${report.summary.confidence}%`);
    }

    // 3. Scores
    h1("3. Scores (higher = safer)");
    const s = report.scores;
    const rows: [string, number][] = [
      ["Global", s.global_score],
      ["Accident / repair", s.accident_repair_score],
      ["Alignment", s.alignment_score],
      ["Paint / tone", s.paint_tone_score],
      ["Symmetry", s.symmetry_score],
      ["Bumpers / lights", s.bumpers_lights_score],
      ["Overall consistency", s.overall_consistency_score],
      ...(s.mechanical_score != null
        ? ([["Engine & mechanical", s.mechanical_score]] as [string, number][])
        : []),
      ["Model risk", s.model_risk_score],
    ];
    rows.forEach(([label, val]) => body(`${label}: ${val}/100`));
    if (report.summary.confidence != null) body(`AI confidence: ${report.summary.confidence}%`);

    // 4 + 5
    h1("4. Positive points");
    bullets(report.positive_points);
    h1("5. Suspicious points");
    bullets(report.suspicious_points);

    // 6. Photo-by-photo
    h1("6. Photo-by-photo analysis");
    report.photo_analysis.forEach((p) => {
      doc.fontSize(11).font("Helvetica-Bold").fillColor("#111").text(p.title);
      muted(
        `Quality ${p.quality_score ?? "—"} • Risk ${p.risk_score ?? "—"} • Confidence ${p.confidence ?? "—"}`,
      );
      if (p.observations.length) bullets(p.observations);
      p.detected_issues.forEach((i) =>
        body(`• [${i.severity}, ${i.confidence}%] ${i.location}: ${i.explanation}`),
      );
      doc.moveDown(0.3);
    });

    // 7 + 8 + 9
    h1("7. Questions to ask the seller");
    bullets(report.questions_to_ask_seller);
    h1("8. Negotiation arguments");
    bullets(report.negotiation_arguments);
    h1("9. Recommended next steps");
    bullets(report.recommended_next_steps);

    // 10. Engine start audio (optional module)
    h1("10. Engine Start Audio Analysis");
    const ea = report.engine_audio;
    if (!ea) {
      muted("No engine start audio was provided for this inspection.");
    } else {
      body(
        `Risk: ${ea.risk_level.toUpperCase()} • Engine audio score: ${ea.engine_audio_score ?? "—"}/100 • Quality: ${ea.audio_quality_score ?? "—"}/100`,
      );
      if (ea.file_name) muted(`File: ${ea.file_name}`);
      body(ea.summary);
      ea.detected_sounds.forEach((s) =>
        body(
          `• [${s.severity}, ${s.confidence}%] ${ENGINE_SOUND_LABELS[s.sound_type] ?? s.sound_type}: ${s.explanation}`,
        ),
      );
      if (ea.seller_questions.length) {
        doc.fontSize(10).font("Helvetica-Bold").text("Questions for the seller");
        bullets(ea.seller_questions);
      }
      if (ea.mechanic_questions.length) {
        doc.fontSize(10).font("Helvetica-Bold").text("Questions for the mechanic");
        bullets(ea.mechanic_questions);
      }
      doc.fontSize(8).font("Helvetica-Oblique").fillColor(MUTED).text(ea.disclaimer).fillColor("#111");
    }

    // 11. Engine & mechanical check (optional module)
    h1("11. Engine & Mechanical Check");
    const me = report.mechanical;
    if (!me) {
      muted("No engine & mechanical check was performed for this inspection.");
    } else {
      body(`Risk: ${me.risk_level.toUpperCase()} • Mechanical score: ${me.mechanical_score}/100`);
      body(me.summary);
      me.items.forEach((it) =>
        body(
          `• ${it.title}: ${it.score ?? "—"}/100${it.suspicious_observations.length ? ` — ${it.suspicious_observations.join("; ")}` : ""}`,
        ),
      );
      if (me.seller_questions.length) {
        doc.fontSize(10).font("Helvetica-Bold").text("Questions for the seller");
        bullets(me.seller_questions);
      }
      if (me.mechanic_questions.length) {
        doc.fontSize(10).font("Helvetica-Bold").text("Questions for the mechanic");
        bullets(me.mechanic_questions);
      }
      doc.fontSize(8).font("Helvetica-Oblique").fillColor(MUTED).text(me.disclaimer).fillColor("#111");
    }

    // 12. Vehicle history (NHTSA)
    const vh = report.vehicle_history;
    if (vh) {
      h1("12. Vehicle History (recalls & complaints)");
      muted(`Source: ${vh.source} · ${vh.vehicle}`);
      body(vh.note);
      vh.recalls.forEach((r) =>
        body(`• [${r.campaign}] ${r.component}: ${r.summary}`),
      );
      if (vh.complaints_count > 0) {
        body(
          `${vh.complaints_count} consumer complaint(s). Most reported: ${vh.top_complaint_components.join(", ") || "—"}.`,
        );
      }
      doc.fontSize(8).font("Helvetica-Oblique").fillColor(MUTED).text(vh.disclaimer).fillColor("#111");
    }

    // Disclaimer
    doc.moveDown(0.8);
    doc.fontSize(8).font("Helvetica-Oblique").fillColor(MUTED).text(report.disclaimer);

    doc.end();
  });
}
