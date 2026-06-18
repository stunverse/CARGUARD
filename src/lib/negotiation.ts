// =====================================================================
// CarGuard AI — Negotiation toolkit builder
//
// Turns the inspection into concrete, costed price-reduction levers. This is
// a major conversion lever, so it is DETERMINISTIC and ALWAYS returns useful
// arguments: evidence-based levers first (repaint, mechanical, recalls, high
// mileage, overpricing, missing records…), topped up with honest baseline
// levers (wear provision, upcoming service, transfer/negotiation margin) that
// apply to any used car. The total saving is bounded to a realistic
// [200, 1000] band, capped at a sensible fraction of the asking price.
// =====================================================================

import { formatMoney, type Locale } from "@/lib/i18n";
import type {
  DocumentsSection,
  EngineAudioReportSection,
  FinalReport,
  MarketValueSection,
  MechanicalReportSection,
  NegotiationCategory,
  NegotiationLever,
  NegotiationSection,
  VehicleHistorySection,
  MileageCheckSection,
  Vehicle,
} from "@/types";

const MIN_TOTAL = 200;
const MAX_TOTAL = 1000;
// Never argue away more than this share of the asking price (keeps it credible).
const MAX_ASKING_SHARE = 0.4;

// Base [low, high] reduction per lever category (in the vehicle's currency).
const BASE: Record<NegotiationCategory, [number, number]> = {
  repaint: [150, 400],
  alignment: [100, 280],
  bodywork: [120, 350],
  mechanical: [120, 320],
  engine_sound: [180, 480],
  recall: [80, 200],
  mileage: [120, 300],
  market: [150, 500],
  documents: [100, 250],
  wear: [100, 240],
  service: [90, 200],
  buffer: [80, 160],
};

type PhotoAnalysisEntry = FinalReport["photo_analysis"][number];

const COPY = {
  en: {
    title: {
      repaint: "Likely repainted panel",
      alignment: "Panel alignment / gap issue",
      bodywork: "Bodywork / lights to address",
      mechanical: "Mechanical point needing attention",
      engine_sound: "Abnormal engine sound",
      recall: "Open manufacturer recall",
      mileage: "Higher-than-average mileage",
      market: "Priced above market value",
      documents: "Incomplete service history",
      wear: "Wear & consumables provision",
      service: "Upcoming routine service",
      buffer: "Transfer costs & negotiation margin",
    } as Record<NegotiationCategory, string>,
    repaintDetail: (loc: string) =>
      `Signs of refinishing on the ${loc.toLowerCase()} suggest a past repair. Use it to ask for a reduction reflecting undisclosed history.`,
    alignDetail: (loc: string) =>
      `Uneven gaps / alignment around the ${loc.toLowerCase()} can point to a previous repair or adjustment.`,
    bodyDetail: (loc: string) =>
      `Issue detected on the ${loc.toLowerCase()} — factor the repair/refit cost into your offer.`,
    mechDetail: (name: string) =>
      `The "${name}" check raised a concern — budget for diagnosis/repair and negotiate accordingly.`,
    soundDetail: (s: string) =>
      `An abnormal sound (${s.replace(/_/g, " ")}) was detected — a strong lever pending a mechanic's confirmation.`,
    recallDetail: (n: number) =>
      `${n} open safety recall(s) for this model — ask the seller to have it done or to drop the price.`,
    mileageDetail: (avg: number, unit: string) =>
      `At ~${avg.toLocaleString()} ${unit}/year, mileage is above average, which accelerates wear and lowers value.`,
    marketDetail: (gap: string) =>
      `Your asking price is about ${gap} above our fair-value estimate for this age and mileage.`,
    docsDetail: () =>
      `Key documents (full service history) are missing — incomplete records justify a lower price.`,
    wearDetail: () =>
      `Tyres, brakes and other consumables wear with age and mileage — provision for the next replacements.`,
    serviceDetail: () =>
      `Build in the cost of the next routine service so it isn't a surprise after purchase.`,
    bufferDetail: () =>
      `Registration/transfer costs and the normal buyer's margin — fair to reflect in the final price.`,
    summary: (n: number, range: string) =>
      `We found ${n} concrete, evidence-based reasons to negotiate — together worth ${range} off the asking price.`,
    scriptWithPrice: (offer: string, reasons: string) =>
      `Thanks for the details. Based on a full CarGuard AI inspection, I'd like to offer ${offer}. Mainly because of: ${reasons}. I'm a serious buyer and ready to move quickly at a fair price.`,
    scriptNoPrice: (range: string, reasons: string) =>
      `Based on a full CarGuard AI inspection, I'd value this car ${range} below the asking price, mainly because of: ${reasons}. Happy to move quickly at a fair price.`,
    disclaimer:
      "Estimated reductions are indicative ranges to support your negotiation, not formal repair quotes. Use the inspection findings as your evidence.",
  },
  fr: {
    title: {
      repaint: "Panneau probablement repeint",
      alignment: "Défaut d'alignement / jeu de carrosserie",
      bodywork: "Carrosserie / optiques à reprendre",
      mechanical: "Point mécanique à surveiller",
      engine_sound: "Bruit moteur anormal",
      recall: "Rappel constructeur ouvert",
      mileage: "Kilométrage supérieur à la moyenne",
      market: "Prix au-dessus de la valeur de marché",
      documents: "Historique d'entretien incomplet",
      wear: "Provision usure & consommables",
      service: "Prochaine révision à prévoir",
      buffer: "Frais de cession & marge de négociation",
    } as Record<NegotiationCategory, string>,
    repaintDetail: (loc: string) =>
      `Des traces de réfection sur ${loc.toLowerCase()} suggèrent une réparation passée. À utiliser pour demander une baisse reflétant un historique non déclaré.`,
    alignDetail: (loc: string) =>
      `Des jeux irréguliers / un défaut d'alignement autour de ${loc.toLowerCase()} peuvent indiquer une réparation ou un réglage antérieur.`,
    bodyDetail: (loc: string) =>
      `Anomalie détectée sur ${loc.toLowerCase()} — intégrez le coût de réparation/remise en état à votre offre.`,
    mechDetail: (name: string) =>
      `Le contrôle « ${name} » a soulevé un point d'attention — prévoyez un diagnostic/réparation et négociez en conséquence.`,
    soundDetail: (s: string) =>
      `Un bruit anormal (${s.replace(/_/g, " ")}) a été détecté — levier fort, à confirmer par un mécanicien.`,
    recallDetail: (n: number) =>
      `${n} rappel(s) de sécurité ouvert(s) pour ce modèle — demandez au vendeur de le faire réaliser ou de baisser le prix.`,
    mileageDetail: (avg: number, unit: string) =>
      `À ~${avg.toLocaleString()} ${unit}/an, le kilométrage est au-dessus de la moyenne, ce qui accélère l'usure et réduit la valeur.`,
    marketDetail: (gap: string) =>
      `Le prix demandé est environ ${gap} au-dessus de notre estimation de valeur pour cet âge et ce kilométrage.`,
    docsDetail: () =>
      `Des documents clés (historique d'entretien complet) manquent — un suivi incomplet justifie un prix plus bas.`,
    wearDetail: () =>
      `Pneus, freins et autres consommables s'usent avec l'âge et le kilométrage — provisionnez les prochains remplacements.`,
    serviceDetail: () =>
      `Intégrez le coût de la prochaine révision pour qu'elle ne soit pas une surprise après l'achat.`,
    bufferDetail: () =>
      `Frais de carte grise/cession et marge normale d'acheteur — légitime de les refléter dans le prix final.`,
    summary: (n: number, range: string) =>
      `Nous avons trouvé ${n} raisons concrètes et étayées de négocier — pour un total de ${range} à retirer du prix demandé.`,
    scriptWithPrice: (offer: string, reasons: string) =>
      `Merci pour les informations. Après une inspection complète CarGuard AI, je vous propose ${offer}. Principalement en raison de : ${reasons}. Je suis un acheteur sérieux, prêt à conclure rapidement à un prix juste.`,
    scriptNoPrice: (range: string, reasons: string) =>
      `Après une inspection complète CarGuard AI, j'estime cette voiture ${range} en dessous du prix demandé, principalement en raison de : ${reasons}. Prêt à conclure rapidement à un prix juste.`,
    disclaimer:
      "Les réductions estimées sont des fourchettes indicatives pour appuyer votre négociation, pas des devis de réparation. Servez-vous des constats de l'inspection comme preuves.",
  },
};

function lever(
  category: NegotiationCategory,
  title: string,
  detail: string,
  severity: NegotiationLever["severity"],
): NegotiationLever {
  const [low, high] = BASE[category];
  // High-severity levers anchor toward the top of the band; low toward the bottom.
  const adjLow = severity === "high" ? Math.round(low * 1.15) : low;
  const adjHigh = severity === "low" ? Math.round(high * 0.8) : high;
  return { category, title, detail, severity, amount_low: adjLow, amount_high: adjHigh };
}

export function buildNegotiationSection(params: {
  locale: Locale;
  vehicle: Partial<Vehicle>;
  photoAnalysis: PhotoAnalysisEntry[];
  mechanical?: MechanicalReportSection | null;
  engineAudio?: EngineAudioReportSection | null;
  vehicleHistory?: VehicleHistorySection | null;
  mileageCheck?: MileageCheckSection | null;
  marketValue?: MarketValueSection | null;
  documents?: DocumentsSection | null;
  aiArguments?: string[];
}): NegotiationSection {
  const {
    locale,
    vehicle,
    photoAnalysis,
    mechanical,
    engineAudio,
    vehicleHistory,
    mileageCheck,
    marketValue,
    documents,
    aiArguments = [],
  } = params;
  const c = COPY[locale];
  const currency = vehicle.currency || marketValue?.currency || "EUR";
  const asking = vehicle.asking_price ?? marketValue?.asking_price ?? null;
  const levers: NegotiationLever[] = [];

  // --- Evidence levers from the photo analysis ---
  const seen = new Set<string>();
  for (const p of photoAnalysis) {
    for (const issue of p.detected_issues ?? []) {
      const sev: NegotiationLever["severity"] =
        issue.severity === "critical" || issue.severity === "high"
          ? "high"
          : issue.severity === "moderate"
            ? "moderate"
            : "low";
      let cat: NegotiationCategory = "bodywork";
      if (issue.issue_type === "possible_repaint" || issue.issue_type === "color_mismatch") cat = "repaint";
      else if (
        issue.issue_type === "alignment_issue" ||
        issue.issue_type === "door_alignment_issue" ||
        issue.issue_type === "trunk_misalignment" ||
        issue.issue_type === "bumper_misalignment"
      )
        cat = "alignment";
      const key = `${cat}:${issue.location}`;
      if (seen.has(key)) continue;
      seen.add(key);
      const loc = issue.location || p.title;
      const detail =
        cat === "repaint" ? c.repaintDetail(loc) : cat === "alignment" ? c.alignDetail(loc) : c.bodyDetail(loc);
      levers.push(lever(cat, `${c.title[cat]} — ${loc}`, detail, sev));
      if (levers.length >= 4) break;
    }
    if (levers.length >= 4) break;
  }

  // --- Mechanical levers ---
  if (mechanical) {
    const flagged = mechanical.items
      .filter((i) => (i.severity === "moderate" || i.severity === "high" || i.severity === "critical") || i.suspicious_observations.length > 0)
      .slice(0, 3);
    for (const it of flagged) {
      const sev: NegotiationLever["severity"] =
        it.severity === "high" || it.severity === "critical" ? "high" : it.severity === "moderate" ? "moderate" : "low";
      levers.push(lever("mechanical", `${c.title.mechanical} — ${it.title}`, c.mechDetail(it.title), sev));
    }
  }

  // --- Engine audio levers ---
  if (engineAudio) {
    const abnormal = (engineAudio.detected_sounds ?? [])
      .filter((s) => s.sound_type !== "normal_startup" && (s.severity === "moderate" || s.severity === "high" || s.severity === "critical"))
      .slice(0, 2);
    for (const s of abnormal) {
      const sev: NegotiationLever["severity"] = s.severity === "high" || s.severity === "critical" ? "high" : "moderate";
      levers.push(lever("engine_sound", c.title.engine_sound, c.soundDetail(s.sound_type), sev));
    }
  }

  // --- Open recalls ---
  if (vehicleHistory?.matched && vehicleHistory.recall_count > 0) {
    levers.push(lever("recall", c.title.recall, c.recallDetail(vehicleHistory.recall_count), "moderate"));
  }

  // --- High mileage ---
  if (
    mileageCheck &&
    mileageCheck.avg_per_year != null &&
    mileageCheck.avg_per_year > mileageCheck.expected_per_year * 1.15
  ) {
    levers.push(
      lever("mileage", c.title.mileage, c.mileageDetail(mileageCheck.avg_per_year, mileageCheck.unit), "moderate"),
    );
  }

  // --- Overpriced vs market ---
  if (
    marketValue &&
    marketValue.asking_price != null &&
    marketValue.estimated_high != null &&
    marketValue.asking_price > marketValue.estimated_high
  ) {
    const gap = Math.round(marketValue.asking_price - marketValue.estimated_high);
    const l = Math.max(100, Math.round(gap * 0.6));
    const h = Math.min(MAX_TOTAL, Math.max(l + 50, gap));
    levers.push({
      category: "market",
      title: c.title.market,
      detail: c.marketDetail(formatMoney(gap, currency)),
      severity: gap > 800 ? "high" : "moderate",
      amount_low: l,
      amount_high: h,
    });
  }

  // --- Missing key documents ---
  if (documents && documents.key_total > 0 && documents.key_provided < documents.key_total) {
    levers.push(lever("documents", c.title.documents, c.docsDetail(), "moderate"));
  }

  // --- Honest baseline levers (apply to any used car) — guarantee richness ---
  const hasMileage = (vehicle.mileage ?? 0) > 0;
  const ageKnown = vehicle.year != null;
  if (hasMileage || ageKnown) {
    levers.push(lever("wear", c.title.wear, c.wearDetail(), "low"));
    levers.push(lever("service", c.title.service, c.serviceDetail(), "low"));
  }

  // --- Totals + guaranteed [200, 1000] band ---
  let totalLow = levers.reduce((s, l) => s + l.amount_low, 0);
  let totalHigh = levers.reduce((s, l) => s + l.amount_high, 0);

  // Floor: top up with a transfer/negotiation-margin lever until we reach the min.
  if (totalHigh < MIN_TOTAL) {
    levers.push(lever("buffer", c.title.buffer, c.bufferDetail(), "low"));
    totalLow = levers.reduce((s, l) => s + l.amount_low, 0);
    totalHigh = levers.reduce((s, l) => s + l.amount_high, 0);
  }

  // Cap to a credible fraction of the asking price (when known).
  const hardMax = asking != null ? Math.min(MAX_TOTAL, Math.max(MIN_TOTAL, Math.round(asking * MAX_ASKING_SHARE))) : MAX_TOTAL;
  totalHigh = Math.min(Math.max(totalHigh, MIN_TOTAL), hardMax);
  totalLow = Math.min(Math.max(totalLow, Math.min(MIN_TOTAL, totalHigh)), totalHigh);
  // Keep a sensible spread.
  if (totalHigh - totalLow < 100) totalLow = Math.max(Math.min(MIN_TOTAL, totalHigh), totalHigh - 150);

  const targetLow = asking != null ? Math.max(0, asking - totalHigh) : null;
  const targetHigh = asking != null ? Math.max(0, asking - totalLow) : null;

  const rangeStr = `${formatMoney(totalLow, currency)}–${formatMoney(totalHigh, currency)}`;
  const reasons = levers
    .filter((l) => l.category !== "buffer")
    .slice(0, 3)
    .map((l) => l.title.toLowerCase())
    .join(locale === "fr" ? " ; " : "; ");

  const script =
    targetLow != null
      ? c.scriptWithPrice(formatMoney(targetLow, currency), reasons)
      : c.scriptNoPrice(rangeStr, reasons);

  return {
    currency,
    asking_price: asking,
    total_low: totalLow,
    total_high: totalHigh,
    target_price_low: targetLow,
    target_price_high: targetHigh,
    levers,
    extra_points: (aiArguments ?? []).slice(0, 6),
    script,
    summary: c.summary(levers.filter((l) => l.category !== "buffer").length, rangeStr),
    disclaimer: c.disclaimer,
  };
}
