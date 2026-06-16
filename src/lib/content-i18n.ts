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
    title: "Fumée à l'échappement (vidéo)",
    instruction: "Filmez l'échappement au démarrage, au ralenti et lors d'un léger coup d'accélérateur. C'est la fumée épaisse persistante qui est suspecte.",
    why: "Blanche (joint de culasse/liquide), bleue (huile/turbo) ou noire (injecteurs/EGR/FAP) : chaque couleur indique un risque différent.",
    obs: { white_thick_persistent: "Fumée blanche épaisse et persistante", blue_smoke: "Fumée bleue", black_excessive: "Fumée noire excessive", light_vapor_cold: "Juste une légère vapeur blanche par temps froid (normal)", no_smoke: "Aucune fumée visible" },
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
    title: "Bruits au ralenti (vidéo)",
    instruction: "Filmez 30 s au ralenti, capot ouvert. Écoutez claquements, frottements, sifflements ou grincements.",
    why: "Des bruits qui augmentent avec le régime, un claquement à chaud ou des tremblements excessifs traduisent une usure mécanique.",
    obs: { metallic_knock: "Claquement métallique", rubbing: "Bruit de frottement", loud_whistle: "Sifflement fort", belt_squeal: "Couinement de courroie", engine_shakes: "Moteur qui tremble", unstable_idle: "Ralenti instable", smooth_idle: "Ralenti régulier et stable" },
  },
  acceleration: {
    title: "Accélération à l'arrêt (vidéo)",
    instruction: "Demandez au vendeur de monter doucement à ~2 500–3 000 tr/min pendant que vous filmez. Observez fumée, bruit et montée en régime.",
    why: "Fumée bleue/noire, à-coups, bruit métallique ou régime instable en charge révèlent des problèmes invisibles au ralenti.",
    obs: { blue_black_smoke: "Fumée bleue ou noire", engine_stumbles: "Le moteur broute / hésite", metallic_noise: "Bruit métallique", unstable_rpm: "Régime instable", smooth_pull: "Montée en régime fluide et propre" },
  },
  engine_temperature: {
    title: "Température moteur (photo après conduite)",
    instruction: "Après 10–15 min de conduite, photographiez la jauge / l'affichage de température.",
    why: "La température doit se stabiliser vers la normale (~90 °C sur beaucoup de voitures). Une montée rapide ou un message de surchauffe est un signal d'alerte.",
    obs: { temp_above_normal: "Température au-dessus de la normale", rising_fast: "Température qui monte vite", overheat_message: "Message de surchauffe affiché", fan_loud: "Ventilateur tournant anormalement fort", stable_normal: "Stable autour de la normale" },
  },
  turbo: {
    title: "Contrôle turbo (questions)",
    instruction: "Pour les voitures turbo (diesel ou essence), répondez à ceci. Ignorez si pas de turbo.",
    why: "Sifflement, perte de puissance, fumée bleue, huile autour des durites ou mode dégradé indiquent une usure du turbo.",
    obs: { loud_whistle: "Fort sifflement", lacks_power: "La voiture manque de puissance", blue_black_smoke: "Fumée bleue ou noire", oil_around_hoses: "Huile autour des durites / du turbo", limp_mode: "Le moteur passe en mode dégradé", not_turbo_or_ok: "Pas de turbo, ou aucun souci turbo constaté" },
  },
  fluid_after_test: {
    title: "Liquide sous la voiture après l'essai (photo)",
    instruction: "Après l'essai, laissez la voiture une minute, puis photographiez le sol en dessous.",
    why: "Une fuite qui n'apparaît qu'une fois le moteur chaud est un signal important.",
    obs: { oil_drops: "Gouttes d'huile", coolant: "Liquide de refroidissement", greasy_clear: "Liquide transparent gras", fuel_smell: "Odeur de carburant", none: "Rien sous la voiture" },
  },
  road_test: {
    title: "Essai routier (optionnel)",
    instruction: "Si vous pouvez conduire la voiture, notez ce que vous observez.",
    why: "Le comportement en charge réelle révèle perte de puissance, à-coups, surchauffe ou voyants.",
    obs: { car_sluggish: "Voiture qui semble molle", power_loss: "Perte de puissance", jerks: "À-coups / hésitations", smoke_in_mirror: "Fumée visible dans le rétroviseur", temp_rising: "Température qui monte anormalement", warning_light_appears: "Un voyant apparaît en roulant", burning_smell: "Odeur de brûlé", all_good: "A bien roulé, aucun souci" },
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
  buy: "Risque faible",
  negotiate: "Risque modéré",
  professional_inspection: "Risque élevé",
  avoid: "Risque très élevé",
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

export const _mechReco: MechanicalRecommendation | null = null; // (reserved)
