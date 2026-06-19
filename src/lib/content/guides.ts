// =====================================================================
// CarGuard AI — SEO content: buyer guides (bilingual FR/EN)
//
// Plain, helpful, non-accusatory content aligned with the product's
// positioning (a preliminary AI screening, not a guarantee). Stored as
// reusable bilingual objects so a future locale-routing refactor only
// changes URLs, never the content. Rendered by <ArticleDoc/>.
// =====================================================================

import type { Locale } from "@/lib/i18n";

export interface GuideSection {
  heading: string;
  paragraphs: string[];
}

export interface Guide {
  slug: string;
  updated: string;
  title: Record<Locale, string>;
  description: Record<Locale, string>;
  body: Record<Locale, GuideSection[]>;
}

export const GUIDES_UPDATED = "19 June 2026";

export const GUIDES: Guide[] = [
  // -------------------------------------------------------------------
  {
    slug: "spot-accident-damaged-used-car",
    updated: GUIDES_UPDATED,
    title: {
      en: "How to spot an accident-damaged used car",
      fr: "Comment repérer une voiture d'occasion accidentée",
    },
    description: {
      en: "A practical checklist to detect signs of a previous accident, body repair or repaint before you buy a used car — panel gaps, paint, welds, documents and more.",
      fr: "Une check-list pratique pour détecter les signes d'un ancien accident, d'une réparation ou d'une repeinte avant d'acheter une voiture d'occasion : jeux de carrosserie, peinture, soudures, documents et plus.",
    },
    body: {
      en: [
        {
          heading: "Why it matters",
          paragraphs: [
            "A car that has been in an accident is not always a bad buy — but undisclosed structural or body damage can hide rust, electrical faults, or weakened crash protection, and it directly affects resale value.",
            "Most signs are visible if you know where to look. Inspect the car in daylight, when it is clean and dry, and take your time.",
          ],
        },
        {
          heading: "1. Check panel gaps and alignment",
          paragraphs: [
            "Walk around the car and look at the gaps between panels (doors, hood, trunk, fenders). They should be even and symmetric on both sides. Uneven or wide gaps often mean a panel was removed, replaced, or refitted after a repair.",
            "Open and close every door, the hood and the trunk. They should align cleanly and shut without forcing.",
          ],
        },
        {
          heading: "2. Look for paint and color mismatches",
          paragraphs: [
            "Crouch at the front and rear corners and look down the side of the car. A slight difference in shade, gloss or reflection between two adjacent panels suggests a repaint.",
            "Check the same color on the door jambs and under the fuel flap — these areas are rarely repainted, so they reveal the car's true original shade.",
          ],
        },
        {
          heading: "3. Find overspray and texture differences",
          paragraphs: [
            "Look closely at rubber seals, plastic trims, headlights and window edges for paint mist (overspray) — a clear sign of a respray.",
            "Run your hand over the surface. A rough, 'orange-peel' texture or visible sanding marks under the paint can indicate body filler and refinishing.",
          ],
        },
        {
          heading: "4. Inspect bolts, welds and the engine bay",
          paragraphs: [
            "Factory bolts (on the hood, doors, fenders) are usually untouched. Scratched or repainted bolt heads suggest a panel was removed.",
            "In the engine bay and around the boot, factory spot welds are smooth and regular. Lumpy, ground-down or sealant-covered welds point to structural repair.",
          ],
        },
        {
          heading: "5. Read the documents and history",
          paragraphs: [
            "Ask for the service book, invoices and registration. Cross-check the VIN on the documents with the VIN on the car (windshield, door pillar, engine bay).",
            "A vehicle-history report can reveal declared accidents, insurance write-offs, mileage inconsistencies and previous owners.",
          ],
        },
        {
          heading: "6. When in doubt, get a second opinion",
          paragraphs: [
            "If several signs add up, ask the seller directly and use the points above as negotiation arguments — or walk away.",
            "Tools like CarGuard AI give you a fast, photo-based pre-screening to flag suspicious areas before you commit, but they do not replace a professional inspection for a final decision.",
          ],
        },
      ],
      fr: [
        {
          heading: "Pourquoi c'est important",
          paragraphs: [
            "Une voiture accidentée n'est pas forcément un mauvais achat — mais des dommages structurels ou de carrosserie non déclarés peuvent cacher de la rouille, des pannes électriques ou une protection au choc affaiblie, et impactent directement la valeur de revente.",
            "La plupart des signes sont visibles si l'on sait où regarder. Inspectez la voiture de jour, propre et sèche, et prenez votre temps.",
          ],
        },
        {
          heading: "1. Vérifiez les jeux et l'alignement des panneaux",
          paragraphs: [
            "Faites le tour et observez les écarts entre les panneaux (portes, capot, coffre, ailes). Ils doivent être réguliers et symétriques des deux côtés. Des jeux irréguliers ou larges trahissent souvent un panneau déposé, remplacé ou remonté après réparation.",
            "Ouvrez et fermez chaque porte, le capot et le coffre : tout doit s'aligner proprement et fermer sans forcer.",
          ],
        },
        {
          heading: "2. Cherchez les différences de teinte",
          paragraphs: [
            "Accroupissez-vous aux coins avant et arrière et regardez le long du flanc. Une légère différence de teinte, de brillance ou de reflet entre deux panneaux voisins suggère une repeinte.",
            "Comparez la couleur sur les encadrements de portes et sous la trappe à carburant — ces zones sont rarement repeintes et révèlent la teinte d'origine.",
          ],
        },
        {
          heading: "3. Repérez le voile de peinture et les textures",
          paragraphs: [
            "Examinez de près les joints en caoutchouc, les plastiques, les optiques et les bords de vitres : un voile de peinture (overspray) est un signe clair de repeinte.",
            "Passez la main sur la surface. Une texture rugueuse en « peau d'orange » ou des traces de ponçage sous la peinture peuvent indiquer du mastic et une réfection.",
          ],
        },
        {
          heading: "4. Inspectez boulons, soudures et compartiment moteur",
          paragraphs: [
            "Les boulons d'usine (capot, portes, ailes) sont normalement intacts. Des têtes de boulons rayées ou repeintes suggèrent une dépose de panneau.",
            "Dans le compartiment moteur et autour du coffre, les points de soudure d'usine sont lisses et réguliers. Des soudures grossières, meulées ou recouvertes de mastic indiquent une réparation structurelle.",
          ],
        },
        {
          heading: "5. Lisez les documents et l'historique",
          paragraphs: [
            "Demandez le carnet d'entretien, les factures et la carte grise. Vérifiez que le VIN des documents correspond à celui de la voiture (pare-brise, montant de porte, compartiment moteur).",
            "Un rapport d'historique peut révéler des accidents déclarés, des véhicules économiquement irréparables (VEI), des incohérences de kilométrage et les propriétaires précédents.",
          ],
        },
        {
          heading: "6. En cas de doute, prenez un second avis",
          paragraphs: [
            "Si plusieurs signes s'accumulent, interrogez le vendeur et utilisez les points ci-dessus comme arguments de négociation — ou passez votre chemin.",
            "Des outils comme CarGuard AI offrent un pré-diagnostic rapide à partir de photos pour signaler les zones suspectes avant de vous engager, mais ne remplacent pas une inspection professionnelle pour la décision finale.",
          ],
        },
      ],
    },
  },
  // -------------------------------------------------------------------
  {
    slug: "how-to-check-a-vin",
    updated: GUIDES_UPDATED,
    title: {
      en: "How to check a VIN before buying a used car",
      fr: "Comment vérifier un VIN avant d'acheter une voiture d'occasion",
    },
    description: {
      en: "What a VIN is, where to find it, what a VIN check reveals, and the red flags to watch for before buying a used car.",
      fr: "Ce qu'est un VIN, où le trouver, ce qu'une vérification révèle, et les signaux d'alerte à surveiller avant d'acheter une voiture d'occasion.",
    },
    body: {
      en: [
        {
          heading: "What is a VIN?",
          paragraphs: [
            "The VIN (Vehicle Identification Number) is the car's unique 17-character fingerprint. It encodes the manufacturer, model, engine, year and place of production, and links to the vehicle's official records.",
          ],
        },
        {
          heading: "Where to find the VIN",
          paragraphs: [
            "Look at the base of the windshield on the driver's side, on the driver's door pillar, in the engine bay, and on the registration documents.",
            "The VIN must be identical in every location and on the paperwork. A mismatch, sticker tampering or a re-riveted plate is a serious warning sign.",
          ],
        },
        {
          heading: "What a VIN check reveals",
          paragraphs: [
            "Depending on the country and data source, a VIN check can surface: declared accidents and insurance write-offs, odometer/mileage records, number of previous owners, theft records, recalls, and the original specification of the car.",
            "Comparing the declared specification with the actual car helps detect clones, swapped engines or undisclosed changes.",
          ],
        },
        {
          heading: "Free vs paid VIN checks",
          paragraphs: [
            "Some data is free: manufacturer recall lookups (e.g. NHTSA in the US) and basic decoders that expand what the VIN means.",
            "Full history (accidents, write-offs, mileage timeline) usually comes from paid providers. CarGuard AI can pull a history report as part of an inspection where available.",
          ],
        },
        {
          heading: "Red flags in a VIN report",
          paragraphs: [
            "Mileage that goes down over time, gaps in history, a salvage/write-off title, multiple recent owners, or a specification that does not match the car in front of you.",
            "Any of these deserves a direct question to the seller and, ideally, a professional inspection before you pay.",
          ],
        },
      ],
      fr: [
        {
          heading: "Qu'est-ce qu'un VIN ?",
          paragraphs: [
            "Le VIN (numéro d'identification du véhicule) est l'empreinte unique de la voiture, composée de 17 caractères. Il encode le constructeur, le modèle, le moteur, l'année et le lieu de production, et relie le véhicule à ses données officielles.",
          ],
        },
        {
          heading: "Où trouver le VIN",
          paragraphs: [
            "Regardez au bas du pare-brise côté conducteur, sur le montant de la portière conducteur, dans le compartiment moteur et sur les documents d'immatriculation.",
            "Le VIN doit être identique à tous les emplacements et sur les papiers. Une incohérence, une étiquette trafiquée ou une plaque re-rivetée est un signal d'alerte sérieux.",
          ],
        },
        {
          heading: "Ce qu'une vérification du VIN révèle",
          paragraphs: [
            "Selon le pays et la source de données, une vérification peut révéler : accidents déclarés et véhicules irréparables, relevés de kilométrage, nombre de propriétaires, vols, rappels constructeur, et la configuration d'origine.",
            "Comparer la configuration déclarée avec la voiture réelle aide à détecter les clones, les moteurs échangés ou les modifications non déclarées.",
          ],
        },
        {
          heading: "Vérification gratuite ou payante",
          paragraphs: [
            "Certaines données sont gratuites : les rappels constructeur (ex. NHTSA aux États-Unis, Histovec en France) et les décodeurs de base qui expliquent le VIN.",
            "L'historique complet (accidents, irréparables, courbe de kilométrage) provient généralement de fournisseurs payants. CarGuard AI peut intégrer un rapport d'historique à une inspection, là où c'est disponible.",
          ],
        },
        {
          heading: "Signaux d'alerte dans un rapport VIN",
          paragraphs: [
            "Un kilométrage qui diminue dans le temps, des trous dans l'historique, un titre « épave/irréparable », plusieurs propriétaires récents, ou une configuration qui ne correspond pas à la voiture devant vous.",
            "Chacun de ces points mérite une question directe au vendeur et, idéalement, une inspection professionnelle avant de payer.",
          ],
        },
      ],
    },
  },
  // -------------------------------------------------------------------
  {
    slug: "signs-a-car-has-been-repainted",
    updated: GUIDES_UPDATED,
    title: {
      en: "7 signs a used car has been repainted",
      fr: "7 signes qu'une voiture d'occasion a été repeinte",
    },
    description: {
      en: "Repaint is not always hiding an accident, but it is worth understanding. Here are seven visible signs that a car has been resprayed.",
      fr: "Une repeinte ne cache pas toujours un accident, mais mieux vaut comprendre. Voici sept signes visibles qu'une voiture a été repeinte.",
    },
    body: {
      en: [
        {
          heading: "Before you start",
          paragraphs: [
            "Inspect the car clean, dry and in natural daylight. Repaint can be perfectly legitimate (stone chips, vandalism), but it can also mask body repair — so it is worth knowing.",
          ],
        },
        {
          heading: "1. Color or gloss mismatch",
          paragraphs: [
            "Sight down the side of the car: a panel that looks slightly different in shade or shine from its neighbour is the most common tell.",
          ],
        },
        {
          heading: "2. Overspray on trims and seals",
          paragraphs: [
            "Paint mist on rubber seals, plastic trims, badges or window glass means masking was imperfect during a respray.",
          ],
        },
        {
          heading: "3. 'Orange-peel' texture",
          paragraphs: [
            "Factory paint is smooth and uniform. A bumpy, orange-peel surface on one panel suggests aftermarket refinishing.",
          ],
        },
        {
          heading: "4. Different color in the door jambs",
          paragraphs: [
            "Open the doors, hood and trunk. Jambs are rarely repainted, so a difference between the jamb and the outer panel reveals a respray.",
          ],
        },
        {
          heading: "5. Masking lines and tape edges",
          paragraphs: [
            "Look for a faint line where two paint areas meet, or a hard edge of paint inside panel gaps — a sign of taped-off masking.",
          ],
        },
        {
          heading: "6. Paint on or under fasteners",
          paragraphs: [
            "Paint over bolt heads, hinges or clips indicates the part was painted while fitted, or removed and refitted.",
          ],
        },
        {
          heading: "7. A paint-depth gauge confirms it",
          paragraphs: [
            "A cheap paint-thickness gauge reading much higher on one panel than the rest confirms filler or extra paint layers. CarGuard AI can flag many of these signs from photos before you go further.",
          ],
        },
      ],
      fr: [
        {
          heading: "Avant de commencer",
          paragraphs: [
            "Inspectez la voiture propre, sèche et à la lumière du jour. Une repeinte peut être parfaitement légitime (éclats de gravillons, vandalisme), mais elle peut aussi masquer une réparation — d'où l'intérêt de savoir.",
          ],
        },
        {
          heading: "1. Différence de teinte ou de brillance",
          paragraphs: [
            "Regardez le long du flanc : un panneau légèrement différent en teinte ou en brillance de son voisin est l'indice le plus fréquent.",
          ],
        },
        {
          heading: "2. Voile de peinture sur les joints et plastiques",
          paragraphs: [
            "Un voile sur les joints en caoutchouc, les plastiques, les logos ou les vitres signifie que le masquage a été imparfait lors d'une repeinte.",
          ],
        },
        {
          heading: "3. Texture en « peau d'orange »",
          paragraphs: [
            "La peinture d'usine est lisse et uniforme. Une surface granuleuse en peau d'orange sur un panneau suggère une réfection.",
          ],
        },
        {
          heading: "4. Couleur différente dans les encadrements",
          paragraphs: [
            "Ouvrez portes, capot et coffre. Les encadrements sont rarement repeints : une différence entre l'encadrement et le panneau extérieur révèle une repeinte.",
          ],
        },
        {
          heading: "5. Lignes de masquage",
          paragraphs: [
            "Cherchez une fine ligne là où deux zones de peinture se rejoignent, ou un bord de peinture net à l'intérieur des jeux de panneaux — signe d'un masquage au ruban.",
          ],
        },
        {
          heading: "6. Peinture sur ou sous les fixations",
          paragraphs: [
            "De la peinture sur des têtes de boulons, charnières ou clips indique que la pièce a été peinte montée, ou déposée puis remontée.",
          ],
        },
        {
          heading: "7. Un testeur d'épaisseur confirme",
          paragraphs: [
            "Un testeur d'épaisseur de peinture (peu coûteux) qui affiche une valeur bien plus élevée sur un panneau confirme la présence de mastic ou de couches supplémentaires. CarGuard AI peut signaler beaucoup de ces indices à partir de photos avant d'aller plus loin.",
          ],
        },
      ],
    },
  },
];

export function guideBySlug(slug: string): Guide | undefined {
  return GUIDES.find((g) => g.slug === slug);
}
