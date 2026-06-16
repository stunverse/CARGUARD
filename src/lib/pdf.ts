// =====================================================================
// CarGuard AI — Server-side PDF rendering (pdfkit, no browser needed)
// Renders a FinalReport into a real PDF Buffer using built-in Helvetica
// fonts. Used by /api/inspections/[id]/report/pdf.
// =====================================================================

import PDFDocument from "pdfkit";
import type { FinalReport } from "@/types";
import { vehicleLabel } from "@/lib/utils";
import { formatMoney, formatDistance } from "@/lib/i18n";
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
        `Mileage: ${formatDistance(report.vehicle.mileage ?? null, report.vehicle.currency)}`,
        `Asking price: ${formatMoney(report.vehicle.asking_price ?? null, report.vehicle.currency ?? "USD")}`,
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
    if (report.ai_summary) {
      doc.moveDown(0.3);
      body(report.ai_summary);
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

    // 13. Specifications & equipment
    const sp = report.specifications;
    if (sp && sp.groups.length) {
      const GROUP: Record<string, string> = {
        identity: "Identity",
        engine: "Engine",
        drivetrain: "Drivetrain",
        manufacture: "Manufacture",
        safety: "Safety equipment",
      };
      const humanize = (k: string) =>
        k.replace(/_/g, " ").replace(/^\w/, (c) => c.toUpperCase());
      h1("13. Specifications & equipment");
      muted(`Source: ${sp.source}`);
      sp.groups.forEach((g) => {
        doc.moveDown(0.2);
        doc.fontSize(10).font("Helvetica-Bold").fillColor("#111").text(GROUP[g.group] ?? g.group);
        g.items.forEach((it) => body(`${humanize(it.key)}: ${it.value}`));
      });
    }

    // 14. Mileage consistency
    const mc = report.mileage_check;
    if (mc && mc.status !== "unknown") {
      const STATUS: Record<string, string> = {
        ok: "Mileage looks consistent",
        attention: "Worth checking",
        suspicious: "Possible odometer issue",
        unknown: "Not enough data",
      };
      const FLAG: Record<string, string> = {
        very_low_for_age: "Unusually low for the vehicle's age — verify the odometer.",
        very_high: "Very high yearly usage — expect more wear.",
        rollback_records: "An odometer record is lower than a previous one — strong rollback signal.",
      };
      h1("14. Mileage consistency");
      body(`Status: ${STATUS[mc.status] ?? mc.status}`);
      if (mc.avg_per_year != null) muted(`${mc.avg_per_year.toLocaleString()} ${mc.unit}/yr`);
      mc.flags.forEach((f) => body(`• ${FLAG[f] ?? f}`));
    }

    // 15. Safety rating (NHTSA NCAP)
    const sr = report.safety;
    if (sr) {
      h1("15. Safety rating");
      muted(`Source: ${sr.source} · ${sr.vehicle}`);
      [
        ["Overall", sr.overall],
        ["Frontal", sr.frontal],
        ["Side", sr.side],
        ["Rollover", sr.rollover],
      ].forEach(([label, val]) => {
        if (val) body(`${label}: ${val}/5`);
      });
      doc.fontSize(8).font("Helvetica-Oblique").fillColor(MUTED).text(
        "Official crash-test ratings (out of 5). EU coverage coming soon.",
      ).fillColor("#111");
    }

    // 16. Title & damage flags (NMVTIS)
    const tf = report.title_flags;
    if (tf && tf.checked) {
      const FLAG: Record<string, string> = {
        salvage: "Salvage",
        total_loss: "Total loss",
        flood: "Flood damage",
        fire: "Fire damage",
        hail: "Hail damage",
        theft: "Theft record",
        junk: "Junk",
        lemon: "Lemon / buyback",
        rebuilt: "Rebuilt",
        odometer: "Odometer brand",
        disaster: "Natural disaster",
        damage: "Damage record",
      };
      h1("16. Title & damage flags");
      muted(`Source: ${tf.source}`);
      if (tf.clean) {
        body("No adverse title brand found on the available record.");
      } else {
        tf.flags.forEach((f) => body(`• ${FLAG[f.category] ?? f.category}: ${f.detail}`));
      }
    }

    // 17. Market value (heuristic estimate)
    const mv = report.market_value;
    if (mv) {
      const VERDICT: Record<string, string> = {
        underpriced: "Below market — looks like a good deal (verify why)",
        fair: "In line with the market for the age & mileage",
        overpriced: "Above market for the age & mileage — room to negotiate",
        unknown: "",
      };
      h1("17. Market value (estimate)");
      body(`Asking price: ${formatMoney(mv.asking_price, mv.currency)}`);
      if (mv.estimated_low != null && mv.estimated_high != null) {
        body(
          `Estimated fair range: ${formatMoney(mv.estimated_low, mv.currency)} – ${formatMoney(mv.estimated_high, mv.currency)}`,
        );
      }
      if (VERDICT[mv.verdict]) body(VERDICT[mv.verdict]);
      doc.fontSize(8).font("Helvetica-Oblique").fillColor(MUTED).text(
        "Heuristic estimate (asking price adjusted for age & mileage) — not an official valuation.",
      ).fillColor("#111");
    }

    // Disclaimer
    doc.moveDown(0.8);
    doc.fontSize(8).font("Helvetica-Oblique").fillColor(MUTED).text(report.disclaimer);

    doc.end();
  });
}
