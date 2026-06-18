// =====================================================================
// CarGuard AI — Sample report data (for the public /report-example page).
//
// This is a FICTIONAL, illustrative report used to show prospective buyers
// what they get before they pay. It is not a real inspection. Numbers and
// findings are crafted to be realistic and bilingual (FR/EN).
// =====================================================================

import type { FinalReport, PhotoPointCode } from "@/types";
import type { Locale } from "@/lib/i18n";

interface PhotoSeed {
  code: PhotoPointCode;
  title: { en: string; fr: string };
  quality_score: number;
  risk_score: number;
  confidence: number;
  observations: { en: string[]; fr: string[] };
  issues?: {
    severity: "low" | "moderate" | "high" | "critical";
    confidence: number;
    location: { en: string; fr: string };
    explanation: { en: string; fr: string };
    issue_type: "possible_repaint" | "color_mismatch" | "bumper_misalignment";
  }[];
}

const PHOTOS: PhotoSeed[] = [
  {
    code: "front_view",
    title: { en: "Front view", fr: "Vue avant" },
    quality_score: 94,
    risk_score: 88,
    confidence: 91,
    observations: {
      en: ["Bumper, grille and badges aligned and consistent.", "Both headlights show matching aging and clarity."],
      fr: ["Pare-chocs, calandre et logos alignés et cohérents.", "Les deux phares présentent un vieillissement et une clarté identiques."],
    },
  },
  {
    code: "rear_view",
    title: { en: "Rear view", fr: "Vue arrière" },
    quality_score: 92,
    risk_score: 84,
    confidence: 89,
    observations: {
      en: ["Tailgate gaps even on both sides.", "Exhaust tips show normal, even sooting."],
      fr: ["Jeux du hayon réguliers des deux côtés.", "Les sorties d'échappement présentent une suie normale et homogène."],
    },
  },
  {
    code: "left_side_view",
    title: { en: "Left side", fr: "Côté gauche" },
    quality_score: 90,
    risk_score: 86,
    confidence: 88,
    observations: {
      en: ["Door gaps consistent front to rear.", "Paint reflection uniform along the body line."],
      fr: ["Jeux de portes réguliers de l'avant à l'arrière.", "Reflet de peinture uniforme le long de la ligne de caisse."],
    },
  },
  {
    code: "right_side_view",
    title: { en: "Right side", fr: "Côté droit" },
    quality_score: 89,
    risk_score: 70,
    confidence: 86,
    observations: {
      en: ["Slightly higher reflectivity on the rear quarter panel vs the front door."],
      fr: ["Réflectivité légèrement plus élevée sur l'aile arrière par rapport à la porte avant."],
    },
  },
  {
    code: "front_left_diagonal",
    title: { en: "Front-left 3/4", fr: "3/4 avant gauche" },
    quality_score: 93,
    risk_score: 87,
    confidence: 90,
    observations: {
      en: ["Panel-to-panel gaps consistent around the front-left corner."],
      fr: ["Jeux entre panneaux cohérents autour de l'angle avant gauche."],
    },
  },
  {
    code: "front_right_diagonal",
    title: { en: "Front-right 3/4", fr: "3/4 avant droit" },
    quality_score: 91,
    risk_score: 85,
    confidence: 88,
    observations: {
      en: ["Fender and door alignment normal; no overspray on trim."],
      fr: ["Alignement aile/porte normal ; pas de surpulvérisation sur les baguettes."],
    },
  },
  {
    code: "rear_left_diagonal",
    title: { en: "Rear-left 3/4", fr: "3/4 arrière gauche" },
    quality_score: 90,
    risk_score: 83,
    confidence: 87,
    observations: {
      en: ["Bumper-to-quarter gap even; reflector seated correctly."],
      fr: ["Jeu pare-chocs/aile régulier ; catadioptre correctement positionné."],
    },
  },
  {
    code: "rear_right_diagonal",
    title: { en: "Rear-right 3/4", fr: "3/4 arrière droit" },
    quality_score: 88,
    risk_score: 52,
    confidence: 84,
    observations: {
      en: ["Paint tone and texture on the rear-right quarter differ subtly from the adjacent door.", "Faint masking edge visible near the wheel arch under raking light."],
      fr: ["Le ton et la texture de la peinture sur l'aile arrière droite diffèrent subtilement de la porte adjacente.", "Légère trace de masquage visible près du passage de roue en lumière rasante."],
    },
    issues: [
      {
        severity: "moderate",
        confidence: 76,
        issue_type: "possible_repaint",
        location: { en: "Rear-right quarter panel", fr: "Aile arrière droite" },
        explanation: {
          en: "Paint tone, texture and reflectivity suggest this panel was likely refinished. This often indicates a past repair — not necessarily structural, but worth confirming.",
          fr: "Le ton, la texture et la réflectivité de la peinture suggèrent que ce panneau a probablement été repeint. Cela indique souvent une réparation passée — pas forcément structurelle, mais à confirmer.",
        },
      },
    ],
  },
];

const TXT = {
  en: {
    photo_quality_summary: "All 8 photos usable",
    ai_summary:
      "Overall this 2019 BMW 320d presents as a well-kept car with consistent panel gaps and clean mechanicals. The main point of attention is the rear-right quarter panel, which shows signs of a likely repaint — consistent with a minor past repair rather than structural damage. Combined with the asking price sitting slightly above the fair market range, there is clear room to negotiate. We recommend confirming the repair history and requesting the full service records before purchase.",
    positive: [
      "Even panel gaps and consistent paint across most of the body.",
      "Cold start clean, with stable idle and no abnormal engine noise detected.",
      "No dashboard warning lights reported; fluids at correct levels.",
      "Mileage consistent with the vehicle's age (~18,400 km/year).",
    ],
    suspicious: [
      "Rear-right quarter panel shows a likely repaint (possible past repair).",
      "Asking price is slightly above our estimated fair-value range.",
      "One open manufacturer recall not confirmed as performed.",
    ],
    seller_questions: [
      "Has the rear-right quarter panel ever been repaired or repainted? Do you have invoices?",
      "Was the EGR/coolant recall carried out? Can you show the stamp or paperwork?",
      "Is the full service history available, including the last major service?",
      "Has the car ever been involved in an accident, even minor?",
    ],
    negotiation: [
      "Likely repaint on the rear-right quarter — ask for a price reduction to reflect undisclosed repair history.",
      "Asking price is above the estimated fair range for this age/mileage — anchor toward the lower end.",
      "Unconfirmed open recall — use as leverage to have it done before sale or reduce the price.",
    ],
    next_steps: [
      "Get the suspected repainted panel confirmed by a bodyshop or with a paint-thickness gauge.",
      "Verify the open recall status with a BMW dealer using the VIN.",
      "Take a 15-20 min test drive covering town and motorway, watching temperature and DPF behaviour.",
      "Confirm the full service history and the timing of the next major service.",
    ],
    audio_summary:
      "Cold start was prompt and clean. Idle is stable with no knocking, timing-chain rattle or misfire-like sounds detected. A faint, normal turbo spool was heard on light revs. No abnormal mechanical noise in the recording.",
    audio_seller_q: ["When was the last oil and filter service done?"],
    audio_mech_q: ["Confirm timing-chain condition is normal for this engine family."],
    mech_summary:
      "Guided engine & mechanical checks came back largely reassuring: no warning lights, correct fluid levels, no visible leaks under the engine, and clean exhaust with no blue or white smoke. Maintenance records were partially provided.",
    mech_items: [
      { code: "cold_start" as const, title: { v: "Cold start" }, score: 88, sev: "low" as const, sus: [], sum: "Started promptly, no excessive cranking or smoke." },
      { code: "dashboard_lights" as const, title: { v: "Dashboard lights" }, score: 90, sev: "low" as const, sus: [], sum: "All warning lights cleared after start; none stayed on." },
      { code: "exhaust_smoke" as const, title: { v: "Exhaust smoke" }, score: 85, sev: "low" as const, sus: [], sum: "No blue (oil) or white (coolant) smoke observed." },
      { code: "leaks_under_engine" as const, title: { v: "Leaks under engine" }, score: 80, sev: "low" as const, sus: [], sum: "No active drips; a light dry residue near the sump is worth monitoring." },
      { code: "maintenance_records" as const, title: { v: "Maintenance records" }, score: 60, sev: "moderate" as const, sus: ["Service history only partially provided."], sum: "Some invoices missing — request the complete book." },
    ],
    mech_seller_q: ["Can you provide the complete maintenance booklet and invoices?"],
    mech_mech_q: ["Have the sump area inspected for any developing oil seepage."],
    history_note:
      "One open safety recall was found for this model/year. Several owner complaints relate to the EGR cooler and the timing chain on early builds.",
    history_recall_component: "EGR cooler / coolant system",
    history_recall_summary:
      "On certain diesel engines the EGR cooler could leak coolant, creating a risk of overheating. Dealers replace the affected cooler.",
    history_recall_remedy: "Free replacement of the EGR cooler at an authorised dealer.",
    mileage_note: "At ~18,400 km/year, mileage is fully consistent with the vehicle's age. No rollback indicators in the available data.",
    mv_disclaimer_unused: "",
  },
  fr: {
    photo_quality_summary: "Les 8 photos sont exploitables",
    ai_summary:
      "Globalement, cette BMW 320d de 2019 se présente comme une voiture bien entretenue, avec des jeux de carrosserie réguliers et une mécanique saine. Le principal point d'attention est l'aile arrière droite, qui montre des signes d'une probable réfection de peinture — cohérente avec une petite réparation passée plutôt qu'un dommage structurel. Associé à un prix demandé légèrement au-dessus de la fourchette de marché, il existe une vraie marge de négociation. Nous recommandons de confirmer l'historique de réparation et de demander le carnet d'entretien complet avant l'achat.",
    positive: [
      "Jeux de carrosserie réguliers et peinture cohérente sur la majeure partie du véhicule.",
      "Démarrage à froid propre, ralenti stable et aucun bruit moteur anormal détecté.",
      "Aucun voyant au tableau de bord signalé ; niveaux de fluides corrects.",
      "Kilométrage cohérent avec l'âge du véhicule (~18 400 km/an).",
    ],
    suspicious: [
      "L'aile arrière droite montre une probable réfection de peinture (réparation passée possible).",
      "Le prix demandé est légèrement au-dessus de notre fourchette de valeur estimée.",
      "Un rappel constructeur ouvert dont la réalisation n'est pas confirmée.",
    ],
    seller_questions: [
      "L'aile arrière droite a-t-elle déjà été réparée ou repeinte ? Avez-vous les factures ?",
      "Le rappel EGR / circuit de refroidissement a-t-il été effectué ? Pouvez-vous montrer le tampon ou le justificatif ?",
      "L'historique d'entretien complet est-il disponible, y compris la dernière grande révision ?",
      "Le véhicule a-t-il déjà été accidenté, même légèrement ?",
    ],
    negotiation: [
      "Probable réfection de peinture sur l'aile arrière droite — demandez une baisse de prix reflétant un historique de réparation non déclaré.",
      "Prix demandé au-dessus de la fourchette estimée pour cet âge/kilométrage — ancrez vers le bas de la fourchette.",
      "Rappel ouvert non confirmé — à utiliser pour le faire réaliser avant la vente ou faire baisser le prix.",
    ],
    next_steps: [
      "Faites confirmer le panneau suspecté repeint par un carrossier ou avec un mesureur d'épaisseur de peinture.",
      "Vérifiez le statut du rappel ouvert auprès d'un concessionnaire BMW avec le VIN.",
      "Effectuez un essai de 15-20 min en ville et sur autoroute, en surveillant la température et le comportement du FAP.",
      "Confirmez l'historique d'entretien complet et l'échéance de la prochaine grande révision.",
    ],
    audio_summary:
      "Le démarrage à froid a été rapide et propre. Le ralenti est stable, sans cognement, cliquetis de chaîne de distribution ni bruit évoquant un raté d'allumage. Un léger sifflement de turbo, normal, a été entendu en légère montée en régime. Aucun bruit mécanique anormal dans l'enregistrement.",
    audio_seller_q: ["Quand la dernière vidange (huile et filtre) a-t-elle été faite ?"],
    audio_mech_q: ["Confirmer que l'état de la chaîne de distribution est normal pour cette famille de moteur."],
    mech_summary:
      "Les contrôles moteur & mécanique guidés sont globalement rassurants : aucun voyant, niveaux de fluides corrects, aucune fuite visible sous le moteur, et échappement propre sans fumée bleue ni blanche. Le carnet d'entretien n'a été fourni que partiellement.",
    mech_items: [
      { code: "cold_start" as const, title: { v: "Démarrage à froid" }, score: 88, sev: "low" as const, sus: [], sum: "Démarrage rapide, sans lancement prolongé ni fumée excessive." },
      { code: "dashboard_lights" as const, title: { v: "Voyants tableau de bord" }, score: 90, sev: "low" as const, sus: [], sum: "Tous les voyants se sont éteints après le démarrage ; aucun resté allumé." },
      { code: "exhaust_smoke" as const, title: { v: "Fumée d'échappement" }, score: 85, sev: "low" as const, sus: [], sum: "Aucune fumée bleue (huile) ni blanche (liquide de refroidissement) observée." },
      { code: "leaks_under_engine" as const, title: { v: "Fuites sous le moteur" }, score: 80, sev: "low" as const, sus: [], sum: "Aucune fuite active ; un léger résidu sec près du carter est à surveiller." },
      { code: "maintenance_records" as const, title: { v: "Carnet d'entretien" }, score: 60, sev: "moderate" as const, sus: ["Historique d'entretien fourni seulement en partie."], sum: "Certaines factures manquent — demandez le carnet complet." },
    ],
    mech_seller_q: ["Pouvez-vous fournir le carnet d'entretien complet et les factures ?"],
    mech_mech_q: ["Faites inspecter la zone du carter pour détecter un éventuel suintement d'huile."],
    history_note:
      "Un rappel de sécurité ouvert a été trouvé pour ce modèle/millésime. Plusieurs plaintes de propriétaires concernent le refroidisseur EGR et la chaîne de distribution sur les premières productions.",
    history_recall_component: "Refroidisseur EGR / circuit de refroidissement",
    history_recall_summary:
      "Sur certains moteurs diesel, le refroidisseur EGR pouvait laisser fuir du liquide de refroidissement, créant un risque de surchauffe. Les concessionnaires remplacent le refroidisseur concerné.",
    history_recall_remedy: "Remplacement gratuit du refroidisseur EGR chez un concessionnaire agréé.",
    mileage_note: "À ~18 400 km/an, le kilométrage est tout à fait cohérent avec l'âge du véhicule. Aucun indice de trafiquage dans les données disponibles.",
    mv_disclaimer_unused: "",
  },
};

export function getDemoReport(locale: Locale): FinalReport {
  const x = TXT[locale];
  const disclaimer =
    locale === "fr"
      ? "Ce rapport est généré par IA à partir des photos et contrôles fournis. Il constitue un outil de pré-diagnostic et ne remplace pas l'inspection d'un professionnel. Exemple fictif à des fins d'illustration."
      : "This report is AI-generated from the supplied photos and checks. It is a preliminary screening tool and does not replace a professional inspection. Fictional example for illustration.";

  return {
    generated_at: "2026-06-15T10:30:00.000Z",
    vehicle: {
      make: "BMW",
      model: "320d",
      year: 2019,
      generation: "G20",
      trim: "M Sport",
      engine: "2.0L Diesel",
      fuel_type: "diesel",
      transmission: "automatic",
      mileage: 92000,
      asking_price: 21500,
      currency: "EUR",
      seller_type: "private",
      vin: "WBA5R71040FH12345",
      country: "FR",
      city: "Lyon",
    },
    ai_summary: x.ai_summary,
    summary: {
      photos_analyzed: 8,
      photo_quality_summary: x.photo_quality_summary,
      risk_level: "moderate",
      recommendation: "negotiate",
      confidence: 88,
    },
    scores: {
      global_score: 72,
      accident_repair_score: 66,
      alignment_score: 82,
      paint_tone_score: 58,
      symmetry_score: 80,
      bumpers_lights_score: 86,
      overall_consistency_score: 70,
      model_risk_score: 68,
      mechanical_score: 78,
    },
    positive_points: x.positive,
    suspicious_points: x.suspicious,
    photo_analysis: PHOTOS.map((p) => ({
      photo_point_code: p.code,
      title: p.title[locale],
      quality_score: p.quality_score,
      risk_score: p.risk_score,
      confidence: p.confidence,
      observations: p.observations[locale],
      detected_issues: (p.issues ?? []).map((i) => ({
        issue_type: i.issue_type,
        location: i.location[locale],
        severity: i.severity,
        confidence: i.confidence,
        explanation: i.explanation[locale],
        recommended_follow_up_photo: null,
      })),
    })),
    questions_to_ask_seller: x.seller_questions,
    negotiation_arguments: x.negotiation,
    recommended_next_steps: x.next_steps,
    disclaimer,
    engine_audio: {
      file_name: "engine-start.m4a",
      duration_seconds: 22,
      audio_quality_score: 90,
      engine_audio_score: 86,
      risk_level: "low",
      recommendation: "normal_sound",
      detected_sounds: [
        {
          sound_type: "normal_startup",
          severity: "low",
          confidence: 90,
          timestamp_start: 0,
          timestamp_end: 4,
          explanation:
            locale === "fr"
              ? "Démarrage net et régime stabilisé rapidement."
              : "Clean start with rpm settling quickly.",
          possible_causes: [],
          recommended_action:
            locale === "fr" ? "Aucune action requise." : "No action required.",
        },
      ],
      summary: x.audio_summary,
      seller_questions: x.audio_seller_q,
      mechanic_questions: x.audio_mech_q,
      disclaimer,
    },
    mechanical: {
      mechanical_score: 78,
      risk_level: "low",
      recommendation: "ask_seller_questions",
      summary: x.mech_summary,
      items: x.mech_items.map((m) => ({
        point_code: m.code,
        title: m.title.v,
        score: m.score,
        severity: m.sev,
        suspicious_observations: m.sus,
        summary: m.sum,
      })),
      seller_questions: x.mech_seller_q,
      mechanic_questions: x.mech_mech_q,
      disclaimer,
    },
    vehicle_history: {
      source: "NHTSA",
      matched: true,
      vehicle: "2019 BMW 320d",
      recalls: [
        {
          campaign: "RC-2019-074",
          component: x.history_recall_component,
          summary: x.history_recall_summary,
          remedy: x.history_recall_remedy,
          date: "2019-09-12",
        },
      ],
      recall_count: 1,
      complaints_count: 14,
      top_complaint_components: ["EGR cooler", "Timing chain", "Infotainment"],
      note: x.history_note,
      disclaimer,
    },
    specifications: {
      source: "NHTSA vPIC",
      vin_decoded: true,
      groups: [
        {
          group: "identity",
          items: [
            { key: "make", value: "BMW" },
            { key: "model", value: "320d" },
            { key: "year", value: "2019" },
            { key: "trim", value: "M Sport" },
            { key: "body_class", value: "Sedan" },
          ],
        },
        {
          group: "engine",
          items: [
            { key: "displacement_l", value: "2.0" },
            { key: "cylinders", value: "4" },
            { key: "fuel_type", value: "Diesel" },
            { key: "engine_hp", value: "190" },
          ],
        },
        {
          group: "drivetrain",
          items: [
            { key: "drive_type", value: "RWD" },
            { key: "transmission", value: "Automatic" },
            { key: "transmission_speeds", value: "8" },
          ],
        },
      ],
    },
    mileage_check: {
      status: "ok",
      mileage: 92000,
      unit: "km",
      vehicle_age_years: 5,
      avg_per_year: 18400,
      expected_per_year: 15000,
      flags: [],
      note: x.mileage_note,
      disclaimer,
    },
    safety: null,
    title_flags: null,
    market_value: {
      currency: "EUR",
      asking_price: 21500,
      estimated_low: 18200,
      estimated_high: 20900,
      verdict: "overpriced",
      expected_mileage: 75000,
      actual_mileage: 92000,
      unit: "km",
      source: null,
      disclaimer,
    },
    documents: {
      provided_count: 3,
      relevant_count: 5,
      key_provided: 1,
      key_total: 2,
      items: [
        { doc_type: "registration", provided: true, key: true },
        { doc_type: "maintenance", provided: true, key: true },
        { doc_type: "technical_inspection", provided: true, key: false },
        { doc_type: "history_report", provided: false, key: false },
        { doc_type: "purchase_invoice", provided: false, key: false },
      ],
      note: "",
      disclaimer,
    },
  };
}
