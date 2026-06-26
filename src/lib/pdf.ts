// =====================================================================
// CarGuard AI — Premium server-side PDF (pdfkit, no browser needed)
// Renders a FinalReport into a branded, card-based A4 report:
// logo header, executive summary bar, numbered sections, score ring +
// bars, badges, photo grid, mechanical checklist and a footer on every
// page. Built-in Helvetica fonts only (works in serverless Node).
// =====================================================================

import fs from "node:fs";
import path from "node:path";
import PDFDocument from "pdfkit";
import type { FinalReport } from "@/types";
import { vehicleLabel } from "@/lib/utils";
import { formatMoney, formatDistance } from "@/lib/i18n";
import { ENGINE_SOUND_LABELS } from "@/lib/constants";

// ---- Brand palette --------------------------------------------------
const RED = "#D90416";
const RED_DEEP = "#9F000D";
const RED_BRIGHT = "#FF1F2D";
const RED_BG = "#FFF1F2";
const INK = "#111827";
const GREY = "#6B7280";
const GREY_LIGHT = "#F3F4F6";
const BORDER = "#E5E7EB";
const GREEN = "#16A34A";
const ORANGE = "#F59E0B";
const DANGER = "#DC2626";
const SLATE = "#334155";
const WHITE = "#FFFFFF";

// ---- Page geometry --------------------------------------------------
const PAGE_W = 595.28;
const PAGE_H = 841.89;
const M = 36;
const CW = PAGE_W - M * 2;
const FOOTER_H = 30;
const BOTTOM = PAGE_H - M - FOOTER_H;

// Load the brand logo once (bundled via next.config outputFileTracingIncludes).
let LOGO: Buffer | null = null;
try {
  LOGO = fs.readFileSync(path.join(process.cwd(), "public", "logo.png"));
} catch {
  LOGO = null;
}

function scoreColor(v: number | null | undefined): string {
  const n = v ?? 0;
  if (n >= 85) return GREEN;
  if (n >= 65) return ORANGE;
  return DANGER;
}

function riskColor(level: string): string {
  switch (level) {
    case "low":
      return GREEN;
    case "moderate":
      return ORANGE;
    case "high":
      return DANGER;
    case "very_high":
      return RED_DEEP;
    default:
      return SLATE;
  }
}

// Strip replacement / control characters that occasionally come from VIN
// decoders so they never show as tofu boxes in the PDF.
function clean(s: unknown): string {
  return String(s ?? "")
    // eslint-disable-next-line no-control-regex
    .replace(/[\u0000-\u001F\u007F-\u009F\uFFFD]/g, "")
    .trim();
}

const humanize = (k: string) =>
  k.replace(/_/g, " ").replace(/^\w/, (c) => c.toUpperCase());

type Block = {
  measure: (w: number) => number;
  draw: (doc: PDFKit.PDFDocument, x: number, y: number, w: number) => void;
};

export function buildReportPdf(report: FinalReport): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: "A4", margin: M, bufferPages: true });
    const chunks: Buffer[] = [];
    doc.on("data", (c: Buffer) => chunks.push(c));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    let y = M;
    let section = 0;

    const ensure = (h: number) => {
      if (y + h > BOTTOM) {
        doc.addPage();
        y = M;
      }
    };

    // ---- Low-level drawing helpers --------------------------------
    function shadowCard(yy: number, h: number, bg = WHITE, border = BORDER) {
      doc.save();
      doc.fillOpacity(0.05).fillColor("#000000");
      doc.roundedRect(M + 2, yy + 3, CW - 4, h, 12).fill();
      doc.restore();
      doc.roundedRect(M, yy, CW, h, 12).fillColor(bg).fill();
      doc.lineWidth(1).strokeColor(border).roundedRect(M, yy, CW, h, 12).stroke();
    }

    function sectionHeader(title: string) {
      const b = 22;
      const n = ++section;
      doc.roundedRect(M, y, b, b, 6).fillColor(RED).fill();
      doc
        .fillColor(WHITE)
        .font("Helvetica-Bold")
        .fontSize(12)
        .text(String(n), M, y + 5.5, { width: b, align: "center" });
      doc
        .fillColor(INK)
        .font("Helvetica-Bold")
        .fontSize(13)
        .text(title, M + b + 10, y + 4.5, { width: CW - b - 10 });
      y += b + 8;
    }

    function badge(x: number, yy: number, text: string, bg: string, fg = WHITE): number {
      doc.font("Helvetica-Bold").fontSize(8.5);
      const tw = doc.widthOfString(text);
      const w = tw + 14;
      doc.roundedRect(x, yy, w, 16, 8).fillColor(bg).fill();
      doc.fillColor(fg).text(text, x + 7, yy + 4);
      return w;
    }

    function drawCheck(cx: number, cy: number, r: number, color: string) {
      doc.circle(cx, cy, r).fillColor(color).fill();
      doc
        .lineWidth(1.5)
        .strokeColor(WHITE)
        .moveTo(cx - r * 0.45, cy + r * 0.02)
        .lineTo(cx - r * 0.08, cy + r * 0.4)
        .lineTo(cx + r * 0.5, cy - r * 0.4)
        .stroke();
    }

    function drawWarn(cx: number, cy: number, r: number) {
      doc.circle(cx, cy, r).fillColor(ORANGE).fill();
      doc
        .fillColor(WHITE)
        .font("Helvetica-Bold")
        .fontSize(r * 1.25)
        .text("!", cx - r * 0.22, cy - r * 0.72);
    }

    // ---- Block factories ------------------------------------------
    const tBlock = (
      text: string,
      o: { size?: number; font?: string; color?: string; after?: number } = {},
    ): Block => {
      const size = o.size ?? 10;
      const font = o.font ?? "Helvetica";
      const color = o.color ?? INK;
      const after = o.after ?? 5;
      const txt = clean(text);
      return {
        measure(w) {
          if (!txt) return after;
          doc.font(font).fontSize(size);
          return doc.heightOfString(txt, { width: w, lineGap: 1.5 }) + after;
        },
        draw(d, x, yy, w) {
          if (!txt) return;
          d.font(font).fontSize(size).fillColor(color).text(txt, x, yy, { width: w, lineGap: 1.5 });
        },
      };
    };

    const bulletBlock = (items: string[], empty = "None."): Block => {
      const list = (items ?? []).map(clean).filter(Boolean);
      return {
        measure(w) {
          doc.font("Helvetica").fontSize(10);
          if (!list.length) return doc.heightOfString(empty, { width: w }) + 4;
          let h = 0;
          for (const it of list) h += doc.heightOfString(it, { width: w - 16 }) + 6;
          return h + 2;
        },
        draw(d, x, yy, w) {
          d.font("Helvetica").fontSize(10);
          if (!list.length) {
            d.fillColor(GREY).text(empty, x, yy, { width: w });
            return;
          }
          let ly = yy;
          for (const it of list) {
            const hh = d.heightOfString(it, { width: w - 16 });
            d.circle(x + 3, ly + 5.5, 1.8).fillColor(RED).fill();
            d.fillColor(INK).font("Helvetica").fontSize(10).text(it, x + 14, ly, { width: w - 16 });
            ly += hh + 6;
          }
        },
      };
    };

    const statusListBlock = (items: string[], kind: "good" | "warn", empty: string): Block => {
      const list = (items ?? []).map(clean).filter(Boolean);
      return {
        measure(w) {
          doc.font("Helvetica").fontSize(10);
          if (!list.length) return doc.heightOfString(empty, { width: w }) + 4;
          let h = 0;
          for (const it of list) h += Math.max(18, doc.heightOfString(it, { width: w - 26 })) + 8;
          return h;
        },
        draw(d, x, yy, w) {
          d.font("Helvetica").fontSize(10);
          if (!list.length) {
            d.fillColor(GREY).text(empty, x, yy, { width: w });
            return;
          }
          let ly = yy;
          for (const it of list) {
            const hh = Math.max(18, d.heightOfString(it, { width: w - 26 }));
            if (kind === "good") drawCheck(x + 7, ly + 6, 7, GREEN);
            else drawWarn(x + 7, ly + 6, 7);
            d.fillColor(INK).font("Helvetica").fontSize(10).text(it, x + 24, ly, { width: w - 26 });
            ly += hh + 8;
          }
        },
      };
    };

    // Render a numbered section made of stacked blocks inside a card.
    function cardSection(title: string, blocks: Block[], opts: { bg?: string; border?: string } = {}) {
      const innerW = CW - 24;
      const contentH = blocks.reduce((a, b) => a + b.measure(innerW), 0);
      const cardH = contentH + 24;
      ensure(30 + cardH + 10);
      sectionHeader(title);
      shadowCard(y, cardH, opts.bg, opts.border);
      let ly = y + 12;
      for (const b of blocks) {
        b.draw(doc, M + 12, ly, innerW);
        ly += b.measure(innerW);
      }
      y += cardH + 12;
    }

    // =================================================================
    // HEADER
    // =================================================================
    {
      const lh = 44;
      if (LOGO) {
        try {
          doc.image(LOGO, M, y, { fit: [lh, lh] });
        } catch {
          /* ignore — wordmark still shows */
        }
      }
      const tx = M + (LOGO ? lh + 12 : 0);
      doc
        .font("Helvetica-Bold")
        .fontSize(22)
        .fillColor(RED)
        .text("CarGuard ", tx, y + 2, { continued: true })
        .fillColor(SLATE)
        .text("AI");
      doc
        .font("Helvetica")
        .fontSize(9)
        .fillColor(GREY)
        .text("INSPECTION REPORT", tx, y + 28, { characterSpacing: 2 });

      // Date / time box (right).
      const gen = new Date(report.generated_at);
      const boxW = 170;
      const bx = PAGE_W - M - boxW;
      doc.font("Helvetica").fontSize(8).fillColor(GREY).text("GENERATED", bx, y + 2, { width: boxW, align: "right", characterSpacing: 1 });
      doc
        .font("Helvetica-Bold")
        .fontSize(11)
        .fillColor(INK)
        .text(
          gen.toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" }),
          bx,
          y + 14,
          { width: boxW, align: "right" },
        );
      doc
        .font("Helvetica")
        .fontSize(9)
        .fillColor(GREY)
        .text(gen.toLocaleTimeString(), bx, y + 28, { width: boxW, align: "right" });

      // Metallic red rule.
      const gy = y + lh + 6;
      const grad = doc.linearGradient(M, gy, M + CW, gy);
      grad.stop(0, RED_DEEP).stop(0.5, RED).stop(1, RED_BRIGHT);
      doc.roundedRect(M, gy, CW, 4, 2).fill(grad);
      y = gy + 16;
    }

    // =================================================================
    // EXECUTIVE SUMMARY BAR
    // =================================================================
    {
      const h = 64;
      ensure(h + 12);
      const grad = doc.linearGradient(M, y, M + CW, y);
      grad.stop(0, RED_DEEP).stop(1, RED);
      doc.roundedRect(M, y, CW, h, 12).fill(grad);

      const passed = report.summary.photos_analyzed;
      const cells: { label: string; value: string; dot?: string }[] = [
        { label: "PHOTOS ANALYZED", value: `${passed} of ${report.summary.photos_analyzed} passed QC` },
        {
          label: "RISK LEVEL",
          value: report.summary.risk_level.replace("_", " ").toUpperCase(),
          dot: riskColor(report.summary.risk_level),
        },
        { label: "RECOMMENDATION", value: humanize(report.summary.recommendation) },
      ];
      const colW = CW / cells.length;
      cells.forEach((c, i) => {
        const cx = M + colW * i + 14;
        const cw = colW - 20;
        if (i > 0) {
          doc
            .save()
            .fillOpacity(0.25)
            .strokeColor(WHITE)
            .lineWidth(1)
            .moveTo(M + colW * i, y + 12)
            .lineTo(M + colW * i, y + h - 12)
            .stroke()
            .restore();
        }
        doc.font("Helvetica").fontSize(7.5).fillColor(WHITE).fillOpacity(0.85);
        doc.text(c.label, cx, y + 14, { width: cw, characterSpacing: 0.5 });
        doc.fillOpacity(1);
        let vx = cx;
        if (c.dot) {
          doc.circle(cx + 4, y + 38, 4).fillColor(c.dot).fill();
          vx = cx + 14;
        }
        doc.font("Helvetica-Bold").fontSize(12).fillColor(WHITE).text(c.value, vx, y + 30, { width: cw - (c.dot ? 14 : 0) });
      });
      y += h + 14;
    }

    // =================================================================
    // 1. VEHICLE INFORMATION
    // =================================================================
    {
      const v = report.vehicle;
      const rows: [string, string][] = [
        ["Mileage", formatDistance(v.mileage ?? null, v.currency)],
        ["Asking price", formatMoney(v.asking_price ?? null, v.currency ?? "USD")],
        ["Seller", clean(v.seller_type) || "—"],
        ["VIN", clean(v.vin) || "—"],
      ];
      const block: Block = {
        measure: () => 22 + 2 * 30,
        draw: (d, x, yy, w) => {
          d.font("Helvetica-Bold").fontSize(15).fillColor(INK).text(clean(vehicleLabel(v)), x, yy, { width: w });
          const gy = yy + 24;
          const colW = w / 2;
          rows.forEach((r, i) => {
            const rx = x + (i % 2) * colW;
            const ry = gy + Math.floor(i / 2) * 30;
            d.font("Helvetica").fontSize(8).fillColor(GREY).text(r[0].toUpperCase(), rx, ry, { characterSpacing: 0.5 });
            d.font("Helvetica-Bold").fontSize(11).fillColor(INK).text(r[1], rx, ry + 11, { width: colW - 10 });
          });
        },
      };
      cardSection("Vehicle information", [block]);
    }

    // =================================================================
    // 2. INSPECTION SUMMARY
    // =================================================================
    {
      const sm = report.summary;
      const badgesBlock: Block = {
        measure: () => 24,
        draw: (d, x, yy) => {
          let bx = x;
          bx += badge(bx, yy, `RISK: ${sm.risk_level.replace("_", " ").toUpperCase()}`, riskColor(sm.risk_level)) + 6;
          bx += badge(bx, yy, humanize(sm.recommendation), SLATE) + 6;
          if (sm.confidence != null) badge(bx, yy, `AI CONFIDENCE ${sm.confidence}%`, RED);
        },
      };
      const blocks: Block[] = [
        tBlock(`Photos analyzed: ${sm.photos_analyzed}  ·  ${clean(sm.photo_quality_summary)}`, { color: SLATE, size: 9.5 }),
        badgesBlock,
        tBlock(report.ai_summary || "", { color: INK }),
      ];
      cardSection("Inspection summary", blocks);
    }

    // =================================================================
    // 3. SCORES  (custom: ring + bars)
    // =================================================================
    {
      const s = report.scores;
      const bars: [string, number][] = [
        ["Accident / repair", s.accident_repair_score],
        ["Alignment", s.alignment_score],
        ["Paint / tone", s.paint_tone_score],
        ["Symmetry", s.symmetry_score],
        ["Bumpers / lights", s.bumpers_lights_score],
        ["Overall consistency", s.overall_consistency_score],
        ...(s.mechanical_score != null ? ([["Engine & mechanical", s.mechanical_score]] as [string, number][]) : []),
        ["Model risk", s.model_risk_score],
      ];
      const cardH = Math.max(150, bars.length * 17 + 40);
      ensure(30 + cardH + 10);
      sectionHeader("Scores");
      shadowCard(y, cardH);

      // Ring (left).
      const cx = M + 64;
      const cy = y + 64;
      const r = 40;
      doc.lineWidth(9).strokeColor(GREY_LIGHT).circle(cx, cy, r).stroke();
      doc.lineWidth(9).strokeColor(scoreColor(s.global_score)).circle(cx, cy, r).stroke();
      doc.fillColor(INK).font("Helvetica-Bold").fontSize(26).text(String(s.global_score), cx - 34, cy - 17, { width: 68, align: "center" });
      doc.fillColor(GREY).font("Helvetica").fontSize(8).text("/100", cx - 34, cy + 11, { width: 68, align: "center" });
      doc.fillColor(SLATE).font("Helvetica-Bold").fontSize(8).text("GLOBAL SCORE", cx - 45, cy + r + 8, { width: 90, align: "center", characterSpacing: 0.5 });

      // Bars (right).
      const bx = M + 140;
      const bw = CW - 140 - 16;
      let by = y + 16;
      for (const [label, val] of bars) {
        doc.font("Helvetica").fontSize(8.5).fillColor(SLATE).text(label, bx, by + 1, { width: 120 });
        const trackX = bx + 124;
        const trackW = bw - 124 - 32;
        doc.roundedRect(trackX, by + 3, trackW, 6, 3).fillColor(GREY_LIGHT).fill();
        doc.roundedRect(trackX, by + 3, Math.max(2, trackW * (Math.min(100, val) / 100)), 6, 3).fillColor(scoreColor(val)).fill();
        doc.font("Helvetica-Bold").fontSize(8.5).fillColor(INK).text(`${val}`, trackX + trackW + 4, by + 1, { width: 28, align: "right" });
        by += 17;
      }
      doc.font("Helvetica-Oblique").fontSize(7.5).fillColor(GREY).text("Scores are safer when higher.", bx, by + 2);
      y += cardH + 12;
    }

    // =================================================================
    // 4 + 5. POSITIVE / SUSPICIOUS POINTS
    // =================================================================
    cardSection("Positive points", [
      statusListBlock(report.positive_points, "good", "No specific positive point recorded."),
    ]);
    cardSection("Suspicious points", [
      statusListBlock(report.suspicious_points, "warn", "No suspicious point detected."),
    ]);

    // =================================================================
    // 6. PHOTO-BY-PHOTO ANALYSIS  (custom 2-col grid)
    // =================================================================
    {
      ensure(40);
      sectionHeader("Photo-by-photo analysis");
      const photos = report.photo_analysis ?? [];
      const colW = (CW - 12) / 2;
      const cardH = 104;
      for (let i = 0; i < photos.length; i += 2) {
        ensure(cardH + 10);
        for (let j = 0; j < 2; j++) {
          const p = photos[i + j];
          if (!p) continue;
          const x = M + j * (colW + 12);
          doc.roundedRect(x, y, colW, cardH, 12).fillColor(WHITE).fill();
          doc.lineWidth(1).strokeColor(BORDER).roundedRect(x, y, colW, cardH, 12).stroke();
          // number badge
          doc.roundedRect(x + 10, y + 10, 18, 18, 5).fillColor(RED).fill();
          doc.fillColor(WHITE).font("Helvetica-Bold").fontSize(10).text(String(i + j + 1), x + 10, y + 14, { width: 18, align: "center" });
          doc.fillColor(INK).font("Helvetica-Bold").fontSize(10).text(clean(p.title), x + 34, y + 13, { width: colW - 44 });
          doc.fillColor(GREY).font("Helvetica").fontSize(7.5).text(`Quality ${p.quality_score ?? "—"}  ·  Risk ${p.risk_score ?? "—"}  ·  Conf ${p.confidence ?? "—"}`, x + 34, y + 26);
          // observations (truncated to fit)
          const obs = (p.observations ?? []).map(clean).filter(Boolean).slice(0, 3);
          let ly = y + 40;
          doc.font("Helvetica").fontSize(8).fillColor(SLATE);
          for (const o of obs) {
            const hh = doc.heightOfString(o, { width: colW - 30 });
            if (ly + hh > y + cardH - 8) break;
            doc.circle(x + 13, ly + 4, 1.4).fillColor(RED).fill();
            doc.fillColor(SLATE).font("Helvetica").fontSize(8).text(o, x + 20, ly, { width: colW - 30, lineGap: 0.5, height: 22, ellipsis: true });
            ly += hh + 3;
          }
        }
        y += cardH + 10;
      }
      if (!photos.length) {
        ensure(40);
        shadowCard(y, 34);
        doc.fillColor(GREY).font("Helvetica").fontSize(10).text("No photo analysis available.", M + 12, y + 12);
        y += 46;
      }
    }

    // =================================================================
    // 7 + 8 + 9. QUESTIONS / NEGOTIATION / NEXT STEPS
    // =================================================================
    cardSection("Questions to ask the seller", [bulletBlock(report.questions_to_ask_seller)]);
    cardSection("Negotiation arguments", [bulletBlock(report.negotiation_arguments)], {
      bg: RED_BG,
      border: "#FBD5D8",
    });
    cardSection("Recommended next steps", [bulletBlock(report.recommended_next_steps)]);

    // =================================================================
    // 10. ENGINE START AUDIO ANALYSIS
    // =================================================================
    {
      const ea = report.engine_audio;
      if (!ea) {
        cardSection("Engine start audio analysis", [
          tBlock("Not provided", { font: "Helvetica-Bold", color: SLATE, after: 4 }),
          tBlock("No engine start audio was provided for this inspection.", { color: GREY }),
        ], { bg: GREY_LIGHT });
      } else {
        const blocks: Block[] = [
          {
            measure: () => 24,
            draw: (d, x, yy) => {
              let bx = x;
              bx += badge(bx, yy, `RISK: ${ea.risk_level.replace("_", " ").toUpperCase()}`, riskColor(ea.risk_level)) + 6;
              bx += badge(bx, yy, `Audio score ${ea.engine_audio_score ?? "—"}/100`, SLATE) + 6;
              badge(bx, yy, `Quality ${ea.audio_quality_score ?? "—"}/100`, RED);
            },
          },
          tBlock(ea.summary, {}),
          ...(ea.detected_sounds ?? []).map((s) =>
            tBlock(`• [${s.severity}, ${s.confidence}%] ${ENGINE_SOUND_LABELS[s.sound_type] ?? s.sound_type}: ${s.explanation}`, { size: 9, color: SLATE, after: 3 }),
          ),
          tBlock(ea.disclaimer, { size: 7.5, font: "Helvetica-Oblique", color: GREY }),
        ];
        cardSection("Engine start audio analysis", blocks);
      }
    }

    // =================================================================
    // 11. ENGINE & MECHANICAL CHECK  (custom checklist)
    // =================================================================
    {
      const me = report.mechanical;
      ensure(40);
      sectionHeader("Engine & mechanical check");
      if (!me) {
        shadowCard(y, 34);
        doc.fillColor(GREY).font("Helvetica").fontSize(10).text("No engine & mechanical check was performed for this inspection.", M + 12, y + 12);
        y += 46;
      } else {
        const items = me.items ?? [];
        const rows = Math.ceil(items.length / 2);
        const headH = 44;
        const listH = rows * 22 + 10;
        const discH = 24;
        const cardH = headH + listH + discH;
        ensure(cardH + 10);
        shadowCard(y, cardH);
        // header line
        badge(M + 12, y + 12, `RISK: ${me.risk_level.replace("_", " ").toUpperCase()}`, riskColor(me.risk_level));
        doc.fillColor(INK).font("Helvetica-Bold").fontSize(12).text(`Mechanical score: ${me.mechanical_score}/100`, M + 120, y + 11);
        doc.fillColor(GREY).font("Helvetica").fontSize(8.5).text(clean(me.summary), M + 12, y + 30, { width: CW - 24, height: 12, ellipsis: true });
        // checklist 2-col
        const colW = (CW - 24) / 2;
        items.forEach((it, idx) => {
          const cx = M + 12 + (idx % 2) * colW;
          const cy2 = y + headH + Math.floor(idx / 2) * 22;
          const ok = (it.score ?? 0) >= 90;
          if (ok) drawCheck(cx + 6, cy2 + 6, 6, GREEN);
          else drawWarn(cx + 6, cy2 + 6, 6);
          doc.fillColor(INK).font("Helvetica").fontSize(8.5).text(`${clean(it.title)} — ${it.score ?? "—"}/100`, cx + 18, cy2 + 1.5, { width: colW - 24, height: 12, ellipsis: true });
        });
        doc.fillColor(GREY).font("Helvetica-Oblique").fontSize(7.5).text(clean(me.disclaimer), M + 12, y + headH + listH, { width: CW - 24, height: 20, ellipsis: true });
        y += cardH + 12;
      }
    }

    // =================================================================
    // 12. VEHICLE HISTORY
    // =================================================================
    {
      const vh = report.vehicle_history;
      if (vh) {
        const blocks: Block[] = [
          {
            measure: () => 24,
            draw: (d, x, yy) => {
              let bx = x;
              bx += badge(bx, yy, clean(vh.source), SLATE) + 6;
              badge(bx, yy, vh.recall_count > 0 ? `${vh.recall_count} recall(s)` : "No recalls found", vh.recall_count > 0 ? ORANGE : GREEN);
            },
          },
          tBlock(`${clean(vh.vehicle)}`, { font: "Helvetica-Bold", size: 10, after: 3 }),
          tBlock(vh.note, { color: SLATE, size: 9.5 }),
          ...(vh.recalls ?? []).slice(0, 6).map((r) =>
            tBlock(`• [${clean(r.campaign)}] ${clean(r.component)}: ${clean(r.summary)}`, { size: 9, color: SLATE, after: 3 }),
          ),
          ...(vh.complaints_count > 0
            ? [tBlock(`${vh.complaints_count} consumer complaint(s). Most reported: ${(vh.top_complaint_components ?? []).join(", ") || "—"}.`, { size: 9, color: SLATE })]
            : []),
          tBlock(vh.disclaimer, { size: 7.5, font: "Helvetica-Oblique", color: GREY }),
        ];
        cardSection("Vehicle history (recalls & complaints)", blocks);
      }
    }

    // =================================================================
    // 13. SPECIFICATIONS & EQUIPMENT
    // =================================================================
    {
      const sp = report.specifications;
      if (sp && sp.groups.length) {
        const GROUP: Record<string, string> = {
          identity: "Identity",
          engine: "Engine",
          drivetrain: "Drivetrain",
          manufacture: "Manufacture",
          safety: "Safety equipment",
        };
        const blocks: Block[] = [tBlock(`Source: ${clean(sp.source)}`, { size: 8, color: GREY, after: 4 })];
        for (const g of sp.groups) {
          blocks.push(tBlock(GROUP[g.group] ?? humanize(g.group), { font: "Helvetica-Bold", size: 10, color: RED, after: 3 }));
          const pairs = g.items.map((it) => `${humanize(it.key)}: ${clean(it.value)}`).filter((s) => clean(s).length > 0);
          // two-column grid block
          blocks.push({
            measure: () => Math.ceil(pairs.length / 2) * 15 + 4,
            draw: (d, x, yy, w) => {
              const colW = w / 2;
              pairs.forEach((p, i) => {
                const rx = x + (i % 2) * colW;
                const ry = yy + Math.floor(i / 2) * 15;
                d.font("Helvetica").fontSize(8.5).fillColor(SLATE).text(p, rx, ry, { width: colW - 8, height: 12, ellipsis: true });
              });
            },
          });
        }
        cardSection("Specifications & equipment", blocks);
      }
    }

    // =================================================================
    // 14. MILEAGE CONSISTENCY
    // =================================================================
    {
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
        const okStatus = mc.status === "ok";
        const blocks: Block[] = [
          {
            measure: () => 24,
            draw: (d, x, yy) => {
              let bx = x;
              bx += badge(bx, yy, STATUS[mc.status] ?? mc.status, okStatus ? GREEN : ORANGE) + 6;
              if (mc.avg_per_year != null) badge(bx, yy, `${mc.avg_per_year.toLocaleString()} ${mc.unit}/yr`, SLATE);
            },
          },
          ...mc.flags.map((f) => tBlock(`• ${FLAG[f] ?? f}`, { size: 9, color: SLATE, after: 3 })),
        ];
        cardSection("Mileage consistency", blocks);
      }
    }

    // =================================================================
    // 15. SAFETY RATING
    // =================================================================
    {
      const sr = report.safety;
      if (sr) {
        const ratings: [string, string | null | undefined][] = [
          ["Overall", sr.overall],
          ["Frontal", sr.frontal],
          ["Side", sr.side],
          ["Rollover", sr.rollover],
        ];
        const blocks: Block[] = [
          tBlock(`Source: ${clean(sr.source)} · ${clean(sr.vehicle)}`, { size: 8, color: GREY, after: 4 }),
          {
            measure: () => 20,
            draw: (d, x, yy) => {
              let bx = x;
              for (const [label, val] of ratings) {
                if (!val) continue;
                bx += badge(bx, yy, `${label}: ${val}/5`, Number(val) >= 4 ? GREEN : ORANGE) + 6;
              }
            },
          },
          tBlock("Official crash-test ratings (out of 5). EU coverage coming soon.", { size: 7.5, font: "Helvetica-Oblique", color: GREY }),
        ];
        cardSection("Safety rating", blocks);
      }
    }

    // =================================================================
    // 16. TITLE & DAMAGE FLAGS
    // =================================================================
    {
      const tf = report.title_flags;
      if (tf && tf.checked) {
        const FLAG: Record<string, string> = {
          salvage: "Salvage", total_loss: "Total loss", flood: "Flood damage", fire: "Fire damage",
          hail: "Hail damage", theft: "Theft record", pledge: "Pledge / lien (gage)",
          opposition: "Administrative hold (opposition)", junk: "Junk", lemon: "Lemon / buyback",
          rebuilt: "Rebuilt", odometer: "Odometer brand", disaster: "Natural disaster", damage: "Damage record",
        };
        const blocks: Block[] = [
          tBlock(`Source: ${clean(tf.source)}`, { size: 8, color: GREY, after: 4 }),
          tf.clean
            ? statusListBlock(["No adverse title brand found on the available record."], "good", "")
            : statusListBlock(tf.flags.map((f) => `${FLAG[f.category] ?? f.category}: ${clean(f.detail)}`), "warn", ""),
        ];
        cardSection("Title & damage flags", blocks);
      }
    }

    // =================================================================
    // 17. MARKET VALUE ESTIMATE
    // =================================================================
    {
      const mv = report.market_value;
      if (mv) {
        const VERDICT: Record<string, string> = {
          underpriced: "Below market — looks like a good deal (verify why)",
          fair: "In line with the market for the age & mileage",
          overpriced: "Above market for the age & mileage — room to negotiate",
          unknown: "",
        };
        const blocks: Block[] = [
          {
            measure: () => 40,
            draw: (d, x, yy, w) => {
              d.font("Helvetica").fontSize(8).fillColor(GREY).text("ASKING PRICE", x, yy, { characterSpacing: 0.5 });
              d.font("Helvetica-Bold").fontSize(20).fillColor(INK).text(formatMoney(mv.asking_price, mv.currency), x, yy + 11);
              if (mv.estimated_low != null && mv.estimated_high != null) {
                badge(x + 150, yy + 16, `Fair range: ${formatMoney(mv.estimated_low, mv.currency)} – ${formatMoney(mv.estimated_high, mv.currency)}`, SLATE);
              }
              void w;
            },
          },
          ...(VERDICT[mv.verdict]
            ? [tBlock(VERDICT[mv.verdict], { font: "Helvetica-Bold", color: mv.verdict === "overpriced" ? ORANGE : INK, size: 10 })]
            : []),
          tBlock("Heuristic estimate (asking price adjusted for age & mileage) — not an official valuation.", { size: 7.5, font: "Helvetica-Oblique", color: GREY }),
        ];
        cardSection("Market value estimate", blocks, { bg: RED_BG, border: "#FBD5D8" });
      }
    }

    // =================================================================
    // 18. SUPPORTING DOCUMENTS  (checklist)
    // =================================================================
    {
      const dq = report.documents;
      if (dq) {
        const LABEL: Record<string, string> = {
          registration: "Registration / title", maintenance: "Maintenance records",
          technical_inspection: "Technical inspection (MOT/CT)", history_report: "Vehicle history report",
          purchase_invoice: "Purchase invoice", emissions: "Emissions / smog certificate",
          insurance: "Insurance certificate", non_pledge: "Certificate of non-pledge",
          odometer_disclosure: "Odometer disclosure",
        };
        const items = dq.items ?? [];
        const blocks: Block[] = [
          tBlock(`${dq.provided_count}/${dq.relevant_count} provided  ·  ${dq.key_provided}/${dq.key_total} key documents`, { font: "Helvetica-Bold", size: 9.5, color: SLATE, after: 6 }),
          {
            measure: () => Math.ceil(items.length / 2) * 20,
            draw: (d, x, yy, w) => {
              const colW = w / 2;
              items.forEach((it, i) => {
                const rx = x + (i % 2) * colW;
                const ry = yy + Math.floor(i / 2) * 20;
                if (it.provided) drawCheck(rx + 6, ry + 6, 6, GREEN);
                else {
                  d.circle(rx + 6, ry + 6, 6).lineWidth(1).strokeColor(BORDER).stroke();
                }
                d.fillColor(it.provided ? INK : GREY).font("Helvetica").fontSize(8.5)
                  .text(`${LABEL[it.doc_type] ?? it.doc_type}${it.key ? "  (key)" : ""}`, rx + 18, ry + 1.5, { width: colW - 24, height: 12, ellipsis: true });
              });
            },
          },
        ];
        cardSection("Supporting documents", blocks);
      }
    }

    // =================================================================
    // FOOTER on every page (buffered)
    // =================================================================
    const range = doc.bufferedPageRange();
    for (let i = range.start; i < range.start + range.count; i++) {
      doc.switchToPage(i);
      const fy = PAGE_H - M - 18;
      doc.lineWidth(0.5).strokeColor(BORDER).moveTo(M, fy).lineTo(M + CW, fy).stroke();
      doc.font("Helvetica-Bold").fontSize(7).fillColor(RED).text("CarGuard AI", M, fy + 5);
      doc.font("Helvetica").fontSize(6.5).fillColor(GREY).text(
        clean(report.disclaimer) ||
          "This report is based only on the information provided. CarGuard AI is not a certified mechanic, body-shop expert, legal advisor or vehicle-history provider, and does not replace a professional inspection.",
        M + 60,
        fy + 5,
        { width: CW - 110, height: 12, ellipsis: true },
      );
      doc.font("Helvetica").fontSize(7).fillColor(GREY).text(`${i - range.start + 1} / ${range.count}`, M + CW - 40, fy + 5, { width: 40, align: "right" });
    }

    doc.end();
  });
}
