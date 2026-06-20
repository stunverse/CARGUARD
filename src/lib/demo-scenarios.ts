// =====================================================================
// CarGuard AI — Fictional scenario reports (social-media / marketing).
//
// Each scenario is a FRENCH used car that looks clean in photos but hides a
// mechanical defect (turbo, bottom-end knock, head gasket, timing belt…).
// Used by /report-example?scenario=<id>. Fully fictional & bilingual.
// =====================================================================

import type {
  FinalReport,
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
    },
    positive_points: LL(s.positive),
    suspicious_points: LL(s.suspicious),
    photo_analysis: CLEAN_PHOTOS.map((p) => ({
      photo_point_code: p.code,
      title: L(p.title),
      quality_score: 92,
      risk_score: 88,
      confidence: 90,
      observations: LL(p.obs),
      detected_issues: [],
    })),
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
      status: "ok",
      mileage: s.vehicle.mileage,
      unit: "km",
      vehicle_age_years: 2026 - s.vehicle.year,
      avg_per_year: Math.round(s.vehicle.mileage / Math.max(1, 2026 - s.vehicle.year)),
      expected_per_year: 15000,
      flags: [],
      note: locale === "fr" ? "Kilométrage cohérent avec l'âge ; aucun indice de trafiquage." : "Mileage consistent with age; no rollback indicators.",
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
