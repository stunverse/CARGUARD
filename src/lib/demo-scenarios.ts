// =====================================================================
// CarGuard AI — Fictional scenario reports (social-media / marketing).
//
// Each scenario is a FRENCH used car that looks clean in photos but hides a
// mechanical defect (turbo, bottom-end knock, head gasket, timing belt…).
// Used by /report-example?scenario=<id>. Fully fictional & bilingual.
// =====================================================================

import type {
  FinalReport,
  IssueType,
  MechanicalPointCode,
  PhotoPointCode,
  Severity,
} from "@/types";
import type { Locale } from "@/lib/i18n";
import { buildNegotiationSection } from "@/lib/negotiation";

type Bi = { en: string; fr: string };
type BiList = { en: string[]; fr: string[] };

// ---- Clean exterior photo set (the body looks fine — the defect is hidden) --
const CLEAN_PHOTOS: { code: PhotoPointCode; title: Bi; obs: BiList }[] = [
  { code: "front_view", title: { en: "Front view", fr: "Vue avant" }, obs: { en: ["Bumper, grille and badges aligned and consistent."], fr: ["Pare-chocs, calandre et logos alignés et cohérents."] } },
  { code: "rear_view", title: { en: "Rear view", fr: "Vue arrière" }, obs: { en: ["Tailgate gaps even on both sides."], fr: ["Jeux du hayon réguliers des deux côtés."] } },
  { code: "left_side_view", title: { en: "Left side", fr: "Côté gauche" }, obs: { en: ["Door gaps consistent; uniform paint reflection."], fr: ["Jeux de portes réguliers ; reflet de peinture uniforme."] } },
  { code: "right_side_view", title: { en: "Right side", fr: "Côté droit" }, obs: { en: ["No tone mismatch along the body line."], fr: ["Aucune différence de teinte le long de la ligne de caisse."] } },
  { code: "front_left_diagonal", title: { en: "Front-left 3/4", fr: "3/4 avant gauche" }, obs: { en: ["Panel gaps consistent around the front-left corner."], fr: ["Jeux entre panneaux cohérents à l'angle avant gauche."] } },
  { code: "front_right_diagonal", title: { en: "Front-right 3/4", fr: "3/4 avant droit" }, obs: { en: ["Fender and door alignment normal."], fr: ["Alignement aile/porte normal."] } },
  { code: "rear_left_diagonal", title: { en: "Rear-left 3/4", fr: "3/4 arrière gauche" }, obs: { en: ["Bumper-to-quarter gap even."], fr: ["Jeu pare-chocs/aile régulier."] } },
  { code: "rear_right_diagonal", title: { en: "Rear-right 3/4", fr: "3/4 arrière droit" }, obs: { en: ["Reflector seated correctly; no overspray."], fr: ["Catadioptre bien positionné ; pas de surpulvérisation."] } },
];

interface Scenario {
  id: string;
  label: Bi;
  vehicle: {
    make: string; model: string; year: number; generation?: string; trim?: string;
    engine: string; fuel_type: string; transmission: string;
    mileage: number; asking_price: number; city: string; vin: string;
  };
  risk_level: "low" | "moderate" | "high" | "very_high";
  recommendation: "buy" | "negotiate" | "professional_inspection" | "avoid";
  global_score: number;
  mechanical_score: number;
  confidence: number;
  market: { low: number; high: number; verdict: "fair" | "overpriced" | "underpriced" };
  ai_summary: Bi;
  positive: BiList;
  suspicious: BiList;
  seller_q: BiList;
  negotiation: BiList;
  next_steps: BiList;
  audio: {
    score: number; risk: "low" | "moderate" | "high" | "very_high"; rec: string;
    sound_type: string; severity: "low" | "moderate" | "high" | "critical"; summary: Bi;
  };
  mech: {
    score: number; risk: "low" | "moderate" | "high" | "very_high"; rec: string;
    summary: Bi;
    items: { code: MechanicalPointCode; title: Bi; score: number; sev: Severity; sus: BiList; sum: Bi }[];
  };
  history_note: Bi;
  // Optional overrides for non-engine defects:
  bodyScores?: Partial<{
    accident_repair_score: number; alignment_score: number; paint_tone_score: number;
    symmetry_score: number; bumpers_lights_score: number; overall_consistency_score: number;
  }>;
  photoIssues?: { code: PhotoPointCode; risk_score: number; severity: Exclude<Severity, "none">; issue_type: IssueType; location: Bi; explanation: Bi }[];
  mileageOverride?: { status: "ok" | "attention" | "suspicious"; avg_per_year: number; flags: string[]; note: Bi };
}

const SCENARIOS: Scenario[] = [
  // ---------- 1. Turbo HS ----------
  {
    id: "turbo",
    label: { en: "Failing turbo", fr: "Turbo HS" },
    vehicle: { make: "Peugeot", model: "308", year: 2018, generation: "T9", trim: "Allure", engine: "1.6 BlueHDi 120", fuel_type: "diesel", transmission: "manual", mileage: 142000, asking_price: 11900, city: "Lille", vin: "VF3LBBHZ0HS123456" },
    risk_level: "high", recommendation: "professional_inspection", global_score: 47, mechanical_score: 41, confidence: 84,
    market: { low: 8200, high: 10500, verdict: "overpriced" },
    ai_summary: {
      en: "The body of this 308 is clean and consistent, but the engine recording is a serious concern: a high-pitched whistle that rises with the revs, blue smoke thickening under acceleration, and a hesitant pull all point to a failing turbocharger. This is a costly repair (often €900–1,800 fitted). Treat the asking price as a starting point and have the turbo and intake checked by a mechanic before any purchase.",
      fr: "La carrosserie de cette 308 est propre et cohérente, mais l'enregistrement moteur est préoccupant : un sifflement aigu qui monte avec le régime, une fumée bleue qui s'épaissit à l'accélération et une montée en régime hésitante indiquent un turbo en fin de vie. La réparation est coûteuse (souvent 900–1 800 € posé). Considérez le prix comme un point de départ et faites contrôler le turbo et l'admission par un mécanicien avant tout achat.",
    },
    positive: {
      en: ["Bodywork clean and consistent, no repaint detected.", "No accident indicators on the panels.", "Interior wear consistent with the mileage."],
      fr: ["Carrosserie propre et cohérente, aucune réfection détectée.", "Aucun indice d'accident sur les panneaux.", "Usure intérieure cohérente avec le kilométrage."],
    },
    suspicious: {
      en: ["Turbo whistle rising with engine speed.", "Blue smoke that thickens under acceleration (oil burning).", "Noticeable power lag / hesitation when revving.", "Asking price above the fair range for the condition."],
      fr: ["Sifflement de turbo qui monte avec le régime.", "Fumée bleue qui s'épaissit à l'accélération (consommation d'huile).", "Temps de réponse / hésitation marqués à l'accélération.", "Prix demandé au-dessus de la fourchette pour l'état réel."],
    },
    seller_q: {
      en: ["Has the turbo or its actuator ever been replaced?", "Does the car burn oil — how often do you top it up?", "Do you have the recent oil-service invoices (turbo-critical)?", "Has it ever gone into limp mode?"],
      fr: ["Le turbo ou son actionneur a-t-il déjà été remplacé ?", "La voiture consomme-t-elle de l'huile — à quelle fréquence faites-vous l'appoint ?", "Avez-vous les factures de vidanges récentes (vital pour le turbo) ?", "Est-elle déjà passée en mode dégradé ?"],
    },
    negotiation: {
      en: ["Suspected turbo failure — quote €900–1,800 fitted and deduct it from the price.", "Oil consumption suggests further wear — factor in a margin.", "Asking price is above market for the real condition — anchor low."],
      fr: ["Turbo suspecté HS — chiffrez 900–1 800 € posé et déduisez-le du prix.", "La consommation d'huile suggère une usure plus large — gardez une marge.", "Prix au-dessus du marché pour l'état réel — ancrez bas."],
    },
    next_steps: {
      en: ["Have a mechanic test boost pressure and inspect the turbo/intake for oil.", "Check the intercooler and hoses for oil pooling.", "Re-test after a proper warm-up and a motorway pull."],
      fr: ["Faites tester la pression de suralimentation et inspecter le turbo/admission (présence d'huile).", "Vérifiez l'intercooler et les durites (huile stagnante).", "Refaites un essai après mise en température et reprise sur autoroute."],
    },
    audio: {
      score: 44, risk: "high", rec: "professional_inspection", sound_type: "turbo_whistle_abnormal", severity: "high",
      summary: { en: "An abnormal, rising turbo whistle is audible as the revs climb, with a brief hesitation before the engine picks up. Combined with blue smoke this is compatible with turbo wear (seals/bearing). A bench/road boost test is recommended.", fr: "Un sifflement de turbo anormal et croissant est audible à la montée en régime, avec une brève hésitation avant la reprise. Associé à la fumée bleue, cela est compatible avec une usure du turbo (joints/palier). Un test de suralimentation est recommandé." },
    },
    mech: {
      score: 41, risk: "high", rec: "professional_inspection",
      summary: { en: "Mechanical checks flag the forced-induction system: blue smoke that increases under load and an abnormal whistle. The rest (fluids, leaks, dashboard) is acceptable.", fr: "Les contrôles mécaniques pointent le système de suralimentation : fumée bleue qui augmente en charge et sifflement anormal. Le reste (fluides, fuites, voyants) est acceptable." },
      items: [
        { code: "cold_start", title: { en: "Cold start", fr: "Démarrage à froid" }, score: 72, sev: "low", sus: { en: [], fr: [] }, sum: { en: "Starts without excessive cranking; a faint whistle is already audible.", fr: "Démarre sans lancement excessif ; un léger sifflement est déjà audible." } },
        { code: "exhaust_smoke", title: { en: "Exhaust & rev-up", fr: "Échappement & montée en régime" }, score: 30, sev: "high", sus: { en: ["Blue smoke thickens when revving", "Whistle rises with rpm"], fr: ["La fumée bleue s'épaissit en accélérant", "Le sifflement monte avec le régime"] }, sum: { en: "Blue smoke and a rising whistle under rev strongly suggest turbo wear.", fr: "Fumée bleue et sifflement croissant en charge suggèrent fortement une usure du turbo." } },
        { code: "idle_noise", title: { en: "Idle noise", fr: "Bruits au ralenti" }, score: 66, sev: "low", sus: { en: [], fr: [] }, sum: { en: "Idle is fairly steady; faint whistle present.", fr: "Ralenti assez stable ; léger sifflement présent." } },
        { code: "oil_dipstick", title: { en: "Engine oil", fr: "Huile moteur" }, score: 60, sev: "moderate", sus: { en: ["Oil level on the low side"], fr: ["Niveau d'huile plutôt bas"] }, sum: { en: "Level low — consistent with oil consumption.", fr: "Niveau bas — cohérent avec une consommation d'huile." } },
      ],
    },
    history_note: { en: "This generation has known reports around the turbo and EGR on high-mileage diesels.", fr: "Cette génération fait l'objet de signalements connus autour du turbo et de l'EGR sur les diesels à fort kilométrage." },
  },

  // ---------- 2. Bottom-end knock ----------
  {
    id: "knock",
    label: { en: "Engine knock", fr: "Claquement moteur" },
    vehicle: { make: "Renault", model: "Clio IV", year: 2016, generation: "IV", trim: "Zen", engine: "1.5 dCi 90", fuel_type: "diesel", transmission: "manual", mileage: 171000, asking_price: 7490, city: "Marseille", vin: "VF15RBF0H54123456" },
    risk_level: "very_high", recommendation: "avoid", global_score: 28, mechanical_score: 22, confidence: 86,
    market: { low: 5200, high: 6800, verdict: "overpriced" },
    ai_summary: {
      en: "Visually this Clio is acceptable, but the engine sound is a red flag: a loud, regular metallic knock present at cold start and still there at idle. A deep, rhythmic knock that does not fade as the engine warms up can indicate bottom-end wear (bearings / con-rod) — potentially an engine rebuild or replacement. We strongly advise walking away unless a mechanic clears it first.",
      fr: "Visuellement, cette Clio est correcte, mais le son moteur est alarmant : un claquement métallique fort et régulier présent dès le démarrage à froid et toujours là au ralenti. Un claquement profond et rythmé qui ne disparaît pas à la montée en température peut traduire une usure du bas moteur (coussinets / bielle) — potentiellement une réfection ou un remplacement moteur. Nous déconseillons fortement l'achat sans avis d'un mécanicien.",
    },
    positive: {
      en: ["Body straight, no obvious accident repair.", "Tyres and brakes look serviceable."],
      fr: ["Carrosserie droite, pas de réparation d'accident évidente.", "Pneus et freins semblent exploitables."],
    },
    suspicious: {
      en: ["Loud, regular metallic knock at cold start.", "Knock persists at warm idle (does not fade).", "High mileage for a small diesel.", "Price well above value given the noise."],
      fr: ["Claquement métallique fort et régulier au démarrage à froid.", "Le claquement persiste au ralenti chaud (ne disparaît pas).", "Kilométrage élevé pour un petit diesel.", "Prix très au-dessus de la valeur compte tenu du bruit."],
    },
    seller_q: {
      en: ["When did the knock start and is it getting louder?", "What's the full oil-change history (intervals)?", "Has the engine or any internal part been worked on?", "Why are you selling?"],
      fr: ["Depuis quand le claquement est-il présent et s'aggrave-t-il ?", "Quel est l'historique complet des vidanges (intervalles) ?", "Le moteur ou une pièce interne a-t-il déjà été touché ?", "Pourquoi vendez-vous ?"],
    },
    negotiation: {
      en: ["Suspected bottom-end wear — an engine rebuild/replacement can exceed the car's value. Only buy at a salvage-level price, or not at all.", "Use the noise to justify a professional diagnosis before any deposit."],
      fr: ["Usure du bas moteur suspectée — une réfection/remplacement peut dépasser la valeur de la voiture. À n'acheter qu'à un prix « pour pièces », ou pas du tout.", "Utilisez le bruit pour exiger un diagnostic pro avant tout acompte."],
    },
    next_steps: {
      en: ["Do NOT buy before a mechanic locates the knock (stethoscope / oil pressure test).", "Ask for an oil analysis if records are missing."],
      fr: ["N'achetez PAS avant qu'un mécanicien localise le claquement (stéthoscope / test de pression d'huile).", "Demandez une analyse d'huile si l'historique manque."],
    },
    audio: {
      score: 18, risk: "very_high", rec: "avoid_without_diagnosis", sound_type: "knocking", severity: "critical",
      summary: { en: "A loud, regular knocking is clearly audible from cold and remains at idle. A deep rhythmic knock that doesn't fade with temperature is commonly associated with bearing/con-rod wear and warrants an immediate professional diagnosis before driving further.", fr: "Un claquement fort et régulier est nettement audible à froid et persiste au ralenti. Un claquement profond et rythmé qui ne s'atténue pas avec la température est souvent associé à une usure des coussinets/de la bielle et impose un diagnostic professionnel immédiat avant de rouler davantage." },
    },
    mech: {
      score: 22, risk: "very_high", rec: "avoid_without_diagnosis",
      summary: { en: "The dominant finding is a loud bottom-end knock from cold and at idle — a potentially terminal engine issue. Everything else is secondary until this is diagnosed.", fr: "Le constat dominant est un fort claquement de bas moteur à froid et au ralenti — un problème moteur potentiellement fatal. Tout le reste est secondaire tant que ce point n'est pas diagnostiqué." },
      items: [
        { code: "cold_start", title: { en: "Cold start", fr: "Démarrage à froid" }, score: 18, sev: "critical", sus: { en: ["Loud regular knocking"], fr: ["Claquement fort et régulier"] }, sum: { en: "Loud metallic knock from the first seconds — major red flag.", fr: "Claquement métallique fort dès les premières secondes — signal majeur." } },
        { code: "idle_noise", title: { en: "Idle noise", fr: "Bruits au ralenti" }, score: 20, sev: "critical", sus: { en: ["Metallic knock persists when warm"], fr: ["Le claquement métallique persiste à chaud"] }, sum: { en: "Knock does not fade as it warms up.", fr: "Le claquement ne disparaît pas à la montée en température." } },
        { code: "oil_dipstick", title: { en: "Engine oil", fr: "Huile moteur" }, score: 45, sev: "moderate", sus: { en: ["Oil very dark/old"], fr: ["Huile très foncée/ancienne"] }, sum: { en: "Oil looks overdue — poor lubrication accelerates bearing wear.", fr: "Huile visiblement en retard — une mauvaise lubrification accélère l'usure des coussinets." } },
      ],
    },
    history_note: { en: "1.5 dCi engines are robust but sensitive to oil-service neglect at high mileage.", fr: "Les moteurs 1.5 dCi sont robustes mais sensibles à un entretien d'huile négligé à fort kilométrage." },
  },

  // ---------- 3. Head gasket ----------
  {
    id: "head_gasket",
    label: { en: "Head gasket", fr: "Joint de culasse" },
    vehicle: { make: "Volkswagen", model: "Golf VII", year: 2015, generation: "Mk7", trim: "Confortline", engine: "1.4 TSI 122", fuel_type: "gasoline", transmission: "manual", mileage: 138000, asking_price: 9990, city: "Toulouse", vin: "WVWZZZAUZFW123456" },
    risk_level: "very_high", recommendation: "avoid", global_score: 33, mechanical_score: 26, confidence: 88,
    market: { low: 7800, high: 9600, verdict: "overpriced" },
    ai_summary: {
      en: "The exterior is clean, but several checks line up toward a head-gasket problem: a beige 'mayonnaise' emulsion under the oil filler cap, white smoke that lingers from the exhaust, and a coolant level that the seller admits to topping up. Together these are classic signs of coolant and oil mixing. Repairs are major (often €1,200–2,500+). Avoid unless a compression / CO₂-in-coolant test clears it.",
      fr: "L'extérieur est propre, mais plusieurs contrôles convergent vers un problème de joint de culasse : une émulsion beige « mayonnaise » sous le bouchon d'huile, une fumée blanche persistante à l'échappement et un niveau de liquide de refroidissement que le vendeur reconnaît compléter. Ensemble, ce sont des signes classiques d'un mélange eau/huile. La réparation est lourde (souvent 1 200–2 500 € et plus). À éviter sans test de compression / CO₂ dans le liquide de refroidissement.",
    },
    positive: {
      en: ["Bodywork tidy, gaps consistent.", "Interior and electronics functional."],
      fr: ["Carrosserie soignée, jeux cohérents.", "Intérieur et électronique fonctionnels."],
    },
    suspicious: {
      en: ["Beige 'mayonnaise' under the oil filler cap.", "Persistent white smoke from the exhaust.", "Coolant topped up regularly (admitted by seller).", "Asking price assumes a healthy engine."],
      fr: ["« Mayonnaise » beige sous le bouchon d'huile.", "Fumée blanche persistante à l'échappement.", "Appoints de liquide de refroidissement réguliers (reconnus par le vendeur).", "Le prix suppose un moteur sain."],
    },
    seller_q: {
      en: ["How often do you add coolant, and since when?", "Has the head gasket or head ever been worked on?", "Does the heater always blow hot, and does it overheat in traffic?", "Do you have recent service invoices?"],
      fr: ["À quelle fréquence ajoutez-vous du liquide de refroidissement, et depuis quand ?", "Le joint de culasse ou la culasse a-t-il déjà été touché ?", "Le chauffage souffle-t-il toujours chaud, et chauffe-t-il dans les bouchons ?", "Avez-vous des factures d'entretien récentes ?"],
    },
    negotiation: {
      en: ["Suspected head-gasket failure — obtain a repair quote (€1,200–2,500+) and deduct fully; this can also reveal a cracked head.", "Do not pay a deposit before a compression / CO₂ test."],
      fr: ["Joint de culasse suspecté HS — obtenez un devis (1 200–2 500 € et plus) et déduisez-le entièrement ; cela peut aussi révéler une culasse fissurée.", "Ne versez aucun acompte avant un test de compression / CO₂."],
    },
    next_steps: {
      en: ["Have a CO₂-in-coolant test and a compression/leak-down test performed.", "Inspect the oil and coolant for cross-contamination.", "Check for overheating on a longer drive."],
      fr: ["Faites réaliser un test de CO₂ dans le liquide de refroidissement et un test de compression/étanchéité.", "Inspectez l'huile et le liquide de refroidissement (contamination croisée).", "Vérifiez la surchauffe sur un trajet plus long."],
    },
    audio: {
      score: 52, risk: "moderate", rec: "professional_inspection", sound_type: "rough_idle", severity: "moderate",
      summary: { en: "Idle is slightly uneven with an occasional miss; nothing conclusive on sound alone, but combined with the visual coolant/oil signs a head-gasket test is strongly advised.", fr: "Le ralenti est légèrement irrégulier avec un raté occasionnel ; rien de concluant au son seul, mais associé aux indices visuels eau/huile, un test de joint de culasse est fortement conseillé." },
    },
    mech: {
      score: 26, risk: "very_high", rec: "avoid_without_diagnosis",
      summary: { en: "Multiple checks converge on a head-gasket problem: mayonnaise under the cap, white exhaust smoke and coolant loss. This is a major repair risk.", fr: "Plusieurs contrôles convergent vers un problème de joint de culasse : mayonnaise sous le bouchon, fumée blanche à l'échappement et perte de liquide de refroidissement. C'est un risque de réparation majeur." },
      items: [
        { code: "oil_cap", title: { en: "Oil filler cap", fr: "Bouchon d'huile" }, score: 14, sev: "critical", sus: { en: ["Beige mayonnaise deposit"], fr: ["Dépôt de mayonnaise beige"] }, sum: { en: "Emulsion under the cap — classic oil/coolant mixing sign.", fr: "Émulsion sous le bouchon — signe classique de mélange eau/huile." } },
        { code: "exhaust_smoke", title: { en: "Exhaust & rev-up", fr: "Échappement & montée en régime" }, score: 30, sev: "high", sus: { en: ["Persistent white smoke"], fr: ["Fumée blanche persistante"] }, sum: { en: "White smoke that lingers is consistent with burning coolant.", fr: "Une fumée blanche qui persiste est compatible avec la combustion de liquide de refroidissement." } },
        { code: "coolant", title: { en: "Coolant reservoir", fr: "Liquide de refroidissement" }, score: 34, sev: "high", sus: { en: ["Oily film / low level"], fr: ["Film huileux / niveau bas"] }, sum: { en: "Traces of oil and low level — consistent with a breach.", fr: "Traces d'huile et niveau bas — cohérent avec une fuite interne." } },
        { code: "engine_temperature", title: { en: "Engine temperature", fr: "Température moteur" }, score: 50, sev: "moderate", sus: { en: ["Temp rises in slow traffic"], fr: ["La température monte dans les bouchons"] }, sum: { en: "Tendency to run warm at low speed.", fr: "Tendance à chauffer à basse vitesse." } },
      ],
    },
    history_note: { en: "Early EA211 1.4 TSI units have occasional reports around cooling and timing components.", fr: "Les premiers blocs 1.4 TSI EA211 font l'objet de signalements occasionnels autour du refroidissement et de la distribution." },
  },

  // ---------- 4. Timing belt (wet-belt PureTech) ----------
  {
    id: "timing_belt",
    label: { en: "Timing belt wear", fr: "Distribution (courroie)" },
    vehicle: { make: "Citroën", model: "C3", year: 2018, generation: "III", trim: "Shine", engine: "1.2 PureTech 110", fuel_type: "gasoline", transmission: "manual", mileage: 96000, asking_price: 10490, city: "Nantes", vin: "VF7SXHNZ0JT123456" },
    risk_level: "high", recommendation: "professional_inspection", global_score: 51, mechanical_score: 45, confidence: 82,
    market: { low: 8400, high: 10100, verdict: "overpriced" },
    ai_summary: {
      en: "A clean, well-presented C3, but the 1.2 PureTech uses a 'wet' timing belt that degrades into the oil and is a known weak point. The recording has a faint rattle on start and the oil looks overdue, raising the risk of belt debris clogging the oil pump. If the belt service isn't documented, budget for it immediately (≈€700–1,200) and have the oil pump strainer checked.",
      fr: "Une C3 propre et bien présentée, mais le 1.2 PureTech utilise une courroie de distribution « humide » qui se dégrade dans l'huile et constitue un point faible connu. L'enregistrement présente un léger cliquetis au démarrage et l'huile semble en retard, ce qui augmente le risque de débris de courroie colmatant la pompe à huile. Si l'entretien de la distribution n'est pas documenté, prévoyez-le immédiatement (≈700–1 200 €) et faites contrôler la crépine de pompe à huile.",
    },
    positive: {
      en: ["Clean body and tidy interior for the mileage.", "No accident or repaint indicators."],
      fr: ["Carrosserie propre et intérieur soigné pour le kilométrage.", "Aucun indice d'accident ou de réfection."],
    },
    suspicious: {
      en: ["Faint timing rattle on start-up.", "Oil appears overdue (critical on this engine).", "Timing-belt service not documented.", "Price above value given the pending belt risk."],
      fr: ["Léger cliquetis de distribution au démarrage.", "Huile visiblement en retard (critique sur ce moteur).", "Entretien de la distribution non documenté.", "Prix au-dessus de la valeur compte tenu du risque distribution."],
    },
    seller_q: {
      en: ["When was the timing belt last changed (date + mileage + invoice)?", "What oil and interval do you use?", "Any oil-pressure warning, even briefly?", "Has the oil pump strainer ever been checked?"],
      fr: ["Quand la courroie de distribution a-t-elle été changée (date + km + facture) ?", "Quelle huile et quel intervalle utilisez-vous ?", "Un voyant de pression d'huile, même bref ?", "La crépine de pompe à huile a-t-elle déjà été contrôlée ?"],
    },
    negotiation: {
      en: ["No proof of belt service — deduct a full timing-belt + oil-pump-strainer job (≈€700–1,200).", "Anchor below asking given the documented weak point."],
      fr: ["Pas de preuve d'entretien distribution — déduisez une distribution complète + crépine (≈700–1 200 €).", "Ancrez sous le prix demandé compte tenu du point faible documenté."],
    },
    next_steps: {
      en: ["Get the timing belt and oil-pump strainer inspected immediately if undocumented.", "Do an oil and filter change with the correct spec.", "Listen again after warm-up for the rattle."],
      fr: ["Faites inspecter la courroie de distribution et la crépine sans attendre si non documentées.", "Réalisez une vidange huile + filtre à la bonne spécification.", "Réécoutez après mise en température pour le cliquetis."],
    },
    audio: {
      score: 58, risk: "moderate", rec: "professional_inspection", sound_type: "timing_chain_rattle", severity: "moderate",
      summary: { en: "A faint rattle is audible in the first seconds after start, fading once oil pressure builds. On a wet-belt engine this is worth taking seriously; verify the belt service history and oil condition.", fr: "Un léger cliquetis est audible dans les premières secondes après le démarrage, s'atténuant une fois la pression d'huile établie. Sur un moteur à courroie humide, c'est à prendre au sérieux ; vérifiez l'historique de la distribution et l'état de l'huile." },
    },
    mech: {
      score: 45, risk: "high", rec: "professional_inspection",
      summary: { en: "The engine runs, but the wet-belt design plus an undocumented service and tired oil raise a real preventive-repair risk.", fr: "Le moteur tourne, mais la conception à courroie humide, un entretien non documenté et une huile fatiguée font peser un vrai risque de réparation préventive." },
      items: [
        { code: "cold_start", title: { en: "Cold start", fr: "Démarrage à froid" }, score: 56, sev: "moderate", sus: { en: ["Faint rattle on start"], fr: ["Léger cliquetis au démarrage"] }, sum: { en: "Brief rattle until oil pressure builds.", fr: "Bref cliquetis jusqu'à l'établissement de la pression d'huile." } },
        { code: "oil_dipstick", title: { en: "Engine oil", fr: "Huile moteur" }, score: 40, sev: "moderate", sus: { en: ["Oil overdue / dark"], fr: ["Huile en retard / foncée"] }, sum: { en: "Old oil is especially risky on a wet-belt engine.", fr: "Une huile ancienne est particulièrement risquée sur un moteur à courroie humide." } },
        { code: "exhaust_smoke", title: { en: "Exhaust & rev-up", fr: "Échappement & montée en régime" }, score: 80, sev: "low", sus: { en: [], fr: [] }, sum: { en: "Clean rev, no abnormal smoke.", fr: "Montée en régime propre, pas de fumée anormale." } },
      ],
    },
    history_note: { en: "1.2 PureTech engines are widely reported for wet timing-belt wear; service history is essential.", fr: "Les moteurs 1.2 PureTech sont largement signalés pour l'usure de la courroie de distribution humide ; l'historique d'entretien est essentiel." },
  },

  // ---------- 5. DPF / EGR clogged ----------
  {
    id: "dpf",
    label: { en: "Clogged DPF/EGR", fr: "FAP/EGR colmaté" },
    vehicle: { make: "Peugeot", model: "3008", year: 2017, generation: "II", trim: "Active", engine: "1.6 BlueHDi 120", fuel_type: "diesel", transmission: "manual", mileage: 121000, asking_price: 14490, city: "Strasbourg", vin: "VF3MJBHZ0HS123456" },
    risk_level: "high", recommendation: "professional_inspection", global_score: 50, mechanical_score: 44, confidence: 83,
    market: { low: 11500, high: 13800, verdict: "overpriced" },
    ai_summary: {
      en: "A clean SUV mainly used in town — exactly the usage that clogs a diesel particulate filter. Black smoke under acceleration, an emissions warning light and a history of short trips point to a saturated DPF and possibly a sticking EGR valve. Regeneration or replacement can be costly. Confirm DPF soot load on a diagnostic tool before buying.",
      fr: "Un SUV propre surtout utilisé en ville — précisément l'usage qui colmate un filtre à particules diesel. Une fumée noire à l'accélération, un voyant antipollution et un historique de trajets courts évoquent un FAP saturé et possiblement une vanne EGR grippée. Régénération ou remplacement peuvent coûter cher. Faites vérifier le taux de suie du FAP à la valise avant l'achat.",
    },
    positive: { en: ["Clean, straight body.", "Interior in good condition."], fr: ["Carrosserie propre et droite.", "Intérieur en bon état."] },
    suspicious: { en: ["Black smoke under acceleration.", "Emissions/anti-pollution warning light.", "Mostly short urban trips (DPF-unfriendly).", "Price above value given the pending DPF risk."], fr: ["Fumée noire à l'accélération.", "Voyant antipollution allumé.", "Surtout des trajets urbains courts (mauvais pour le FAP).", "Prix au-dessus de la valeur compte tenu du risque FAP."] },
    seller_q: { en: ["Is the emissions light on now or intermittent?", "Mostly town or motorway driving?", "Has the DPF/EGR ever been cleaned or replaced?", "Any forced regenerations or limp mode?"], fr: ["Le voyant antipollution est-il allumé en permanence ou par intermittence ?", "Conduite surtout en ville ou sur autoroute ?", "Le FAP/EGR a-t-il déjà été nettoyé ou remplacé ?", "Des régénérations forcées ou des passages en mode dégradé ?"] },
    negotiation: { en: ["Pending DPF/EGR work — get a diagnostic and deduct cleaning/replacement (often €400–1,500).", "Anchor below asking given the warning light."], fr: ["Intervention FAP/EGR à prévoir — faites un diagnostic et déduisez le nettoyage/remplacement (souvent 400–1 500 €).", "Ancrez sous le prix demandé compte tenu du voyant."] },
    next_steps: { en: ["Read the DPF soot load and EGR fault codes with a diagnostic tool.", "Do a motorway run to attempt a regeneration and watch the light."], fr: ["Lisez le taux de suie du FAP et les codes EGR à la valise.", "Faites une reprise autoroute pour tenter une régénération et surveillez le voyant."] },
    audio: { score: 60, risk: "moderate", rec: "professional_inspection", sound_type: "rough_idle", severity: "moderate", summary: { en: "Idle is slightly rough; the main concern is visible black smoke and the emissions light rather than the sound itself.", fr: "Le ralenti est légèrement irrégulier ; l'essentiel du problème est la fumée noire visible et le voyant antipollution plutôt que le son lui-même." } },
    mech: {
      score: 44, risk: "high", rec: "professional_inspection",
      summary: { en: "Signs of a saturated DPF and possibly a sticking EGR: black smoke and an emissions light. Engine internals seem otherwise fine.", fr: "Signes d'un FAP saturé et possiblement d'une EGR grippée : fumée noire et voyant antipollution. La mécanique interne semble par ailleurs correcte." },
      items: [
        { code: "dashboard_lights", title: { en: "Dashboard lights", fr: "Voyants tableau de bord" }, score: 40, sev: "high", sus: { en: ["Emissions warning light on"], fr: ["Voyant antipollution allumé"] }, sum: { en: "Emissions light stayed on after start.", fr: "Le voyant antipollution est resté allumé après démarrage." } },
        { code: "exhaust_smoke", title: { en: "Exhaust & rev-up", fr: "Échappement & montée en régime" }, score: 42, sev: "high", sus: { en: ["Excessive black smoke when revving"], fr: ["Fumée noire excessive en accélérant"] }, sum: { en: "Black smoke under load — consistent with DPF/EGR issues.", fr: "Fumée noire en charge — cohérent avec un problème FAP/EGR." } },
      ],
    },
    history_note: { en: "Town-used diesels frequently suffer DPF saturation; check the regeneration history.", fr: "Les diesels utilisés en ville souffrent souvent de saturation du FAP ; vérifiez l'historique de régénération." },
  },

  // ---------- 6. DSG / automatic gearbox ----------
  {
    id: "gearbox",
    label: { en: "Jerky auto gearbox", fr: "Boîte auto à-coups" },
    vehicle: { make: "Volkswagen", model: "Passat", year: 2016, generation: "B8", trim: "Comfortline", engine: "2.0 TDI 150 DSG", fuel_type: "diesel", transmission: "automatic", mileage: 158000, asking_price: 13990, city: "Bordeaux", vin: "WVWZZZ3CZGE123456" },
    risk_level: "high", recommendation: "professional_inspection", global_score: 52, mechanical_score: 47, confidence: 80,
    market: { low: 11000, high: 13200, verdict: "overpriced" },
    ai_summary: {
      en: "Engine sounds healthy, but the dual-clutch (DSG) gearbox jerks and hesitates at low speed and when pulling away — a classic sign of mechatronic/clutch-pack wear. DSG repairs are expensive (mechatronic or clutch packs often €1,200–2,500). Confirm the gearbox oil-service history and have the transmission fault memory read.",
      fr: "Le moteur semble sain, mais la boîte à double embrayage (DSG) présente des à-coups et des hésitations à basse vitesse et au démarrage — un signe classique d'usure de la mécatronique/des embrayages. Les réparations DSG sont coûteuses (mécatronique ou embrayages souvent 1 200–2 500 €). Vérifiez l'historique de vidange de boîte et faites lire la mémoire de défauts de la transmission.",
    },
    positive: { en: ["Clean body and interior.", "Engine starts and idles normally."], fr: ["Carrosserie et intérieur propres.", "Le moteur démarre et tourne normalement au ralenti."] },
    suspicious: { en: ["Jerks/hesitation at low speed and when pulling away.", "Possible mechatronic/clutch-pack wear (DSG).", "No proof of gearbox oil service.", "Price assumes a healthy transmission."], fr: ["À-coups/hésitations à basse vitesse et au démarrage.", "Usure possible mécatronique/embrayages (DSG).", "Pas de preuve de vidange de boîte.", "Le prix suppose une transmission saine."] },
    seller_q: { en: ["When was the DSG oil/filter last serviced?", "Does it jerk when cold, warm, or both?", "Any gearbox warning or 'gearbox fault' message?", "Has the mechatronic unit been replaced?"], fr: ["Quand la vidange/filtre de la DSG a-t-elle été faite ?", "Les à-coups apparaissent-ils à froid, à chaud, ou les deux ?", "Un voyant ou message « défaut boîte » ?", "La mécatronique a-t-elle été remplacée ?"] },
    negotiation: { en: ["Suspected DSG wear — get the fault memory read and quote mechatronic/clutch work; deduct it.", "Anchor low; DSG repairs can approach the car's value."], fr: ["Usure DSG suspectée — faites lire la mémoire de défauts et chiffrez mécatronique/embrayages ; déduisez-le.", "Ancrez bas ; une réparation DSG peut approcher la valeur de la voiture."] },
    next_steps: { en: ["Have the transmission fault memory read on a diagnostic tool.", "Test at low speed in traffic for jerks; insist on a long enough drive."], fr: ["Faites lire la mémoire de défauts de la transmission à la valise.", "Testez à basse vitesse dans le trafic pour les à-coups ; exigez un essai assez long."] },
    audio: { score: 80, risk: "low", rec: "normal_sound", sound_type: "normal_startup", severity: "low", summary: { en: "Engine start and idle are normal — the problem is in the gearbox behaviour, not the engine sound.", fr: "Le démarrage et le ralenti moteur sont normaux — le problème est dans le comportement de la boîte, pas dans le son moteur." } },
    mech: {
      score: 47, risk: "high", rec: "professional_inspection",
      summary: { en: "Engine checks are reassuring; the road test reveals transmission jerks consistent with DSG wear.", fr: "Les contrôles moteur sont rassurants ; l'essai révèle des à-coups de transmission cohérents avec une usure DSG." },
      items: [
        { code: "road_test", title: { en: "Road test", fr: "Essai routier" }, score: 38, sev: "high", sus: { en: ["Jerks / hesitation when driving"], fr: ["À-coups / hésitations en roulant"] }, sum: { en: "Noticeable jerks at low speed and pulling away.", fr: "À-coups nets à basse vitesse et au démarrage." } },
        { code: "cold_start", title: { en: "Cold start", fr: "Démarrage à froid" }, score: 82, sev: "low", sus: { en: [], fr: [] }, sum: { en: "Engine starts cleanly.", fr: "Le moteur démarre proprement." } },
      ],
    },
    history_note: { en: "High-mileage DSG units need regular oil service; mechatronic wear is well documented.", fr: "Les DSG à fort kilométrage nécessitent une vidange régulière ; l'usure de la mécatronique est bien documentée." },
  },

  // ---------- 7. Clutch + dual-mass flywheel ----------
  {
    id: "clutch",
    label: { en: "Worn clutch / DMF", fr: "Embrayage / volant moteur" },
    vehicle: { make: "Renault", model: "Mégane III", year: 2014, generation: "III", trim: "Dynamique", engine: "1.5 dCi 110", fuel_type: "diesel", transmission: "manual", mileage: 164000, asking_price: 6990, city: "Rennes", vin: "VF1BZ0H0H51123456" },
    risk_level: "high", recommendation: "professional_inspection", global_score: 49, mechanical_score: 43, confidence: 81,
    market: { low: 5200, high: 6500, verdict: "overpriced" },
    ai_summary: {
      en: "The engine is acceptable, but there's a rattle at idle that calms when the clutch is pressed (typical dual-mass flywheel), plus a slipping, juddering clutch take-up reported on the road test. A clutch + dual-mass flywheel job is a big expense (often €900–1,500). Budget for it unless there's recent proof it was done.",
      fr: "Le moteur est correct, mais on entend un cliquetis au ralenti qui se calme en appuyant sur l'embrayage (typique du volant moteur bi-masse), ainsi qu'un embrayage qui patine et broute à l'embrayage signalé lors de l'essai. Un kit embrayage + volant bi-masse est une grosse dépense (souvent 900–1 500 €). Prévoyez-le sauf preuve récente qu'il a été fait.",
    },
    positive: { en: ["Body honest for the age.", "Engine runs without smoke."], fr: ["Carrosserie honnête pour l'âge.", "Le moteur tourne sans fumée."] },
    suspicious: { en: ["Rattle at idle that quiets with the clutch pressed (DMF).", "Clutch slips / judders on take-up.", "High mileage.", "Price above value given the clutch risk."], fr: ["Cliquetis au ralenti qui se calme embrayage enfoncé (volant bi-masse).", "L'embrayage patine / broute à l'embrayage.", "Kilométrage élevé.", "Prix au-dessus de la valeur compte tenu du risque embrayage."] },
    seller_q: { en: ["Has the clutch or dual-mass flywheel been replaced?", "Does the rattle change when you press the clutch?", "Any slipping when accelerating in high gear?", "Do you have the invoices?"], fr: ["L'embrayage ou le volant bi-masse a-t-il été remplacé ?", "Le cliquetis change-t-il quand on appuie sur l'embrayage ?", "Patine-t-il en accélérant sur un rapport élevé ?", "Avez-vous les factures ?"] },
    negotiation: { en: ["Suspected clutch + DMF wear — deduct a full kit (≈€900–1,500).", "Use the road-test judder as leverage."], fr: ["Usure embrayage + volant bi-masse suspectée — déduisez un kit complet (≈900–1 500 €).", "Utilisez le broutage à l'essai comme levier."] },
    next_steps: { en: ["Have a mechanic confirm clutch slip and DMF play.", "Test take-up on an incline in high gear."], fr: ["Faites confirmer le patinage et le jeu du volant bi-masse par un mécanicien.", "Testez l'embrayage en côte sur un rapport élevé."] },
    audio: { score: 56, risk: "moderate", rec: "professional_inspection", sound_type: "metallic_rattling", severity: "moderate", summary: { en: "A metallic rattle is audible at idle and tends to quiet when the clutch is pressed — a common dual-mass flywheel symptom. Have it confirmed mechanically.", fr: "Un cliquetis métallique est audible au ralenti et tend à se calmer lorsque l'embrayage est enfoncé — symptôme courant du volant bi-masse. À faire confirmer mécaniquement." } },
    mech: {
      score: 43, risk: "high", rec: "professional_inspection",
      summary: { en: "Idle rattle plus a slipping/juddering clutch on the road test point to a clutch + dual-mass flywheel job.", fr: "Cliquetis au ralenti et embrayage qui patine/broute à l'essai pointent vers un kit embrayage + volant bi-masse." },
      items: [
        { code: "idle_noise", title: { en: "Idle noise", fr: "Bruits au ralenti" }, score: 48, sev: "moderate", sus: { en: ["Rattle quiets with clutch pressed"], fr: ["Cliquetis qui se calme embrayage enfoncé"] }, sum: { en: "Typical dual-mass flywheel rattle.", fr: "Cliquetis typique du volant bi-masse." } },
        { code: "road_test", title: { en: "Road test", fr: "Essai routier" }, score: 40, sev: "high", sus: { en: ["Clutch slips / judders"], fr: ["L'embrayage patine / broute"] }, sum: { en: "Slipping and judder on take-up.", fr: "Patinage et broutage à l'embrayage." } },
      ],
    },
    history_note: { en: "1.5 dCi clutches/DMF are common wear items at this mileage.", fr: "Les embrayages/volants bi-masse des 1.5 dCi sont des pièces d'usure courantes à ce kilométrage." },
  },

  // ---------- 8. Diesel injectors ----------
  {
    id: "injectors",
    label: { en: "Faulty injectors", fr: "Injecteurs HS" },
    vehicle: { make: "Renault", model: "Scénic III", year: 2015, generation: "III", trim: "Bose", engine: "1.5 dCi 110", fuel_type: "diesel", transmission: "manual", mileage: 149000, asking_price: 7990, city: "Dijon", vin: "VF1JZ0H0H52123456" },
    risk_level: "high", recommendation: "professional_inspection", global_score: 46, mechanical_score: 40, confidence: 82,
    market: { low: 6000, high: 7400, verdict: "overpriced" },
    ai_summary: {
      en: "Hard to start, a shaky, uneven idle and a diesel 'knock' that's louder than normal suggest worn or leaking injectors. White-ish smoke and hunting idle reinforce it. Injector replacement on common-rail diesels is expensive (often €250–500 per injector). Have an injector leak-back / balancing test done before buying.",
      fr: "Un démarrage difficile, un ralenti tremblant et irrégulier et un « cognement » diesel plus fort que la normale évoquent des injecteurs usés ou qui fuient. Une fumée blanchâtre et un ralenti qui chasse le confirment. Le remplacement d'injecteurs sur un common-rail est coûteux (souvent 250–500 € par injecteur). Faites réaliser un test de retour/équilibrage des injecteurs avant l'achat.",
    },
    positive: { en: ["Body and interior reasonable.", "No accident indicators."], fr: ["Carrosserie et intérieur corrects.", "Aucun indice d'accident."] },
    suspicious: { en: ["Hard / long cold start.", "Rough, hunting idle.", "Louder-than-normal diesel knock.", "Price above value given the injector risk."], fr: ["Démarrage à froid long / difficile.", "Ralenti irrégulier qui chasse.", "Cognement diesel plus fort que la normale.", "Prix au-dessus de la valeur compte tenu du risque injecteurs."] },
    seller_q: { en: ["Have any injectors been replaced recently?", "Is it harder to start when cold?", "Any black/white smoke or fuel smell?", "Recent fuel-filter change?"], fr: ["Des injecteurs ont-ils été remplacés récemment ?", "Le démarrage est-il plus difficile à froid ?", "De la fumée noire/blanche ou une odeur de carburant ?", "Filtre à carburant changé récemment ?"] },
    negotiation: { en: ["Suspected injector wear — quote a leak-back test + injectors and deduct it.", "Anchor low given the rough running."], fr: ["Usure d'injecteurs suspectée — chiffrez un test de retour + injecteurs et déduisez-le.", "Ancrez bas compte tenu du fonctionnement irrégulier."] },
    next_steps: { en: ["Have an injector leak-back / balancing test performed.", "Replace the fuel filter and re-assess."], fr: ["Faites réaliser un test de retour/équilibrage des injecteurs.", "Remplacez le filtre à carburant et réévaluez."] },
    audio: { score: 42, risk: "high", rec: "professional_inspection", sound_type: "rough_idle", severity: "high", summary: { en: "A rough, hunting idle with a pronounced diesel knock is audible, and starting takes longer than expected — compatible with worn or leaking injectors. An injector test is recommended.", fr: "Un ralenti irrégulier qui chasse avec un cognement diesel prononcé est audible, et le démarrage est plus long que prévu — compatible avec des injecteurs usés ou qui fuient. Un test d'injecteurs est recommandé." } },
    mech: {
      score: 40, risk: "high", rec: "professional_inspection",
      summary: { en: "Hard starting, rough idle and a loud diesel knock converge toward an injection-system problem.", fr: "Démarrage difficile, ralenti irrégulier et fort cognement diesel convergent vers un problème du système d'injection." },
      items: [
        { code: "cold_start", title: { en: "Cold start", fr: "Démarrage à froid" }, score: 40, sev: "high", sus: { en: ["Long to start", "Knock at start"], fr: ["Long à démarrer", "Cognement au démarrage"] }, sum: { en: "Extended cranking with a pronounced knock.", fr: "Lancement prolongé avec un cognement prononcé." } },
        { code: "idle_noise", title: { en: "Idle noise", fr: "Bruits au ralenti" }, score: 42, sev: "high", sus: { en: ["Rough, hunting idle"], fr: ["Ralenti irrégulier qui chasse"] }, sum: { en: "Uneven idle consistent with injector wear.", fr: "Ralenti irrégulier cohérent avec une usure d'injecteurs." } },
      ],
    },
    history_note: { en: "Common-rail injectors are a known wear/expense item on high-mileage diesels.", fr: "Les injecteurs common-rail sont un poste d'usure/coût connu sur les diesels à fort kilométrage." },
  },

  // ---------- 9. Cooling system / overheating ----------
  {
    id: "cooling",
    label: { en: "Overheating", fr: "Surchauffe / refroidissement" },
    vehicle: { make: "Peugeot", model: "207", year: 2012, generation: "A7", trim: "Active", engine: "1.6 VTi 120", fuel_type: "gasoline", transmission: "manual", mileage: 127000, asking_price: 4990, city: "Reims", vin: "VF3WC5FW0CT123456" },
    risk_level: "high", recommendation: "professional_inspection", global_score: 48, mechanical_score: 42, confidence: 80,
    market: { low: 3600, high: 4700, verdict: "overpriced" },
    ai_summary: {
      en: "No oil/coolant mixing signs, but the temperature climbs above normal in slow traffic and the coolant level is low — pointing to the cooling system itself (water pump, thermostat, radiator or fan). Left unchecked, overheating can destroy the engine. Have the cooling system pressure-tested before buying.",
      fr: "Pas de signe de mélange eau/huile, mais la température monte au-dessus de la normale dans les bouchons et le niveau de liquide de refroidissement est bas — cela pointe vers le circuit de refroidissement lui-même (pompe à eau, thermostat, radiateur ou ventilateur). Non traitée, une surchauffe peut détruire le moteur. Faites réaliser un test de pression du circuit de refroidissement avant l'achat.",
    },
    positive: { en: ["Tidy small car, honest body.", "Oil and oil cap look clean (no mayonnaise)."], fr: ["Petite voiture soignée, carrosserie honnête.", "Huile et bouchon d'huile propres (pas de mayonnaise)."] },
    suspicious: { en: ["Temperature rises above normal in slow traffic.", "Coolant level low.", "Possible water pump / thermostat / fan fault.", "Risk of engine damage if it overheats."], fr: ["La température monte au-dessus de la normale dans les bouchons.", "Niveau de liquide de refroidissement bas.", "Défaut possible pompe à eau / thermostat / ventilateur.", "Risque de casse moteur en cas de surchauffe."] },
    seller_q: { en: ["Does it overheat in traffic or on the motorway?", "When was the coolant last changed / topped up?", "Has the water pump or thermostat been replaced?", "Does the cooling fan kick in?"], fr: ["Chauffe-t-elle dans les bouchons ou sur autoroute ?", "Quand le liquide de refroidissement a-t-il été changé / complété ?", "La pompe à eau ou le thermostat ont-ils été remplacés ?", "Le ventilateur se déclenche-t-il ?"] },
    negotiation: { en: ["Pending cooling repair — quote pump/thermostat/radiator and deduct it.", "Anchor low; overheating risk is serious."], fr: ["Réparation refroidissement à prévoir — chiffrez pompe/thermostat/radiateur et déduisez-le.", "Ancrez bas ; le risque de surchauffe est sérieux."] },
    next_steps: { en: ["Pressure-test the cooling system and check the fan operation.", "Inspect the water pump and thermostat."], fr: ["Faites un test de pression du circuit et vérifiez le fonctionnement du ventilateur.", "Inspectez la pompe à eau et le thermostat."] },
    audio: { score: 78, risk: "low", rec: "normal_sound", sound_type: "normal_startup", severity: "low", summary: { en: "Engine sound is normal — the concern is the temperature behaviour and low coolant, not the engine noise.", fr: "Le son moteur est normal — le souci est le comportement en température et le niveau bas de liquide de refroidissement, pas le bruit moteur." } },
    mech: {
      score: 42, risk: "high", rec: "professional_inspection",
      summary: { en: "Temperature rises above normal at low speed with a low coolant level — a cooling-system fault that risks the engine.", fr: "La température monte au-dessus de la normale à basse vitesse avec un niveau de liquide bas — un défaut du circuit de refroidissement qui met le moteur en danger." },
      items: [
        { code: "engine_temperature", title: { en: "Engine temperature", fr: "Température moteur" }, score: 38, sev: "high", sus: { en: ["Temperature above normal in traffic"], fr: ["Température au-dessus de la normale dans les bouchons"] }, sum: { en: "Runs hot at low speed.", fr: "Chauffe à basse vitesse." } },
        { code: "coolant", title: { en: "Coolant reservoir", fr: "Liquide de refroidissement" }, score: 50, sev: "moderate", sus: { en: ["Level low"], fr: ["Niveau bas"] }, sum: { en: "Low coolant — find where it goes.", fr: "Niveau bas — trouvez où il part." } },
      ],
    },
    history_note: { en: "Prince (EP6) 1.6 engines have known cooling and timing weaknesses.", fr: "Les moteurs 1.6 Prince (EP6) ont des faiblesses connues de refroidissement et de distribution." },
  },

  // ---------- 10. Major oil leak ----------
  {
    id: "oil_leak",
    label: { en: "Major oil leak", fr: "Fuite d'huile importante" },
    vehicle: { make: "Audi", model: "A3", year: 2014, generation: "8V", trim: "Ambition", engine: "2.0 TDI 150", fuel_type: "diesel", transmission: "manual", mileage: 156000, asking_price: 11990, city: "Grenoble", vin: "WAUZZZ8V0EA123456" },
    risk_level: "high", recommendation: "professional_inspection", global_score: 52, mechanical_score: 46, confidence: 82,
    market: { low: 9500, high: 11200, verdict: "overpriced" },
    ai_summary: {
      en: "Presentable A3, but there's an active oil leak: oily film around the engine, a low dipstick level and fresh drips under the car after the test. The source (crank seal, oil cooler or sump gasket) needs identifying — some are cheap, others labour-intensive. Don't ignore it: oil starvation damages engines.",
      fr: "A3 présentable, mais une fuite d'huile active est constatée : film huileux autour du moteur, niveau de jauge bas et gouttes fraîches sous la voiture après l'essai. La source (joint spi, échangeur huile ou joint de carter) doit être identifiée — certaines sont peu coûteuses, d'autres demandent beaucoup de main-d'œuvre. À ne pas négliger : un manque d'huile endommage le moteur.",
    },
    positive: { en: ["Clean body, no repaint.", "Engine runs and idles fine."], fr: ["Carrosserie propre, pas de réfection.", "Le moteur tourne et ralentit correctement."] },
    suspicious: { en: ["Oily film around the engine.", "Low oil level on the dipstick.", "Fresh oil drips under the car after driving.", "Price above value given the leak."], fr: ["Film huileux autour du moteur.", "Niveau d'huile bas à la jauge.", "Gouttes d'huile fraîches sous la voiture après conduite.", "Prix au-dessus de la valeur compte tenu de la fuite."] },
    seller_q: { en: ["Where is the leak coming from — has it been diagnosed?", "How much oil do you add between services?", "Any oil-pressure warning?", "Recent engine work near the seals?"], fr: ["D'où vient la fuite — a-t-elle été diagnostiquée ?", "Combien d'huile ajoutez-vous entre les vidanges ?", "Un voyant de pression d'huile ?", "Travaux moteur récents près des joints ?"] },
    negotiation: { en: ["Active oil leak — get the source diagnosed and deduct the repair.", "Anchor low; oil starvation risk supports a strong discount."], fr: ["Fuite d'huile active — faites diagnostiquer la source et déduisez la réparation.", "Ancrez bas ; le risque de manque d'huile justifie une forte remise."] },
    next_steps: { en: ["Have the leak source located (degrease + UV dye if needed).", "Check oil level frequently until repaired."], fr: ["Faites localiser la source de la fuite (dégraissage + traceur UV si besoin).", "Surveillez le niveau d'huile fréquemment jusqu'à réparation."] },
    audio: { score: 76, risk: "low", rec: "normal_sound", sound_type: "normal_startup", severity: "low", summary: { en: "Engine sound is normal; the issue is a physical oil leak rather than an internal noise.", fr: "Le son moteur est normal ; le problème est une fuite d'huile physique plutôt qu'un bruit interne." } },
    mech: {
      score: 46, risk: "high", rec: "professional_inspection",
      summary: { en: "An active oil leak with a low level and fresh drips after the drive — locate the source before it starves the engine.", fr: "Une fuite d'huile active avec niveau bas et gouttes fraîches après l'essai — localisez la source avant qu'elle ne prive le moteur d'huile." },
      items: [
        { code: "leaks_under_engine", title: { en: "Leaks under engine", fr: "Fuites sous le moteur" }, score: 36, sev: "high", sus: { en: ["Oily film around the engine"], fr: ["Film huileux autour du moteur"] }, sum: { en: "Visible oil seepage in the engine bay.", fr: "Suintement d'huile visible dans le compartiment moteur." } },
        { code: "fluid_after_test", title: { en: "Fluid after the drive", fr: "Liquide après l'essai" }, score: 40, sev: "high", sus: { en: ["Fresh oil drops under the car"], fr: ["Gouttes d'huile fraîches sous la voiture"] }, sum: { en: "Active drip once hot.", fr: "Fuite active une fois chaud." } },
        { code: "oil_dipstick", title: { en: "Engine oil", fr: "Huile moteur" }, score: 52, sev: "moderate", sus: { en: ["Level low"], fr: ["Niveau bas"] }, sum: { en: "Low level confirms ongoing loss.", fr: "Niveau bas confirmant une perte continue." } },
      ],
    },
    history_note: { en: "2.0 TDI engines can leak from the oil cooler / seals at high mileage.", fr: "Les moteurs 2.0 TDI peuvent fuir au niveau de l'échangeur d'huile / des joints à fort kilométrage." },
  },

  // ---------- 11. Alternator / charging ----------
  {
    id: "alternator",
    label: { en: "Charging fault", fr: "Alternateur / charge" },
    vehicle: { make: "Renault", model: "Captur", year: 2017, generation: "I", trim: "Intens", engine: "0.9 TCe 90", fuel_type: "gasoline", transmission: "manual", mileage: 98000, asking_price: 9490, city: "Tours", vin: "VF1RJB00H56123456" },
    risk_level: "moderate", recommendation: "negotiate", global_score: 58, mechanical_score: 55, confidence: 81,
    market: { low: 8000, high: 9300, verdict: "overpriced" },
    ai_summary: {
      en: "Mechanically sound overall, but the battery/charge warning light stays on and there's a faint belt squeal — pointing to a charging fault (alternator or its belt). It's usually a moderate repair (€200–600), but a failing alternator can leave you stranded. Confirm charging voltage before buying and use it to negotiate.",
      fr: "Globalement saine mécaniquement, mais le voyant batterie/charge reste allumé et un léger couinement de courroie est présent — cela pointe vers un défaut de charge (alternateur ou sa courroie). C'est généralement une réparation modérée (200–600 €), mais un alternateur HS peut vous laisser en panne. Vérifiez la tension de charge avant l'achat et utilisez-le pour négocier.",
    },
    positive: { en: ["Clean, low-ish mileage for the year.", "Engine runs smoothly."], fr: ["Propre, kilométrage raisonnable pour l'année.", "Le moteur tourne en douceur."] },
    suspicious: { en: ["Battery/charge warning light on.", "Faint belt squeal.", "Possible alternator or belt fault.", "Asking price a touch high."], fr: ["Voyant batterie/charge allumé.", "Léger couinement de courroie.", "Défaut possible alternateur ou courroie.", "Prix demandé un peu élevé."] },
    seller_q: { en: ["When did the battery light come on?", "Has the battery or alternator been replaced?", "Any electrical glitches (lights dimming)?", "Is the accessory belt original?"], fr: ["Depuis quand le voyant batterie est-il allumé ?", "La batterie ou l'alternateur ont-ils été remplacés ?", "Des soucis électriques (phares qui faiblissent) ?", "La courroie d'accessoires est-elle d'origine ?"] },
    negotiation: { en: ["Charging fault — confirm voltage and deduct an alternator/belt job (€200–600).", "Modest leverage on the price."], fr: ["Défaut de charge — vérifiez la tension et déduisez un alternateur/courroie (200–600 €).", "Levier modéré sur le prix."] },
    next_steps: { en: ["Measure charging voltage at idle and under load.", "Inspect the accessory belt and tensioner."], fr: ["Mesurez la tension de charge au ralenti et en charge.", "Inspectez la courroie d'accessoires et le galet tendeur."] },
    audio: { score: 64, risk: "moderate", rec: "monitor", sound_type: "belt_squeal", severity: "moderate", summary: { en: "A faint belt squeal is audible at idle, which can accompany a worn accessory belt or a failing alternator pulley. Have the charging system checked.", fr: "Un léger couinement de courroie est audible au ralenti, ce qui peut accompagner une courroie d'accessoires usée ou une poulie d'alternateur en fin de vie. Faites contrôler le système de charge." } },
    mech: {
      score: 55, risk: "moderate", rec: "ask_seller_questions",
      summary: { en: "A charge warning light and a belt squeal suggest an alternator/belt issue; the rest is sound.", fr: "Un voyant de charge et un couinement de courroie suggèrent un souci alternateur/courroie ; le reste est sain." },
      items: [
        { code: "dashboard_lights", title: { en: "Dashboard lights", fr: "Voyants tableau de bord" }, score: 48, sev: "moderate", sus: { en: ["Battery / charge light on"], fr: ["Voyant batterie / charge allumé"] }, sum: { en: "Charge light stayed on after start.", fr: "Le voyant de charge est resté allumé après démarrage." } },
        { code: "idle_noise", title: { en: "Idle noise", fr: "Bruits au ralenti" }, score: 60, sev: "moderate", sus: { en: ["Belt squeal"], fr: ["Couinement de courroie"] }, sum: { en: "Faint squeal from the accessory belt area.", fr: "Léger couinement vers la courroie d'accessoires." } },
      ],
    },
    history_note: { en: "0.9 TCe cars occasionally show charging and accessory-belt wear.", fr: "Les 0.9 TCe montrent parfois une usure de la charge et de la courroie d'accessoires." },
  },

  // ---------- 12. Mileage rollback (fraud) ----------
  {
    id: "rollback",
    label: { en: "Mileage rollback", fr: "Compteur trafiqué" },
    vehicle: { make: "Peugeot", model: "508", year: 2015, generation: "I", trim: "Allure", engine: "2.0 HDi 150", fuel_type: "diesel", transmission: "manual", mileage: 96000, asking_price: 11990, city: "Paris", vin: "VF38R9HR0FL123456" },
    risk_level: "high", recommendation: "avoid", global_score: 40, mechanical_score: 70, confidence: 85,
    market: { low: 9000, high: 11000, verdict: "overpriced" },
    ai_summary: {
      en: "The car drives well, but the numbers don't add up: the displayed 96,000 km clashes with the wear (pedals, seat, steering wheel) and with a service invoice showing a higher reading two years ago. This is a classic mileage rollback. Even a mechanically healthy car becomes a serious risk when the odometer is falsified — verify the history before anything else.",
      fr: "La voiture roule bien, mais les chiffres ne collent pas : les 96 000 km affichés contredisent l'usure (pédales, siège, volant) et une facture d'entretien indiquant un relevé supérieur il y a deux ans. C'est un cas classique de compteur trafiqué. Même mécaniquement saine, une voiture dont le compteur est falsifié devient un risque sérieux — vérifiez l'historique avant toute chose.",
    },
    positive: { en: ["Engine and gearbox feel healthy on the drive.", "Body is clean and consistent."], fr: ["Moteur et boîte semblent sains à l'essai.", "Carrosserie propre et cohérente."] },
    suspicious: { en: ["Interior wear inconsistent with 96,000 km.", "A past invoice shows a HIGHER mileage than today.", "Likely odometer rollback (fraud).", "Price set as if low-mileage."], fr: ["Usure intérieure incohérente avec 96 000 km.", "Une facture passée indique un kilométrage SUPÉRIEUR à aujourd'hui.", "Compteur probablement trafiqué (fraude).", "Prix fixé comme un faible kilométrage."] },
    seller_q: { en: ["Can you show all service invoices with dates and mileages?", "Has the instrument cluster ever been replaced?", "Who are the previous owners?", "Will you put the real mileage in writing on the sale?"], fr: ["Pouvez-vous montrer toutes les factures d'entretien avec dates et kilométrages ?", "Le compteur a-t-il déjà été remplacé ?", "Qui sont les précédents propriétaires ?", "Acceptez-vous d'écrire le kilométrage réel sur l'acte de vente ?"] },
    negotiation: { en: ["Odometer fraud suspected — walk away, or only proceed once the true mileage is documented in writing, repriced accordingly.", "Report concerns; a falsified odometer affects safety and resale."], fr: ["Fraude au compteur suspectée — passez votre chemin, ou n'avancez qu'avec le kilométrage réel documenté par écrit et le prix revu en conséquence.", "Signalez le doute ; un compteur falsifié affecte la sécurité et la revente."] },
    next_steps: { en: ["Order a full history/mileage report on the VIN.", "Cross-check every service stamp and invoice date vs mileage."], fr: ["Commandez un rapport d'historique/kilométrage complet sur le VIN.", "Recoupez chaque tampon d'entretien et date de facture avec le kilométrage."] },
    audio: { score: 82, risk: "low", rec: "normal_sound", sound_type: "normal_startup", severity: "low", summary: { en: "Engine sounds healthy — but a healthy engine does not offset a falsified odometer.", fr: "Le moteur semble sain — mais un moteur sain ne compense pas un compteur falsifié." } },
    mech: {
      score: 70, risk: "low", rec: "ask_seller_questions",
      summary: { en: "Mechanically the car is reassuring; the decisive problem is the odometer, not the engine.", fr: "Mécaniquement la voiture est rassurante ; le problème décisif est le compteur, pas le moteur." },
      items: [
        { code: "cold_start", title: { en: "Cold start", fr: "Démarrage à froid" }, score: 82, sev: "low", sus: { en: [], fr: [] }, sum: { en: "Clean start, stable idle.", fr: "Démarrage propre, ralenti stable." } },
        { code: "maintenance_records", title: { en: "Maintenance records", fr: "Factures d'entretien" }, score: 30, sev: "high", sus: { en: ["Invoice mileage higher than the dashboard"], fr: ["Kilométrage de facture supérieur au compteur"] }, sum: { en: "Documents contradict the displayed mileage.", fr: "Les documents contredisent le kilométrage affiché." } },
      ],
    },
    history_note: { en: "Always cross-check odometer readings against service history and a VIN history report.", fr: "Recoupez toujours le kilométrage avec l'historique d'entretien et un rapport d'historique VIN." },
    mileageOverride: {
      status: "suspicious",
      avg_per_year: 8700,
      flags: ["inconsistent_with_records", "lower_than_previous_reading"],
      note: { en: "A past service invoice shows a higher mileage than the current dashboard — a strong rollback indicator. Treat the displayed mileage as unreliable.", fr: "Une facture d'entretien passée indique un kilométrage supérieur au compteur actuel — un fort indice de trafiquage. Considérez le kilométrage affiché comme non fiable." },
    },
  },

  // ---------- 13. Hidden accident repair (structural) ----------
  {
    id: "accident",
    label: { en: "Hidden accident", fr: "Accident caché" },
    vehicle: { make: "Volkswagen", model: "Polo", year: 2017, generation: "AW", trim: "Trendline", engine: "1.0 TSI 95", fuel_type: "gasoline", transmission: "manual", mileage: 84000, asking_price: 11490, city: "Montpellier", vin: "WVWZZZAWZHU123456" },
    risk_level: "high", recommendation: "avoid", global_score: 43, mechanical_score: 80, confidence: 84,
    market: { low: 9200, high: 11000, verdict: "overpriced" },
    bodyScores: { accident_repair_score: 38, alignment_score: 46, paint_tone_score: 50, symmetry_score: 48, bumpers_lights_score: 55, overall_consistency_score: 47 },
    ai_summary: {
      en: "Mechanically the Polo is fine, but the front end tells another story: a repainted front-left wing, uneven panel gaps and a bumper that doesn't sit symmetrically suggest a previous front impact that was repaired and not disclosed. Structural repairs can affect safety and resale. Have it inspected for chassis/structural work before buying.",
      fr: "Mécaniquement, la Polo est saine, mais l'avant raconte autre chose : une aile avant gauche repeinte, des jeux de carrosserie irréguliers et un pare-chocs qui n'est pas symétrique évoquent un choc avant antérieur réparé et non déclaré. Une réparation structurelle peut affecter la sécurité et la revente. Faites vérifier un éventuel travail sur le châssis/la structure avant l'achat.",
    },
    positive: { en: ["Engine and gearbox healthy on the drive.", "Interior clean for the mileage."], fr: ["Moteur et boîte sains à l'essai.", "Intérieur propre pour le kilométrage."] },
    suspicious: { en: ["Front-left wing shows a likely repaint.", "Uneven panel gaps at the front.", "Bumper not symmetrically aligned.", "Possible undisclosed structural repair."], fr: ["L'aile avant gauche montre une probable réfection de peinture.", "Jeux de carrosserie irréguliers à l'avant.", "Pare-chocs non aligné symétriquement.", "Réparation structurelle possible non déclarée."] },
    seller_q: { en: ["Has the car ever been in an accident, even minor?", "Was the front-left wing repaired or repainted?", "Do you have repair invoices or insurance records?", "Has the chassis ever been checked on a bench?"], fr: ["La voiture a-t-elle déjà été accidentée, même légèrement ?", "L'aile avant gauche a-t-elle été réparée ou repeinte ?", "Avez-vous des factures de réparation ou des documents d'assurance ?", "Le châssis a-t-il déjà été contrôlé au marbre ?"] },
    negotiation: { en: ["Undisclosed front repair — request structural verification; if confirmed, walk away or demand a major discount.", "Anchor low: accident history hits resale hard."], fr: ["Réparation avant non déclarée — exigez une vérification structurelle ; si confirmée, passez votre chemin ou exigez une forte remise.", "Ancrez bas : un passé accidenté pèse lourd sur la revente."] },
    next_steps: { en: ["Have a bodyshop check panel alignment and paint thickness.", "Verify the structure (chassis legs, slam panel) for repair marks."], fr: ["Faites vérifier l'alignement des panneaux et l'épaisseur de peinture par un carrossier.", "Vérifiez la structure (longerons, traverse avant) pour des traces de réparation."] },
    audio: { score: 82, risk: "low", rec: "normal_sound", sound_type: "normal_startup", severity: "low", summary: { en: "Engine sound is normal — the concern here is bodywork/structure, not the engine.", fr: "Le son moteur est normal — le souci ici est la carrosserie/structure, pas le moteur." } },
    mech: {
      score: 80, risk: "low", rec: "normal",
      summary: { en: "Mechanically reassuring; the decisive issue is a likely repaired front impact found in the photos.", fr: "Mécaniquement rassurant ; le problème décisif est un choc avant probablement réparé, repéré sur les photos." },
      items: [
        { code: "cold_start", title: { en: "Cold start", fr: "Démarrage à froid" }, score: 84, sev: "low", sus: { en: [], fr: [] }, sum: { en: "Clean start, stable idle.", fr: "Démarrage propre, ralenti stable." } },
      ],
    },
    history_note: { en: "Have any suspected accident repair verified on a chassis bench.", fr: "Faites vérifier toute réparation d'accident suspectée au marbre." },
    photoIssues: [
      { code: "front_left_diagonal", risk_score: 40, severity: "high", issue_type: "possible_repaint", location: { en: "Front-left wing", fr: "Aile avant gauche" }, explanation: { en: "Paint tone and texture on the front-left wing differ from the door — likely refinished after a front impact.", fr: "Le ton et la texture de peinture de l'aile avant gauche diffèrent de la porte — probablement repeinte après un choc avant." } },
      { code: "front_view", risk_score: 46, severity: "moderate", issue_type: "bumper_misalignment", location: { en: "Front bumper", fr: "Pare-chocs avant" }, explanation: { en: "The front bumper sits unevenly with a larger gap on the left — consistent with a past repair.", fr: "Le pare-chocs avant est mal ajusté avec un jeu plus large à gauche — cohérent avec une réparation passée." } },
    ],
  },
];

export const SCENARIO_LIST = SCENARIOS.map((s) => ({ id: s.id, label: s.label }));

export function getScenarioReport(id: string, locale: Locale): FinalReport | null {
  const s = SCENARIOS.find((x) => x.id === id);
  if (!s) return null;
  const L = (b: Bi) => b[locale];
  const LL = (b: BiList) => b[locale];
  const disclaimer =
    locale === "fr"
      ? "Ce rapport est généré par IA à partir des photos et contrôles fournis. Il constitue un outil de pré-diagnostic et ne remplace pas l'inspection d'un professionnel. Exemple fictif à des fins d'illustration."
      : "This report is AI-generated from the supplied photos and checks. It is a preliminary screening tool and does not replace a professional inspection. Fictional example for illustration.";

  const report: FinalReport = {
    generated_at: "2026-06-15T10:30:00.000Z",
    vehicle: {
      make: s.vehicle.make,
      model: s.vehicle.model,
      year: s.vehicle.year,
      generation: s.vehicle.generation,
      trim: s.vehicle.trim,
      engine: s.vehicle.engine,
      fuel_type: s.vehicle.fuel_type,
      transmission: s.vehicle.transmission,
      mileage: s.vehicle.mileage,
      asking_price: s.vehicle.asking_price,
      currency: "EUR",
      seller_type: "private",
      vin: s.vehicle.vin,
      country: "FR",
      city: s.vehicle.city,
    },
    ai_summary: L(s.ai_summary),
    summary: {
      photos_analyzed: 8,
      photo_quality_summary: locale === "fr" ? "Les 8 photos sont exploitables" : "All 8 photos usable",
      risk_level: s.risk_level,
      recommendation: s.recommendation,
      confidence: s.confidence,
    },
    scores: {
      global_score: s.global_score,
      accident_repair_score: 88,
      alignment_score: 86,
      paint_tone_score: 84,
      symmetry_score: 85,
      bumpers_lights_score: 88,
      overall_consistency_score: 86,
      model_risk_score: 60,
      mechanical_score: s.mechanical_score,
      ...s.bodyScores,
    },
    positive_points: LL(s.positive),
    suspicious_points: LL(s.suspicious),
    photo_analysis: CLEAN_PHOTOS.map((p) => {
      const issues = (s.photoIssues ?? []).filter((i) => i.code === p.code);
      return {
        photo_point_code: p.code,
        title: L(p.title),
        quality_score: 92,
        risk_score: issues.length ? Math.min(...issues.map((i) => i.risk_score)) : 88,
        confidence: 90,
        observations: issues.length ? issues.map((i) => L(i.explanation)) : LL(p.obs),
        detected_issues: issues.map((i) => ({
          issue_type: i.issue_type,
          location: L(i.location),
          severity: i.severity,
          confidence: 80,
          explanation: L(i.explanation),
          recommended_follow_up_photo: null,
        })),
      };
    }),
    questions_to_ask_seller: LL(s.seller_q),
    negotiation_arguments: LL(s.negotiation),
    recommended_next_steps: LL(s.next_steps),
    disclaimer,
    engine_audio: {
      file_name: "engine-start.m4a",
      duration_seconds: 24,
      audio_quality_score: 88,
      engine_audio_score: s.audio.score,
      risk_level: s.audio.risk as never,
      recommendation: s.audio.rec as never,
      detected_sounds: [
        {
          sound_type: s.audio.sound_type as never,
          severity: s.audio.severity,
          confidence: 84,
          timestamp_start: 0,
          timestamp_end: 6,
          explanation: L(s.audio.summary),
          possible_causes: [],
          recommended_action:
            locale === "fr" ? "Faire diagnostiquer par un professionnel." : "Have it diagnosed by a professional.",
        },
      ],
      summary: L(s.audio.summary),
      seller_questions: LL(s.seller_q).slice(0, 2),
      mechanic_questions: [],
      disclaimer,
    },
    mechanical: {
      mechanical_score: s.mech.score,
      risk_level: s.mech.risk as never,
      recommendation: s.mech.rec as never,
      summary: L(s.mech.summary),
      items: s.mech.items.map((m) => ({
        point_code: m.code,
        title: L(m.title),
        score: m.score,
        severity: m.sev,
        suspicious_observations: LL(m.sus),
        summary: L(m.sum),
      })),
      seller_questions: LL(s.seller_q).slice(0, 2),
      mechanic_questions: [],
      disclaimer,
    },
    vehicle_history: {
      source: "NHTSA",
      matched: true,
      vehicle: `${s.vehicle.year} ${s.vehicle.make} ${s.vehicle.model}`,
      recalls: [],
      recall_count: 0,
      complaints_count: 0,
      top_complaint_components: [],
      note: L(s.history_note),
      disclaimer,
    },
    specifications: null,
    mileage_check: {
      status: s.mileageOverride?.status ?? "ok",
      mileage: s.vehicle.mileage,
      unit: "km",
      vehicle_age_years: 2026 - s.vehicle.year,
      avg_per_year: s.mileageOverride?.avg_per_year ?? Math.round(s.vehicle.mileage / Math.max(1, 2026 - s.vehicle.year)),
      expected_per_year: 15000,
      flags: s.mileageOverride?.flags ?? [],
      note: s.mileageOverride
        ? L(s.mileageOverride.note)
        : locale === "fr" ? "Kilométrage cohérent avec l'âge ; aucun indice de trafiquage." : "Mileage consistent with age; no rollback indicators.",
      disclaimer,
    },
    safety: null,
    title_flags: null,
    market_value: {
      currency: "EUR",
      asking_price: s.vehicle.asking_price,
      estimated_low: s.market.low,
      estimated_high: s.market.high,
      verdict: s.market.verdict,
      expected_mileage: 15000 * (2026 - s.vehicle.year),
      actual_mileage: s.vehicle.mileage,
      unit: "km",
      source: null,
      disclaimer,
    },
    documents: {
      provided_count: 2,
      relevant_count: 5,
      key_provided: 1,
      key_total: 2,
      items: [
        { doc_type: "registration", provided: true, key: true },
        { doc_type: "maintenance", provided: false, key: true },
        { doc_type: "technical_inspection", provided: true, key: false },
        { doc_type: "history_report", provided: false, key: false },
        { doc_type: "purchase_invoice", provided: false, key: false },
      ],
      note: "",
      disclaimer,
    },
  };

  report.negotiation = buildNegotiationSection({
    locale,
    vehicle: report.vehicle,
    photoAnalysis: report.photo_analysis,
    mechanical: report.mechanical,
    engineAudio: report.engine_audio,
    vehicleHistory: report.vehicle_history,
    mileageCheck: report.mileage_check,
    marketValue: report.market_value,
    documents: report.documents,
    aiArguments: report.negotiation_arguments,
  });

  return report;
}
