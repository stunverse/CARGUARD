// =====================================================================
// CarGuard AI — Localized content (FR) for photo points, mechanical
// points, and risk/recommendation copy. English comes from the source
// constants; French from the maps below. Helpers return the right one.
// =====================================================================

import type { Locale } from "@/lib/i18n";
import type {
  MechanicalPoint,
  MechanicalRecommendation,
  MechanicalRiskLevel,
  PhotoPointCode,
  Recommendation,
  RiskLevel,
} from "@/types";
import type { PhotoPointSeed } from "@/lib/constants";

// ---- Photo points (FR) ---------------------------------------------
const PHOTO_FR: Record<PhotoPointCode, { title: string; instruction: string; why: string }> = {
  front_view: {
    title: "Vue de face",
    instruction: "Placez-vous bien en face du véhicule. Prenez une photo nette montrant tout l'avant : capot, phares, calandre, pare-chocs et les deux coins avant.",
    why: "Révèle l'alignement capot/phares/pare-chocs, une calandre remplacée, les différences de teinte à l'avant, un choc visible et la symétrie avant.",
  },
  rear_view: {
    title: "Vue arrière",
    instruction: "Placez-vous bien derrière le véhicule. Photographiez tout l'arrière : coffre, feux, pare-chocs et les deux coins arrière.",
    why: "Révèle l'alignement coffre/feux/pare-chocs, les différences de teinte, un pare-chocs remplacé, un choc arrière et la symétrie arrière.",
  },
  left_side_view: {
    title: "Côté gauche",
    instruction: "Placez-vous sur le côté gauche. Photographiez tout le flanc, du pare-chocs avant au pare-chocs arrière.",
    why: "Révèle l'alignement aile/portes/custode, le bas de caisse, l'homogénéité de teinte, un choc latéral et les panneaux remplacés/repeints.",
  },
  right_side_view: {
    title: "Côté droit",
    instruction: "Placez-vous sur le côté droit. Photographiez tout le flanc, du pare-chocs avant au pare-chocs arrière.",
    why: "Révèle l'alignement aile/portes/custode, le bas de caisse, l'homogénéité de teinte, un choc latéral et les panneaux remplacés/repeints.",
  },
  front_left_diagonal: {
    title: "Diagonale avant gauche",
    instruction: "Placez-vous au coin avant gauche. Prenez une photo montrant à la fois l'avant et le côté gauche.",
    why: "Révèle la cohérence avant/côté gauche, le jeu capot-aile, l'alignement pare-chocs-aile, le phare gauche, reflets/teinte et un choc avant gauche.",
  },
  front_right_diagonal: {
    title: "Diagonale avant droite",
    instruction: "Placez-vous au coin avant droit. Prenez une photo montrant à la fois l'avant et le côté droit.",
    why: "Révèle la cohérence avant/côté droit, le jeu capot-aile, l'alignement pare-chocs-aile, le phare droit, reflets/teinte et un choc avant droit.",
  },
  rear_left_diagonal: {
    title: "Diagonale arrière gauche",
    instruction: "Placez-vous au coin arrière gauche. Prenez une photo montrant à la fois l'arrière et le côté gauche.",
    why: "Révèle la cohérence arrière/côté gauche, le jeu coffre-custode, l'alignement pare-chocs-custode, le feu gauche, reflets/teinte et un choc arrière gauche.",
  },
  rear_right_diagonal: {
    title: "Diagonale arrière droite",
    instruction: "Placez-vous au coin arrière droit. Prenez une photo montrant à la fois l'arrière et le côté droit.",
    why: "Révèle la cohérence arrière/côté droit, le jeu coffre-custode, l'alignement pare-chocs-custode, le feu droit, reflets/teinte et un choc arrière droit.",
  },
};

export function localizedPhotoPoint(
  point: PhotoPointSeed,
  locale: Locale,
): { title: string; instruction: string; why: string } {
  if (locale === "fr" && PHOTO_FR[point.code]) return PHOTO_FR[point.code];
  return { title: point.title, instruction: point.instruction, why: point.why_it_matters };
}

// ---- Mechanical points (FR) ----------------------------------------
type MechFr = { title: string; instruction: string; why: string; obs: Record<string, string> };

const MECH_FR: Partial<Record<string, MechFr>> = {
  cold_start: {
    title: "Démarrage à froid (vidéo)",
    instruction: "Filmez 20–30 s, capot ouvert, pendant que le vendeur démarre le moteur à froid. Téléphone stable, sans musique.",
    why: "Le démarrage à froid révèle le plus : démarrage long, claquements, bruits métalliques, tremblements, fumée ou ralenti instable.",
    obs: { long_to_start: "Le moteur a mis longtemps à démarrer", metallic_noise: "Bruit métallique / « de casserole » au démarrage", loud_knocking: "Claquement fort et régulier (« clac clac clac »)", engine_shakes: "Moteur qui tremble visiblement", smoke_at_start: "Fumée à l'échappement au démarrage", idle_hunting: "Le ralenti monte et descend", engine_light_on: "Voyant moteur qui reste allumé", started_cleanly: "Démarrage rapide et tournant rond" },
  },
  dashboard_lights: {
    title: "Voyants au tableau de bord (2 photos)",
    instruction: "Une photo contact mis / moteur éteint, puis une seconde moteur tournant. Certains voyants doivent apparaître au contact puis s'éteindre.",
    why: "Un voyant moteur qui reste allumé après démarrage est un signal fort. Aucun voyant au contact peut signaler un compteur trafiqué.",
    obs: { engine_light_stays_on: "Voyant moteur allumé après démarrage", oil_light_on: "Voyant de pression d'huile allumé", battery_light_on: "Voyant batterie / charge allumé", temp_light_on: "Voyant de température allumé", dpf_light_on: "Voyant FAP / dépollution allumé", no_lights_at_ignition: "Aucun voyant au contact (peut-être masqué)", lights_normal: "Voyants apparus au contact puis éteints" },
  },
  exhaust_smoke: {
    title: "Échappement & montée en régime (vidéo)",
    instruction: "Placez-vous derrière la voiture, l'ÉCHAPPEMENT dans le cadre. Filmez pendant que le vendeur passe du ralenti à ~2 500–3 000 tr/min. Observez la couleur de la fumée ET son comportement en charge.",
    why: "Blanche (joint de culasse/liquide), bleue (huile/turbo) ou noire (injecteurs/EGR/FAP) : chaque couleur indique un risque différent — et une fumée qui s'épaissit, des à-coups ou un bruit métallique en charge révèlent des problèmes invisibles au ralenti.",
    obs: { white_thick_persistent: "Fumée blanche épaisse et persistante", blue_smoke: "Fumée bleue", black_excessive: "Fumée noire excessive", smoke_increases_under_rev: "La fumée s'épaissit en accélérant", engine_stumbles: "Le moteur broute / hésite en accélérant", metallic_noise: "Bruit métallique en accélérant", light_vapor_cold: "Juste une légère vapeur blanche par temps froid (normal)", no_smoke: "Aucune fumée, montée en régime propre" },
  },
  oil_dipstick: {
    title: "Huile moteur — jauge (photo)",
    instruction: "Sortez la jauge, essuyez-la, replongez-la, ressortez-la et photographiez l'extrémité (niveau + couleur).",
    why: "Le niveau, la couleur et la « mayonnaise » (mélange huile/eau) révèlent un entretien négligé ou un possible joint de culasse.",
    obs: { level_below_min: "Niveau sous le minimum", very_black_thick: "Huile très noire et épaisse", mayonnaise: "« Mayonnaise » beige sur la jauge", fuel_smell: "Forte odeur de carburant", level_too_high: "Niveau beaucoup trop haut", level_color_normal: "Niveau entre min/max, couleur normale" },
  },
  oil_cap: {
    title: "Dessous du bouchon d'huile (photo)",
    instruction: "Dévissez le bouchon de remplissage d'huile et photographiez son dessous.",
    why: "Un dépôt beige type mayonnaise ou une boue épaisse sous le bouchon peut indiquer un mélange huile/eau (joint de culasse).",
    obs: { mayonnaise_deposit: "Dépôt beige/blanc type mayonnaise", thick_sludge: "Boue épaisse", pasty_oil: "Huile anormalement pâteuse", clean: "Dessous propre" },
  },
  coolant: {
    title: "Liquide de refroidissement (photo)",
    instruction: "Photographiez le vase d'expansion (moteur froid) : niveau et couleur du liquide.",
    why: "Traces d'huile, couleur boueuse ou bulles continues dans le liquide sont des signes clés d'un possible joint de culasse.",
    obs: { level_very_low: "Niveau très bas", brown_muddy: "Liquide marron / boueux", oil_traces: "Traces d'huile dans le vase", continuous_bubbles: "Bulles continues moteur tournant", clean_normal: "Liquide propre, niveau entre min/max" },
  },
  leaks_under_engine: {
    title: "Fuites sous le moteur (photo)",
    instruction: "Photographiez sous le moteur et sous la voiture (autour du carter, du turbo et des durites si visibles).",
    why: "De l'huile ou du liquide coloré au sol signale une fuite. Un moteur anormalement propre sur une voiture âgée/kilométrée peut cacher une fuite nettoyée.",
    obs: { oil_on_ground: "Huile au sol", colored_coolant: "Liquide vert/rose/orange", greasy_traces: "Traces grasses", suspiciously_clean_engine: "Moteur anormalement propre pour l'âge/kilométrage", no_leak: "Aucune fuite visible" },
  },
  idle_noise: {
    title: "Bruits au ralenti (son)",
    instruction: "Enregistrez 20–30 s du moteur au ralenti, capot ouvert. Un enregistrement sonore suffit — ni vidéo ni photo. Téléphone stable, sans musique.",
    why: "Des bruits qui augmentent avec le régime, un claquement à chaud ou un ralenti instable traduisent une usure mécanique.",
    obs: { metallic_knock: "Claquement métallique", rubbing: "Bruit de frottement", loud_whistle: "Sifflement fort", belt_squeal: "Couinement de courroie", unstable_idle: "Ralenti instable", smooth_idle: "Ralenti régulier et stable" },
  },
  engine_temperature: {
    title: "Température moteur (photo après conduite)",
    instruction: "Après 10–15 min de conduite, photographiez la jauge / l'affichage de température.",
    why: "La température doit se stabiliser vers la normale (~90 °C sur beaucoup de voitures). Une montée rapide ou un message de surchauffe est un signal d'alerte.",
    obs: { temp_above_normal: "Température au-dessus de la normale", rising_fast: "Température qui monte vite", overheat_message: "Message de surchauffe affiché", fan_loud: "Ventilateur tournant anormalement fort", stable_normal: "Stable autour de la normale" },
  },
  fluid_after_test: {
    title: "Liquide sous la voiture après l'essai (photo)",
    instruction: "Après l'essai, laissez la voiture une minute, puis photographiez le sol en dessous.",
    why: "Une fuite qui n'apparaît qu'une fois le moteur chaud est un signal important.",
    obs: { oil_drops: "Gouttes d'huile", coolant: "Liquide de refroidissement", greasy_clear: "Liquide transparent gras", fuel_smell: "Odeur de carburant", none: "Rien sous la voiture" },
  },
  road_test: {
    title: "Essai routier (optionnel)",
    instruction: "Si vous pouvez conduire la voiture, sélectionnez ce que vous avez remarqué pendant l'essai.",
    why: "Le comportement en charge réelle révèle perte de puissance, à-coups, surchauffe ou voyants.",
    obs: { power_loss: "Perte de puissance / voiture molle", jerks: "À-coups ou hésitations", warning_light_appears: "Un voyant est apparu en roulant", temp_or_smell: "Température anormale ou odeur de brûlé", all_good: "A bien roulé, rien d'anormal" },
  },
  maintenance_records: {
    title: "Factures d'entretien (optionnel)",
    instruction: "Importez des photos des factures / du carnet d'entretien si disponibles.",
    why: "Un historique documenté réduit fortement le risque de vices cachés.",
    obs: { no_invoices: "Aucune facture", empty_logbook: "Carnet d'entretien vide", vague_seller: "Vendeur flou sur l'historique", mileage_inconsistent: "Kilométrage incohérent entre documents", recent_service_documented: "Entretien récent documenté avec factures" },
  },
};

export function localizedMechPoint(point: MechanicalPoint, locale: Locale): {
  title: string;
  instruction: string;
  why: string;
  observations: { key: string; label: string; kind: "suspect" | "good"; weight: number }[];
} {
  const fr = locale === "fr" ? MECH_FR[point.code] : undefined;
  return {
    title: fr?.title ?? point.title,
    instruction: fr?.instruction ?? point.instruction,
    why: fr?.why ?? point.why_it_matters,
    observations: point.observations.map((o) => ({
      ...o,
      label: fr?.obs[o.key] ?? o.label,
    })),
  };
}

// ---- Risk / recommendation copy (FR) -------------------------------
export const RISK_LEVEL_FR: Record<RiskLevel, string> = {
  low: "Risque faible",
  moderate: "Risque modéré",
  high: "Risque élevé",
  very_high: "Risque très élevé",
};

export const RECOMMENDATION_LABEL_FR: Record<Recommendation, string> = {
  buy: "Achat envisageable",
  negotiate: "À négocier",
  professional_inspection: "Inspection pro conseillée",
  avoid: "À éviter",
  insufficient_photos: "Photos insuffisantes",
};

export const MECH_RISK_FR: Record<MechanicalRiskLevel, string> = {
  low: "Normal",
  moderate: "Risque faible à modéré",
  high: "Risque modéré à élevé",
  very_high: "Risque élevé",
  insufficient_data: "Données insuffisantes",
};

export function localizedRiskLevel(level: RiskLevel | null | undefined, locale: Locale, enCopy: Record<RiskLevel, string>): string {
  if (!level) return "";
  return locale === "fr" ? RISK_LEVEL_FR[level] : enCopy[level];
}

// Long recommendation paragraphs (FR).
export const RECO_TEXT_FR: Record<Recommendation, string> = {
  buy: "Aucun signe évident d'accident ou de réparation importante n'a été détecté sur les photos fournies. Le véhicule paraît visuellement cohérent. Cela ne garantit pas qu'il n'a jamais été endommagé. Une inspection professionnelle et un rapport d'historique restent recommandés.",
  negotiate: "Certains éléments visuels doivent être vérifiés avant l'achat. Demandez au vendeur d'éventuelles réparations, repeintes ou antécédents d'accident. Utilisez les points signalés comme arguments de négociation.",
  professional_inspection: "Plusieurs signes visuels pourraient suggérer des réparations passées ou des dommages d'accident. Ne versez pas d'acompte avant une inspection professionnelle ou un passage en carrosserie.",
  avoid: "Les photos montrent plusieurs signes préoccupants compatibles avec un accident ou des réparations. Il peut être plus prudent d'éviter ce véhicule, sauf si une inspection professionnelle confirme le contraire.",
  insufficient_photos: "Les photos fournies ne suffisent pas à une analyse fiable. Reprenez les photos signalées avec le véhicule entièrement visible et une bonne lumière.",
};

export const MECH_RECO_FR: Record<MechanicalRecommendation, string> = {
  normal: "Aucun problème mécanique évident n'a été signalé d'après les contrôles fournis. Cela ne garantit pas l'état du moteur.",
  monitor: "Quelques points méritent d'être surveillés. Demandez des précisions au vendeur et les factures d'entretien.",
  ask_seller_questions: "Certains éléments doivent être clarifiés avec le vendeur avant l'achat.",
  professional_inspection: "Plusieurs constats peuvent suggérer un problème mécanique. Une inspection par un mécanicien professionnel est recommandée avant l'achat.",
  avoid_without_diagnosis: "Des constats préoccupants ont été signalés. N'achetez pas sans un diagnostic mécanique professionnel.",
  insufficient_data: "Pas assez de contrôles mécaniques réalisés pour une évaluation fiable.",
};

export const ENGINE_AUDIO_RISK_FR: Record<string, string> = {
  low: "Son normal",
  moderate: "Risque faible à modéré",
  high: "Risque modéré à élevé",
  very_high: "Risque élevé",
  insufficient_audio: "Audio insuffisant",
};

export const ENGINE_AUDIO_RECO_FR: Record<string, string> = {
  normal_sound: "Le son de démarrage paraît normal dans l'audio fourni. Aucun bruit suspect évident. Cela ne garantit pas l'état du moteur.",
  monitor: "Quelques sons méritent d'être surveillés, mais rien de critique. Gardez-les en tête et demandez des précisions au vendeur.",
  ask_seller_questions: "Certains sons devraient être clarifiés avec le vendeur avant l'achat.",
  professional_inspection: "Des sons suspects peuvent suggérer un problème mécanique. Une inspection par un mécanicien est recommandée avant l'achat.",
  avoid_without_diagnosis: "Des sons préoccupants ont été détectés. N'achetez pas sans un diagnostic mécanique professionnel.",
  insufficient_audio: "L'audio ne suffit pas à une analyse fiable. Réenregistrez dans un endroit plus calme, moteur bien audible dès le démarrage.",
};

export const ENGINE_SOUND_FR: Record<string, string> = {
  hard_start: "Démarrage difficile",
  knocking: "Cognement",
  metallic_rattling: "Cliquetis métallique",
  timing_chain_rattle: "Bruit de chaîne de distribution",
  belt_squeal: "Couinement de courroie",
  rough_idle: "Ralenti instable",
  misfire_like_sound: "Bruit de ratés",
  starter_issue: "Problème de démarreur",
  exhaust_leak_suspicion: "Suspicion de fuite d'échappement",
  air_leak_suspicion: "Suspicion de prise d'air",
  turbo_whistle_abnormal: "Sifflement turbo anormal",
  normal_startup: "Démarrage normal",
  other: "Autre",
};

// Generic locale picker: FR map when fr, else the English fallback map.
export function pick<T extends string>(
  locale: Locale,
  key: T | null | undefined,
  frMap: Record<string, string>,
  enMap: Record<string, string>,
): string {
  if (!key) return "";
  return (locale === "fr" ? frMap[key] : enMap[key]) ?? enMap[key] ?? key;
}
