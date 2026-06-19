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
  // -------------------------------------------------------------------
  {
    slug: "used-car-inspection-checklist",
    updated: GUIDES_UPDATED,
    title: {
      en: "The complete used car inspection checklist",
      fr: "La check-list complète pour inspecter une voiture d'occasion",
    },
    description: {
      en: "A step-by-step checklist to inspect a used car like a pro: bodywork, tyres, engine bay, interior, underbody, test drive and paperwork.",
      fr: "Une check-list étape par étape pour inspecter une voiture d'occasion comme un pro : carrosserie, pneus, compartiment moteur, intérieur, dessous, essai et documents.",
    },
    body: {
      en: [
        {
          heading: "Before you go",
          paragraphs: [
            "Arrange to see the car in daylight, when it is clean and dry — rain and darkness hide paint defects and leaks. Ideally inspect it cold, before the engine has been warmed up, so start-up issues are easier to hear.",
            "Bring a friend, a torch, a magnet wrapped in cloth (to check for body filler on steel panels), and your phone to photograph everything.",
          ],
        },
        {
          heading: "1. Exterior and bodywork",
          paragraphs: [
            "Check that panel gaps are even and symmetric, that paint shade and gloss match across adjacent panels, and that there is no overspray on seals or trims.",
            "Look for rust around wheel arches, sills, door bottoms and the tailgate. Bubbling paint often means rust starting underneath.",
          ],
        },
        {
          heading: "2. Tyres and wheels",
          paragraphs: [
            "Tyres should match in brand and have even tread depth. Uneven wear across a tyre can indicate alignment or suspension problems, possibly from an impact.",
            "Check the date code on each tyre and make sure none are cracked or older than about six years.",
          ],
        },
        {
          heading: "3. Under the hood",
          paragraphs: [
            "Look for clean, regular factory welds and untouched bolts. Check oil on the dipstick (not milky), coolant color, and for any leaks or fresh sealant.",
            "A spotless engine bay on an older car can be normal — or an attempt to hide leaks. Look underneath after the test drive for drips.",
          ],
        },
        {
          heading: "4. Interior and electronics",
          paragraphs: [
            "Test every electrical item: windows, locks, lights, wipers, air conditioning, infotainment, heated seats and all warning lights (they should illuminate then go out).",
            "Wear on the seat, pedals and steering wheel should match the claimed mileage. Heavy wear with low mileage is a red flag for odometer fraud.",
          ],
        },
        {
          heading: "5. Underneath the car",
          paragraphs: [
            "If you can, look under the car for rust on the chassis, fresh undercoating hiding repairs, bent or welded structural parts, and exhaust condition.",
            "Check the spare wheel well and boot floor for ripples or welds that suggest rear-impact repair.",
          ],
        },
        {
          heading: "6. Start-up and test drive",
          paragraphs: [
            "Start the engine cold and listen for knocking, rattling or rough idle. Watch the exhaust: blue smoke means burning oil, white smoke can mean coolant.",
            "On the road, test braking (no pulling or vibration), steering (straight, no wandering), gearbox (smooth shifts), and listen for clunks over bumps.",
          ],
        },
        {
          heading: "7. Paperwork",
          paragraphs: [
            "Match the VIN on the car to the registration and service book. Check the service history is consistent and the mileage rises logically over time.",
            "A vehicle-history report confirms accidents, write-offs, mileage and ownership.",
          ],
        },
        {
          heading: "8. Make your decision",
          paragraphs: [
            "Add up the findings. A few minor issues are normal and great negotiation leverage; several structural or mechanical concerns justify a professional inspection or walking away.",
            "A CarGuard AI inspection can pre-screen the bodywork and engine sound from your photos before you commit your time and money.",
          ],
        },
      ],
      fr: [
        {
          heading: "Avant de vous déplacer",
          paragraphs: [
            "Prévoyez de voir la voiture de jour, propre et sèche — la pluie et l'obscurité masquent les défauts de peinture et les fuites. Idéalement, inspectez-la à froid, avant que le moteur n'ait chauffé, pour mieux entendre les problèmes au démarrage.",
            "Emportez un ami, une lampe, un aimant entouré d'un chiffon (pour détecter le mastic sur les panneaux en acier) et votre téléphone pour tout photographier.",
          ],
        },
        {
          heading: "1. Extérieur et carrosserie",
          paragraphs: [
            "Vérifiez que les jeux de panneaux sont réguliers et symétriques, que la teinte et la brillance correspondent entre panneaux voisins, et qu'il n'y a pas de voile de peinture sur les joints ou plastiques.",
            "Cherchez la rouille autour des passages de roues, des bas de caisse, du bas des portes et du hayon. Une peinture qui cloque trahit souvent une rouille naissante.",
          ],
        },
        {
          heading: "2. Pneus et roues",
          paragraphs: [
            "Les pneus doivent être de même marque et présenter une usure homogène. Une usure irrégulière sur un pneu peut indiquer un problème de parallélisme ou de suspension, parfois dû à un choc.",
            "Vérifiez la date de fabrication de chaque pneu et assurez-vous qu'aucun n'est fissuré ou âgé de plus de six ans environ.",
          ],
        },
        {
          heading: "3. Sous le capot",
          paragraphs: [
            "Recherchez des soudures d'usine propres et régulières et des boulons intacts. Vérifiez l'huile sur la jauge (pas d'aspect laiteux), la couleur du liquide de refroidissement, et l'absence de fuites ou de mastic frais.",
            "Un compartiment moteur impeccable sur une voiture ancienne peut être normal — ou cacher des fuites. Regardez dessous après l'essai pour repérer des gouttes.",
          ],
        },
        {
          heading: "4. Intérieur et électronique",
          paragraphs: [
            "Testez chaque équipement électrique : vitres, verrouillage, feux, essuie-glaces, climatisation, multimédia, sièges chauffants et tous les voyants (ils doivent s'allumer puis s'éteindre).",
            "L'usure du siège, des pédales et du volant doit correspondre au kilométrage annoncé. Une forte usure avec un faible kilométrage est un signe de fraude au compteur.",
          ],
        },
        {
          heading: "5. Sous la voiture",
          paragraphs: [
            "Si possible, regardez sous la voiture : rouille sur le châssis, anti-gravillon récent masquant des réparations, éléments structurels tordus ou soudés, état de l'échappement.",
            "Vérifiez le logement de la roue de secours et le plancher du coffre : des ondulations ou des soudures suggèrent une réparation après choc arrière.",
          ],
        },
        {
          heading: "6. Démarrage et essai routier",
          paragraphs: [
            "Démarrez le moteur à froid et écoutez les cognements, cliquetis ou ralenti irrégulier. Surveillez l'échappement : une fumée bleue signale de l'huile brûlée, une fumée blanche peut indiquer du liquide de refroidissement.",
            "Sur la route, testez le freinage (sans tirage ni vibration), la direction (droite, sans flottement), la boîte (passages doux), et écoutez les bruits sur les bosses.",
          ],
        },
        {
          heading: "7. Les documents",
          paragraphs: [
            "Faites correspondre le VIN de la voiture avec la carte grise et le carnet d'entretien. Vérifiez que l'historique est cohérent et que le kilométrage augmente logiquement dans le temps.",
            "Un rapport d'historique confirme accidents, irréparables, kilométrage et propriétaires.",
          ],
        },
        {
          heading: "8. Prenez votre décision",
          paragraphs: [
            "Faites le bilan. Quelques défauts mineurs sont normaux et constituent d'excellents arguments de négociation ; plusieurs problèmes structurels ou mécaniques justifient une inspection professionnelle ou un renoncement.",
            "Une inspection CarGuard AI peut pré-diagnostiquer la carrosserie et le son moteur à partir de vos photos avant d'investir temps et argent.",
          ],
        },
      ],
    },
  },
  // -------------------------------------------------------------------
  {
    slug: "engine-noises-at-startup",
    updated: GUIDES_UPDATED,
    title: {
      en: "Engine noises at start-up and what they mean",
      fr: "Les bruits moteur au démarrage et ce qu'ils signifient",
    },
    description: {
      en: "Knocking, rattling, squealing or rough idle at cold start can reveal expensive problems. Here is how to interpret common engine noises.",
      fr: "Cognements, cliquetis, sifflements ou ralenti irrégulier à froid peuvent révéler des problèmes coûteux. Voici comment interpréter les bruits moteur courants.",
    },
    body: {
      en: [
        {
          heading: "Why cold start matters",
          paragraphs: [
            "Many issues are loudest in the first seconds after a cold start, before oil has circulated and parts have warmed. Sellers often warm the engine beforehand to hide them — ask to start it cold.",
          ],
        },
        {
          heading: "Knocking or deep tapping",
          paragraphs: [
            "A rhythmic deep knock that rises with engine speed can indicate worn bearings or serious internal wear — potentially a very expensive repair. Treat it as a major warning.",
          ],
        },
        {
          heading: "Rattling on start (timing chain)",
          paragraphs: [
            "A brief metallic rattle for a second or two at start-up often points to a worn timing chain or tensioner. On some engines this is a known, costly fault — research the specific model.",
          ],
        },
        {
          heading: "Squealing or screeching",
          paragraphs: [
            "A high-pitched squeal that eases as revs rise is usually a worn or loose accessory belt — relatively cheap, but check why it wore (a seized pulley costs more).",
          ],
        },
        {
          heading: "Rough or hunting idle",
          paragraphs: [
            "An idle that shakes, rises and falls, or nearly stalls can mean misfires, vacuum leaks, dirty injectors or sensor faults. Combined with a check-engine light, investigate before buying.",
          ],
        },
        {
          heading: "Whistling or hissing",
          paragraphs: [
            "A hiss or whistle can be a vacuum or intake leak; on turbocharged cars, an abnormal whistle may signal a boost leak or turbo wear.",
          ],
        },
        {
          heading: "Starter and cranking noises",
          paragraphs: [
            "A grinding or clicking when turning the key, or a slow crank, points to the starter motor or battery rather than the engine itself — usually cheaper, but confirm.",
          ],
        },
        {
          heading: "When to walk away",
          paragraphs: [
            "Deep knocking, persistent rattles paired with warning lights, or smoke with abnormal noise justify a professional mechanical diagnosis before any payment.",
            "CarGuard AI can analyse an engine start-up recording to flag suspicious sounds, but a mechanic confirms the cause.",
          ],
        },
      ],
      fr: [
        {
          heading: "Pourquoi le démarrage à froid compte",
          paragraphs: [
            "Beaucoup de problèmes sont les plus audibles dans les premières secondes après un démarrage à froid, avant que l'huile ne circule et que les pièces chauffent. Les vendeurs font souvent chauffer le moteur pour les masquer — demandez à démarrer à froid.",
          ],
        },
        {
          heading: "Cognement ou tapotement sourd",
          paragraphs: [
            "Un cognement sourd et rythmé qui augmente avec le régime peut indiquer des coussinets usés ou une usure interne sérieuse — une réparation potentiellement très coûteuse. À considérer comme une alerte majeure.",
          ],
        },
        {
          heading: "Cliquetis au démarrage (chaîne de distribution)",
          paragraphs: [
            "Un bref cliquetis métallique pendant une à deux secondes au démarrage trahit souvent une chaîne de distribution ou un tendeur usé. Sur certains moteurs, c'est un défaut connu et coûteux — renseignez-vous sur le modèle précis.",
          ],
        },
        {
          heading: "Sifflement ou crissement",
          paragraphs: [
            "Un crissement aigu qui s'atténue quand le régime monte vient généralement d'une courroie d'accessoires usée ou détendue — relativement bon marché, mais vérifiez la cause (une poulie grippée coûte plus cher).",
          ],
        },
        {
          heading: "Ralenti irrégulier",
          paragraphs: [
            "Un ralenti qui tremble, monte et descend, ou cale presque, peut signaler des ratés, des prises d'air, des injecteurs encrassés ou des capteurs défaillants. Associé à un voyant moteur, à investiguer avant l'achat.",
          ],
        },
        {
          heading: "Sifflement d'air",
          paragraphs: [
            "Un sifflement peut venir d'une prise d'air à l'admission ; sur les voitures turbo, un sifflement anormal peut signaler une fuite de suralimentation ou une usure du turbo.",
          ],
        },
        {
          heading: "Bruits de démarreur",
          paragraphs: [
            "Un grincement ou des clics en tournant la clé, ou un démarrage poussif, pointent vers le démarreur ou la batterie plutôt que le moteur lui-même — généralement moins coûteux, mais à confirmer.",
          ],
        },
        {
          heading: "Quand renoncer",
          paragraphs: [
            "Un cognement profond, des cliquetis persistants associés à des voyants, ou de la fumée avec un bruit anormal justifient un diagnostic mécanique professionnel avant tout paiement.",
            "CarGuard AI peut analyser un enregistrement de démarrage moteur pour signaler les sons suspects, mais un mécanicien en confirme la cause.",
          ],
        },
      ],
    },
  },
  // -------------------------------------------------------------------
  {
    slug: "negotiate-used-car-price",
    updated: GUIDES_UPDATED,
    title: {
      en: "How to negotiate the price of a used car",
      fr: "Comment négocier le prix d'une voiture d'occasion",
    },
    description: {
      en: "Practical tactics to negotiate a used car with confidence: research, market value, using inspection findings, timing and walk-away power.",
      fr: "Des tactiques concrètes pour négocier une voiture d'occasion avec assurance : recherche, valeur de marché, défauts constatés, timing et pouvoir de renoncement.",
    },
    body: {
      en: [
        {
          heading: "Negotiation starts with information",
          paragraphs: [
            "The buyer who knows the most usually pays the least. Before you discuss price, research the model's common faults, typical asking prices, and how long this specific car has been listed.",
          ],
        },
        {
          heading: "1. Know the real market value",
          paragraphs: [
            "Compare at least 5–10 similar cars (same model, year, mileage, condition and region). This gives you a realistic range, not just the seller's optimistic number.",
            "A car priced well above comparable listings is either special or overpriced — find out which.",
          ],
        },
        {
          heading: "2. Turn findings into leverage",
          paragraphs: [
            "Every defect you spot — worn tyres, a service due, a small paint repair, a noise — has a cost. List them with rough repair estimates and use the total as the basis for your offer.",
            "Concrete, specific points (\"the front tyres need replacing, that's about X\") are far more persuasive than a vague \"can you do better?\".",
          ],
        },
        {
          heading: "3. Use timing to your advantage",
          paragraphs: [
            "A car listed for many weeks, end-of-month targets, or a seller who needs a quick sale all increase your leverage. Politely ask why they are selling and how long it has been for sale.",
          ],
        },
        {
          heading: "4. Anchor with a fair, lower offer",
          paragraphs: [
            "Open below your target but within reason — an insultingly low offer ends the conversation. Justify the number with your research and findings so it feels fair, not random.",
          ],
        },
        {
          heading: "5. Stay calm and let silence work",
          paragraphs: [
            "After making an offer, stop talking. Silence is uncomfortable and often prompts the seller to move. Avoid showing excitement about the car.",
          ],
        },
        {
          heading: "6. Keep your walk-away power",
          paragraphs: [
            "Your strongest tool is genuine willingness to leave. There is always another car. A seller who senses you will walk is far more flexible.",
          ],
        },
        {
          heading: "7. Lock in the deal cleanly",
          paragraphs: [
            "Agree the price in writing, confirm what is included, and never pay a deposit before you are satisfied with the inspection and paperwork.",
            "Bringing a CarGuard AI report to the negotiation gives you documented, specific arguments — a powerful and professional way to justify a lower price.",
          ],
        },
      ],
      fr: [
        {
          heading: "La négociation commence par l'information",
          paragraphs: [
            "L'acheteur le mieux informé paie généralement le moins cher. Avant de parler prix, renseignez-vous sur les pannes fréquentes du modèle, les prix demandés habituels, et depuis combien de temps cette voiture est en vente.",
          ],
        },
        {
          heading: "1. Connaissez la vraie valeur de marché",
          paragraphs: [
            "Comparez au moins 5 à 10 voitures similaires (même modèle, année, kilométrage, état et région). Vous obtenez une fourchette réaliste, pas seulement le chiffre optimiste du vendeur.",
            "Une voiture nettement au-dessus des annonces comparables est soit exceptionnelle, soit surcotée — découvrez laquelle.",
          ],
        },
        {
          heading: "2. Transformez les défauts en levier",
          paragraphs: [
            "Chaque défaut repéré — pneus usés, entretien à faire, petite retouche de peinture, un bruit — a un coût. Listez-les avec des estimations de réparation et utilisez le total comme base de votre offre.",
            "Des points concrets et précis (« les pneus avant sont à changer, soit environ X ») sont bien plus convaincants qu'un vague « vous pouvez faire un effort ? ».",
          ],
        },
        {
          heading: "3. Utilisez le timing",
          paragraphs: [
            "Une voiture en vente depuis des semaines, une fin de mois, ou un vendeur pressé augmentent votre marge. Demandez poliment pourquoi il vend et depuis quand l'annonce est en ligne.",
          ],
        },
        {
          heading: "4. Ancrez avec une offre basse mais juste",
          paragraphs: [
            "Démarrez sous votre objectif mais raisonnablement — une offre insultante met fin à la discussion. Justifiez le montant par vos recherches et vos constats pour qu'il paraisse équitable, pas aléatoire.",
          ],
        },
        {
          heading: "5. Restez calme et laissez parler le silence",
          paragraphs: [
            "Après votre offre, taisez-vous. Le silence est inconfortable et pousse souvent le vendeur à bouger. Évitez de montrer votre enthousiasme pour la voiture.",
          ],
        },
        {
          heading: "6. Gardez votre pouvoir de renoncement",
          paragraphs: [
            "Votre meilleur atout est une réelle disposition à partir. Il y a toujours une autre voiture. Un vendeur qui sent que vous pouvez renoncer est bien plus flexible.",
          ],
        },
        {
          heading: "7. Concluez proprement",
          paragraphs: [
            "Fixez le prix par écrit, confirmez ce qui est inclus, et ne versez jamais d'acompte avant d'être satisfait de l'inspection et des documents.",
            "Apporter un rapport CarGuard AI à la négociation vous donne des arguments documentés et précis — une manière puissante et professionnelle de justifier un prix plus bas.",
          ],
        },
      ],
    },
  },
  // -------------------------------------------------------------------
  {
    slug: "questions-to-ask-used-car-seller",
    updated: GUIDES_UPDATED,
    title: {
      en: "15 questions to ask a used car seller",
      fr: "15 questions à poser à un vendeur de voiture d'occasion",
    },
    description: {
      en: "The right questions reveal a car's true history and expose evasive sellers. Here are 15 to ask before you buy — and the answers that should worry you.",
      fr: "Les bonnes questions révèlent l'histoire réelle d'une voiture et démasquent les vendeurs évasifs. En voici 15 à poser avant d'acheter — et les réponses qui doivent inquiéter.",
    },
    body: {
      en: [
        {
          heading: "Why questions matter",
          paragraphs: [
            "How a seller answers is as revealing as what they say. Clear, consistent answers backed by documents build trust; vague, defensive or contradictory ones are a warning sign.",
          ],
        },
        {
          heading: "About ownership",
          paragraphs: [
            "How many owners has it had? Are you the registered keeper? Why are you selling? Do you have all the keys?",
          ],
        },
        {
          heading: "About accidents and history",
          paragraphs: [
            "Has it ever been in an accident? Any panels repaired or repainted? Has it ever been declared a write-off or had structural repair?",
          ],
        },
        {
          heading: "About maintenance",
          paragraphs: [
            "Do you have the full service history? When was the timing belt/chain, clutch and brakes last done? Is the next service or MOT/inspection due?",
          ],
        },
        {
          heading: "About mechanical condition",
          paragraphs: [
            "Are there any warning lights? Any known faults or noises? Does it use oil between services? Has any major part been replaced?",
          ],
        },
        {
          heading: "About paperwork",
          paragraphs: [
            "Can I see the registration and verify the VIN? Is there any finance outstanding on the car? Can I take it for an independent inspection?",
          ],
        },
        {
          heading: "Answers that should worry you",
          paragraphs: [
            "Refusal of an independent inspection, missing service history, \"I'm selling for a friend\", reluctance to show the registration, or mileage that does not match the car's condition.",
            "If answers feel rehearsed or evasive, slow down. A CarGuard AI inspection plus a vehicle-history report can confirm or contradict what you are told.",
          ],
        },
      ],
      fr: [
        {
          heading: "Pourquoi les questions comptent",
          paragraphs: [
            "La façon dont un vendeur répond est aussi révélatrice que ce qu'il dit. Des réponses claires, cohérentes et appuyées par des documents inspirent confiance ; des réponses vagues, sur la défensive ou contradictoires sont un signal d'alerte.",
          ],
        },
        {
          heading: "Sur la propriété",
          paragraphs: [
            "Combien de propriétaires a-t-elle eus ? Êtes-vous le titulaire de la carte grise ? Pourquoi la vendez-vous ? Avez-vous tous les doubles de clés ?",
          ],
        },
        {
          heading: "Sur les accidents et l'historique",
          paragraphs: [
            "A-t-elle déjà été accidentée ? Des panneaux réparés ou repeints ? A-t-elle été déclarée irréparable (VEI) ou subi une réparation structurelle ?",
          ],
        },
        {
          heading: "Sur l'entretien",
          paragraphs: [
            "Avez-vous le carnet d'entretien complet ? Quand la distribution, l'embrayage et les freins ont-ils été faits ? Le prochain entretien ou contrôle technique est-il à prévoir ?",
          ],
        },
        {
          heading: "Sur l'état mécanique",
          paragraphs: [
            "Y a-t-il des voyants allumés ? Des pannes ou bruits connus ? Consomme-t-elle de l'huile entre les vidanges ? Une pièce majeure a-t-elle été remplacée ?",
          ],
        },
        {
          heading: "Sur les documents",
          paragraphs: [
            "Puis-je voir la carte grise et vérifier le VIN ? Reste-t-il un crédit en cours sur la voiture ? Puis-je la faire inspecter de façon indépendante ?",
          ],
        },
        {
          heading: "Les réponses qui doivent inquiéter",
          paragraphs: [
            "Un refus d'inspection indépendante, un carnet d'entretien manquant, « je vends pour un ami », une réticence à montrer la carte grise, ou un kilométrage incohérent avec l'état de la voiture.",
            "Si les réponses semblent récitées ou évasives, ralentissez. Une inspection CarGuard AI et un rapport d'historique peuvent confirmer ou contredire ce qu'on vous dit.",
          ],
        },
      ],
    },
  },
  // -------------------------------------------------------------------
  {
    slug: "detect-odometer-fraud",
    updated: GUIDES_UPDATED,
    title: {
      en: "How to detect odometer fraud (mileage rollback)",
      fr: "Comment détecter une fraude au compteur kilométrique",
    },
    description: {
      en: "Mileage rollback makes a worn car look fresh and inflates its price. Learn the signs of odometer fraud and how to protect yourself.",
      fr: "Le trafic du compteur fait passer une voiture usée pour récente et gonfle son prix. Apprenez à repérer la fraude au kilométrage et à vous protéger.",
    },
    body: {
      en: [
        {
          heading: "What odometer fraud is",
          paragraphs: [
            "Odometer fraud (or mileage rollback) is reducing the displayed mileage to make a car seem less used and worth more. With digital dashboards it can be done in minutes and leaves no obvious trace on the display.",
          ],
        },
        {
          heading: "1. Compare wear with the mileage",
          paragraphs: [
            "A genuinely low-mileage car has light wear. Shiny-worn pedals, a polished steering wheel, sagging seat bolsters or a worn gear knob on a \"low-mileage\" car are classic red flags.",
            "Check the driver's seat, door handle, and the pedal rubbers — these wear predictably with use.",
          ],
        },
        {
          heading: "2. Cross-check the service history",
          paragraphs: [
            "Service stamps and invoices record mileage at each visit. Plot them over time: the mileage must rise consistently. A reading lower than a past record proves tampering.",
          ],
        },
        {
          heading: "3. Use a vehicle-history report",
          paragraphs: [
            "Inspection and registration databases store historical mileage. A history report often exposes a mileage that dropped or jumped impossibly between dates.",
          ],
        },
        {
          heading: "4. Look for digital tampering clues",
          paragraphs: [
            "Misaligned digits on analogue odometers, scratches around the instrument cluster screws, or warning lights that no longer work can hint at dashboard interference.",
          ],
        },
        {
          heading: "5. Sanity-check the average",
          paragraphs: [
            "Cars average roughly 10,000–15,000 km (about 6,000–9,000 miles) per year. A six-year-old car showing 30,000 km deserves solid proof — not just the seller's word.",
          ],
        },
        {
          heading: "What to do if you suspect it",
          paragraphs: [
            "Walk away unless every record lines up. Mileage fraud is illegal in most countries and usually hides a more worn, higher-risk car.",
            "A CarGuard AI inspection cross-references the visible wear and, where available, history data, helping flag a mileage that does not add up.",
          ],
        },
      ],
      fr: [
        {
          heading: "Ce qu'est la fraude au compteur",
          paragraphs: [
            "La fraude au compteur (ou trafic kilométrique) consiste à réduire le kilométrage affiché pour faire paraître la voiture moins utilisée et plus chère. Avec les tableaux de bord numériques, l'opération prend quelques minutes et ne laisse pas de trace évidente à l'écran.",
          ],
        },
        {
          heading: "1. Comparez l'usure et le kilométrage",
          paragraphs: [
            "Une voiture réellement peu kilométrée présente une usure légère. Des pédales lustrées, un volant poli, des sièges affaissés ou un pommeau usé sur une voiture « peu kilométrée » sont des signaux classiques.",
            "Examinez le siège conducteur, la poignée de porte et les caoutchoucs de pédales — ils s'usent de façon prévisible avec l'usage.",
          ],
        },
        {
          heading: "2. Recoupez le carnet d'entretien",
          paragraphs: [
            "Les tampons et factures notent le kilométrage à chaque passage. Reportez-les dans le temps : le kilométrage doit augmenter régulièrement. Un relevé inférieur à un enregistrement passé prouve une manipulation.",
          ],
        },
        {
          heading: "3. Utilisez un rapport d'historique",
          paragraphs: [
            "Les bases de contrôle technique et d'immatriculation conservent les kilométrages historiques. Un rapport révèle souvent un kilométrage qui a baissé ou bondi de façon impossible entre deux dates.",
          ],
        },
        {
          heading: "4. Cherchez les indices de manipulation",
          paragraphs: [
            "Des chiffres mal alignés sur les compteurs analogiques, des rayures autour des vis du combiné d'instruments, ou des voyants qui ne fonctionnent plus peuvent trahir une intervention sur le tableau de bord.",
          ],
        },
        {
          heading: "5. Vérifiez la moyenne",
          paragraphs: [
            "Une voiture parcourt en moyenne 10 000 à 15 000 km par an. Une voiture de six ans affichant 30 000 km exige des preuves solides — pas seulement la parole du vendeur.",
          ],
        },
        {
          heading: "Que faire en cas de doute",
          paragraphs: [
            "Renoncez tant que tous les relevés ne concordent pas. La fraude au compteur est illégale dans la plupart des pays et cache généralement une voiture plus usée et plus risquée.",
            "Une inspection CarGuard AI recoupe l'usure visible et, si disponible, les données d'historique, pour aider à signaler un kilométrage incohérent.",
          ],
        },
      ],
    },
  },
  // -------------------------------------------------------------------
  {
    slug: "flood-damaged-car-signs",
    updated: GUIDES_UPDATED,
    title: {
      en: "How to spot a flood-damaged car",
      fr: "Comment repérer une voiture inondée (dégât des eaux)",
    },
    description: {
      en: "Flood damage causes hidden corrosion and electrical failures for years. Here are the tell-tale signs a used car has been under water.",
      fr: "Un dégât des eaux provoque corrosion cachée et pannes électriques pendant des années. Voici les signes révélateurs qu'une voiture a été inondée.",
    },
    body: {
      en: [
        {
          heading: "Why flood damage is serious",
          paragraphs: [
            "Water ruins electronics, wiring and bearings and triggers corrosion that surfaces months or years later. Flooded cars are sometimes cleaned up and resold far from where the flooding happened.",
          ],
        },
        {
          heading: "1. Trust your nose",
          paragraphs: [
            "A musty, mouldy or strong air-freshener smell (used to mask it) is a classic sign. Damp carpets or a humid cabin after rain reinforce the suspicion.",
          ],
        },
        {
          heading: "2. Look for water lines and stains",
          paragraphs: [
            "Check for a faint discolouration line in the boot, under seats, or in the engine bay marking a water level. Look for mismatched or recently replaced carpets.",
          ],
        },
        {
          heading: "3. Inspect hidden corners",
          paragraphs: [
            "Lift the carpets and check the spare-wheel well, seat rails, seatbelt anchor bolts and under-dash brackets for rust, silt or a waterline that does not belong on a clean car.",
          ],
        },
        {
          heading: "4. Test all electronics thoroughly",
          paragraphs: [
            "Water damage shows up as intermittent electrical faults. Test every light, window, the infotainment, sensors and warning lamps. Flickering or dead electronics are a strong warning.",
          ],
        },
        {
          heading: "5. Check unusual rust and residue",
          paragraphs: [
            "Rust on screws, brackets, hinges and metal under the dashboard — places that should stay dry — points to immersion. Fine dried mud or silt in vents and crevices is a giveaway.",
          ],
        },
        {
          heading: "6. Confirm with the history",
          paragraphs: [
            "A vehicle-history report may carry a flood or salvage title. Be extra cautious with cars registered shortly after major regional flooding.",
            "Photograph the suspicious areas; a CarGuard AI inspection can help document signs of moisture damage and corrosion before you decide.",
          ],
        },
      ],
      fr: [
        {
          heading: "Pourquoi un dégât des eaux est grave",
          paragraphs: [
            "L'eau détruit l'électronique, le câblage et les roulements, et déclenche une corrosion qui ressurgit des mois ou des années plus tard. Les voitures inondées sont parfois remises en état et revendues loin du lieu de l'inondation.",
          ],
        },
        {
          heading: "1. Fiez-vous à votre odorat",
          paragraphs: [
            "Une odeur de moisi, d'humidité ou de désodorisant puissant (pour la masquer) est un signe classique. Des moquettes humides ou un habitacle humide après la pluie renforcent le soupçon.",
          ],
        },
        {
          heading: "2. Cherchez les lignes et taches d'eau",
          paragraphs: [
            "Recherchez une légère ligne de décoloration dans le coffre, sous les sièges ou dans le compartiment moteur marquant un niveau d'eau. Repérez des moquettes dépareillées ou récemment remplacées.",
          ],
        },
        {
          heading: "3. Inspectez les recoins cachés",
          paragraphs: [
            "Soulevez les moquettes et vérifiez le logement de roue de secours, les rails de sièges, les boulons d'ancrage des ceintures et les supports sous la planche de bord : rouille, limon ou ligne d'eau anormale sur une voiture propre.",
          ],
        },
        {
          heading: "4. Testez toute l'électronique",
          paragraphs: [
            "Un dégât des eaux se manifeste par des pannes électriques intermittentes. Testez chaque feu, vitre, le multimédia, les capteurs et les voyants. Une électronique qui clignote ou ne répond plus est une forte alerte.",
          ],
        },
        {
          heading: "5. Repérez rouille et résidus inhabituels",
          paragraphs: [
            "De la rouille sur des vis, supports, charnières et métaux sous la planche de bord — des endroits censés rester secs — trahit une immersion. De la boue ou du limon séché dans les aérateurs et interstices est un indice.",
          ],
        },
        {
          heading: "6. Confirmez avec l'historique",
          paragraphs: [
            "Un rapport d'historique peut mentionner un titre « inondé » ou « épave ». Soyez particulièrement vigilant pour les voitures immatriculées peu après une inondation régionale majeure.",
            "Photographiez les zones suspectes ; une inspection CarGuard AI peut aider à documenter les signes d'humidité et de corrosion avant votre décision.",
          ],
        },
      ],
    },
  },
  // -------------------------------------------------------------------
  {
    slug: "dealer-vs-private-seller",
    updated: GUIDES_UPDATED,
    title: {
      en: "Buying from a dealer vs a private seller",
      fr: "Acheter chez un professionnel ou à un particulier",
    },
    description: {
      en: "Dealers offer warranties and protection but cost more; private sellers are cheaper but riskier. Here's how to choose and protect yourself either way.",
      fr: "Les professionnels offrent garanties et protections mais coûtent plus cher ; les particuliers sont moins chers mais plus risqués. Voici comment choisir et vous protéger dans les deux cas.",
    },
    body: {
      en: [
        {
          heading: "The core trade-off",
          paragraphs: [
            "Buying from a dealer usually costs more but comes with legal protections, a warranty and recourse if something is wrong. Buying privately is cheaper but the principle is closer to \"sold as seen\" — the risk shifts to you.",
          ],
        },
        {
          heading: "Advantages of a dealer",
          paragraphs: [
            "Consumer law protections, a statutory or commercial warranty, prepared and inspected cars, part-exchange options and financing.",
            "A reputable dealer also has a reputation to protect, which can mean more honest disclosure.",
          ],
        },
        {
          heading: "Drawbacks of a dealer",
          paragraphs: [
            "Higher prices to cover overheads and margin, sales pressure, and add-ons (warranties, paint protection) that are not always worth it.",
          ],
        },
        {
          heading: "Advantages of a private seller",
          paragraphs: [
            "Lower prices, direct contact with the person who actually used the car, and often a richer, more honest account of its quirks and history.",
          ],
        },
        {
          heading: "Drawbacks of a private seller",
          paragraphs: [
            "Far fewer legal protections, no warranty, and a small risk of fraud (outstanding finance, cloned cars, undisclosed damage). Due diligence is entirely on you.",
          ],
        },
        {
          heading: "How to protect yourself either way",
          paragraphs: [
            "Always verify the VIN and ownership, check for outstanding finance, inspect the car cold and in daylight, and get a vehicle-history report.",
            "With a private sale especially, an independent or AI pre-inspection is worth far more than its cost. A CarGuard AI report gives you documented findings regardless of who you buy from.",
          ],
        },
      ],
      fr: [
        {
          heading: "Le compromis essentiel",
          paragraphs: [
            "Acheter chez un professionnel coûte généralement plus cher mais s'accompagne de protections légales, d'une garantie et d'un recours en cas de problème. L'achat à un particulier est moins cher, mais se rapproche du « vendu en l'état » — le risque bascule vers vous.",
          ],
        },
        {
          heading: "Avantages du professionnel",
          paragraphs: [
            "Protections du droit de la consommation, garantie légale ou commerciale, voitures préparées et contrôlées, reprise possible et financement.",
            "Un professionnel sérieux a aussi une réputation à protéger, ce qui peut favoriser une information plus honnête.",
          ],
        },
        {
          heading: "Inconvénients du professionnel",
          paragraphs: [
            "Des prix plus élevés pour couvrir frais et marge, une pression commerciale, et des options (garanties, traitements de peinture) pas toujours rentables.",
          ],
        },
        {
          heading: "Avantages du particulier",
          paragraphs: [
            "Des prix plus bas, un contact direct avec la personne qui a réellement utilisé la voiture, et souvent un récit plus riche et honnête de ses particularités et de son histoire.",
          ],
        },
        {
          heading: "Inconvénients du particulier",
          paragraphs: [
            "Bien moins de protections légales, pas de garantie, et un petit risque de fraude (crédit en cours, voiture clonée, dommages non déclarés). La vérification repose entièrement sur vous.",
          ],
        },
        {
          heading: "Comment vous protéger dans les deux cas",
          paragraphs: [
            "Vérifiez toujours le VIN et la propriété, contrôlez l'absence de crédit en cours, inspectez la voiture à froid et de jour, et obtenez un rapport d'historique.",
            "Pour une vente entre particuliers surtout, une pré-inspection indépendante ou par IA vaut bien plus que son coût. Un rapport CarGuard AI vous donne des constats documentés quel que soit le vendeur.",
          ],
        },
      ],
    },
  },
  // -------------------------------------------------------------------
  {
    slug: "used-electric-car-battery-health",
    updated: GUIDES_UPDATED,
    title: {
      en: "Buying a used electric car: how to check battery health",
      fr: "Acheter une voiture électrique d'occasion : vérifier l'état de la batterie",
    },
    description: {
      en: "The battery is the most valuable part of a used EV. Learn how to assess its health, range and warranty before you buy.",
      fr: "La batterie est l'élément le plus précieux d'un véhicule électrique d'occasion. Apprenez à évaluer son état, son autonomie et sa garantie avant d'acheter.",
    },
    body: {
      en: [
        {
          heading: "Why the battery is everything",
          paragraphs: [
            "On an electric car, the battery represents a large share of the value and the cost of any future repair. A healthy battery makes a used EV a great buy; a degraded one can be a money pit.",
          ],
        },
        {
          heading: "1. Check the state of health (SoH)",
          paragraphs: [
            "Many EVs display a battery state of health or you can read it via the car's menus or a diagnostic app. Above ~90% is excellent; gradual decline is normal, but a sharp drop for the age and mileage is a concern.",
          ],
        },
        {
          heading: "2. Compare real range to the original",
          paragraphs: [
            "Fully charge the car (or check a recent full charge) and compare the indicated range to the model's original figure. A large gap suggests meaningful degradation.",
          ],
        },
        {
          heading: "3. Verify the battery warranty",
          paragraphs: [
            "Most makers warrant the battery for around 8 years or 160,000 km, often guaranteeing a minimum capacity. Confirm what remains and whether it transfers to you.",
          ],
        },
        {
          heading: "4. Ask about charging habits",
          paragraphs: [
            "Frequent rapid (DC) charging and routinely charging to 100% can accelerate wear. A car mostly home-charged to 80% is generally gentler on the battery.",
          ],
        },
        {
          heading: "5. Don't forget the rest of the car",
          paragraphs: [
            "EVs still have tyres, brakes, suspension, 12V battery and bodywork. Inspect them as you would any used car — and EVs can be heavy, so check tyre and brake wear carefully.",
          ],
        },
        {
          heading: "6. Get the numbers in writing",
          paragraphs: [
            "Ask for a battery health report or a diagnostic readout, and keep it with the sale. Document the car's condition with photos; a CarGuard AI inspection can screen the bodywork and overall condition before you commit.",
          ],
        },
      ],
      fr: [
        {
          heading: "Pourquoi la batterie est primordiale",
          paragraphs: [
            "Sur une voiture électrique, la batterie représente une grande part de la valeur et du coût d'une future réparation. Une batterie en bon état fait d'un VE d'occasion une excellente affaire ; une batterie dégradée peut devenir un gouffre.",
          ],
        },
        {
          heading: "1. Vérifiez l'état de santé (SoH)",
          paragraphs: [
            "Beaucoup de VE affichent un état de santé de la batterie, lisible dans les menus ou via une application de diagnostic. Au-dessus d'environ 90 %, c'est excellent ; un déclin progressif est normal, mais une chute marquée au regard de l'âge et du kilométrage doit alerter.",
          ],
        },
        {
          heading: "2. Comparez l'autonomie réelle à l'origine",
          paragraphs: [
            "Chargez la voiture à fond (ou vérifiez une charge complète récente) et comparez l'autonomie indiquée au chiffre d'origine du modèle. Un écart important suggère une dégradation notable.",
          ],
        },
        {
          heading: "3. Vérifiez la garantie batterie",
          paragraphs: [
            "La plupart des constructeurs garantissent la batterie environ 8 ans ou 160 000 km, souvent avec une capacité minimale garantie. Confirmez ce qu'il reste et si elle vous est transférée.",
          ],
        },
        {
          heading: "4. Renseignez-vous sur les habitudes de charge",
          paragraphs: [
            "Une charge rapide (DC) fréquente et une charge systématique à 100 % accélèrent l'usure. Une voiture surtout rechargée à domicile à 80 % ménage généralement mieux la batterie.",
          ],
        },
        {
          heading: "5. N'oubliez pas le reste de la voiture",
          paragraphs: [
            "Un VE a aussi des pneus, des freins, une suspension, une batterie 12V et une carrosserie. Inspectez-les comme pour toute occasion — et comme les VE sont lourds, vérifiez soigneusement l'usure des pneus et des freins.",
          ],
        },
        {
          heading: "6. Obtenez les chiffres par écrit",
          paragraphs: [
            "Demandez un rapport d'état de la batterie ou un relevé de diagnostic, et conservez-le avec la vente. Documentez l'état de la voiture en photos ; une inspection CarGuard AI peut pré-diagnostiquer la carrosserie et l'état général avant de vous engager.",
          ],
        },
      ],
    },
  },
  // -------------------------------------------------------------------
  {
    slug: "used-car-test-drive-checklist",
    updated: GUIDES_UPDATED,
    title: {
      en: "The used car test drive checklist",
      fr: "La check-list de l'essai routier d'une voiture d'occasion",
    },
    description: {
      en: "A good test drive reveals what a parked car hides. Follow this checklist for the engine, gearbox, brakes, steering and more.",
      fr: "Un bon essai révèle ce qu'une voiture à l'arrêt cache. Suivez cette check-list pour le moteur, la boîte, les freins, la direction et plus encore.",
    },
    body: {
      en: [
        {
          heading: "Set up the drive properly",
          paragraphs: [
            "Insist on starting the car cold. Plan a route with low-speed streets, a faster road and a few bumps. Drive for at least 15–20 minutes and turn off the radio so you can hear the car.",
          ],
        },
        {
          heading: "1. Cold start and idle",
          paragraphs: [
            "Listen at start-up for knocking or rattling, watch for warning lights that stay on, and check the exhaust for blue or white smoke.",
          ],
        },
        {
          heading: "2. Engine under load",
          paragraphs: [
            "Accelerate firmly: power should build smoothly with no hesitation, flat spots, excessive smoke or unusual noise.",
          ],
        },
        {
          heading: "3. Gearbox and clutch",
          paragraphs: [
            "Manual: the clutch should bite cleanly and gears should engage without grinding. Automatic: shifts should be smooth, with no jolts, slipping or delay.",
          ],
        },
        {
          heading: "4. Brakes",
          paragraphs: [
            "On a clear road, brake firmly: the car should stop straight without pulling, vibration, squealing or a soft/spongy pedal.",
          ],
        },
        {
          heading: "5. Steering and suspension",
          paragraphs: [
            "Hands lightly on the wheel, the car should track straight. Listen for clunks over bumps and feel for vibration through the wheel, which can mean worn suspension or alignment issues.",
          ],
        },
        {
          heading: "6. Electronics and comfort",
          paragraphs: [
            "Test air conditioning, heating, windows, cruise control and driver aids during the drive. Faults are often easier to trigger when the car is running.",
          ],
        },
        {
          heading: "7. After the drive",
          paragraphs: [
            "Let it idle and look underneath for fresh leaks, check the temperature gauge is stable, and restart it warm. Then document anything you noticed.",
            "A CarGuard AI inspection complements the drive by screening bodywork and engine sound — useful evidence for your decision and negotiation.",
          ],
        },
      ],
      fr: [
        {
          heading: "Préparez bien l'essai",
          paragraphs: [
            "Exigez de démarrer la voiture à froid. Prévoyez un parcours avec des rues lentes, une route plus rapide et quelques bosses. Roulez au moins 15 à 20 minutes et coupez la radio pour entendre la voiture.",
          ],
        },
        {
          heading: "1. Démarrage à froid et ralenti",
          paragraphs: [
            "Écoutez au démarrage les cognements ou cliquetis, surveillez les voyants qui restent allumés, et vérifiez l'échappement (fumée bleue ou blanche).",
          ],
        },
        {
          heading: "2. Moteur en charge",
          paragraphs: [
            "Accélérez franchement : la puissance doit monter régulièrement, sans à-coup, trou, fumée excessive ni bruit inhabituel.",
          ],
        },
        {
          heading: "3. Boîte et embrayage",
          paragraphs: [
            "Manuelle : l'embrayage doit mordre nettement et les rapports passer sans craquement. Automatique : les passages doivent être doux, sans à-coups, patinage ni latence.",
          ],
        },
        {
          heading: "4. Freins",
          paragraphs: [
            "Sur une route dégagée, freinez fermement : la voiture doit s'arrêter droit, sans tirage, vibration, sifflement ni pédale molle.",
          ],
        },
        {
          heading: "5. Direction et suspension",
          paragraphs: [
            "Mains légères sur le volant, la voiture doit tenir le cap. Écoutez les bruits sur les bosses et sentez les vibrations dans le volant, signes d'une suspension usée ou d'un défaut de parallélisme.",
          ],
        },
        {
          heading: "6. Électronique et confort",
          paragraphs: [
            "Testez la climatisation, le chauffage, les vitres, le régulateur et les aides à la conduite pendant l'essai. Les pannes sont souvent plus faciles à déclencher moteur tournant.",
          ],
        },
        {
          heading: "7. Après l'essai",
          paragraphs: [
            "Laissez tourner au ralenti et regardez dessous d'éventuelles fuites fraîches, vérifiez que la température est stable, et redémarrez à chaud. Notez ensuite tout ce que vous avez remarqué.",
            "Une inspection CarGuard AI complète l'essai en pré-diagnostiquant la carrosserie et le son moteur — des preuves utiles pour votre décision et votre négociation.",
          ],
        },
      ],
    },
  },
  // -------------------------------------------------------------------
  {
    slug: "common-used-car-scams",
    updated: GUIDES_UPDATED,
    title: {
      en: "Common used car scams and how to avoid them",
      fr: "Les arnaques fréquentes à l'achat d'une voiture d'occasion",
    },
    description: {
      en: "From mileage rollback to cloned cars and fake escrow, here are the most common used car scams and the simple steps that defeat them.",
      fr: "Du trafic de compteur aux voitures clonées en passant par les faux séquestres, voici les arnaques les plus courantes et les gestes simples qui les déjouent.",
    },
    body: {
      en: [
        {
          heading: "Scams thrive on urgency",
          paragraphs: [
            "Almost every scam relies on pressure: a price \"too good to miss\", a buyer who must decide today, or a payment that must happen now. Slowing down is your best defence.",
          ],
        },
        {
          heading: "1. Mileage rollback",
          paragraphs: [
            "A wound-back odometer makes a worn car look fresh. Cross-check service records and a history report, and compare wear with the claimed mileage.",
          ],
        },
        {
          heading: "2. Cloned or stolen cars",
          paragraphs: [
            "A stolen car wears another car's identity (plates and VIN). Verify the VIN in every location matches the documents, and be wary of cheap prices with thin paperwork.",
          ],
        },
        {
          heading: "3. Hidden write-offs and repairs",
          paragraphs: [
            "A car repaired after a serious accident may be unsafe. A history report reveals insurance write-offs; a careful inspection reveals body and structural repairs.",
          ],
        },
        {
          heading: "4. Outstanding finance",
          paragraphs: [
            "If the seller still owes money on the car, the lender can reclaim it after you buy. Run a finance check before paying.",
          ],
        },
        {
          heading: "5. Fake escrow and shipping scams",
          paragraphs: [
            "Online, beware sellers who refuse to meet, ask for deposits via gift cards or wire transfer, or push a \"secure escrow\" link. Never pay for a car you have not seen in person.",
          ],
        },
        {
          heading: "6. Curbstoning (unlicensed dealers)",
          paragraphs: [
            "Someone posing as a private seller but flipping many cars (\"selling for a friend\", won't meet at home) dodges consumer protections. Ask to see the registration in their name.",
          ],
        },
        {
          heading: "Your simple defence kit",
          paragraphs: [
            "See the car in person and cold, verify VIN and ownership, run history and finance checks, never overpay a deposit, and get an inspection.",
            "A CarGuard AI report plus a history check turns most of these scams into obvious red flags before you lose any money.",
          ],
        },
      ],
      fr: [
        {
          heading: "Les arnaques se nourrissent de l'urgence",
          paragraphs: [
            "Presque toutes les arnaques reposent sur la pression : un prix « à ne pas manquer », un acheteur qui doit décider aujourd'hui, ou un paiement à effectuer tout de suite. Ralentir est votre meilleure défense.",
          ],
        },
        {
          heading: "1. Trafic du compteur",
          paragraphs: [
            "Un compteur trafiqué fait passer une voiture usée pour récente. Recoupez le carnet d'entretien et un rapport d'historique, et comparez l'usure au kilométrage annoncé.",
          ],
        },
        {
          heading: "2. Voitures clonées ou volées",
          paragraphs: [
            "Une voiture volée porte l'identité d'une autre (plaques et VIN). Vérifiez que le VIN correspond aux documents à tous les emplacements, et méfiez-vous des prix bas avec des papiers légers.",
          ],
        },
        {
          heading: "3. Épaves et réparations cachées",
          paragraphs: [
            "Une voiture réparée après un accident grave peut être dangereuse. Un rapport d'historique révèle les véhicules irréparables ; une inspection soignée révèle les réparations de carrosserie et structurelles.",
          ],
        },
        {
          heading: "4. Crédit en cours",
          paragraphs: [
            "Si le vendeur doit encore de l'argent sur la voiture, l'organisme prêteur peut la récupérer après l'achat. Faites une vérification de gage avant de payer.",
          ],
        },
        {
          heading: "5. Faux séquestre et arnaques à l'expédition",
          paragraphs: [
            "En ligne, méfiez-vous des vendeurs qui refusent de se rencontrer, demandent des acomptes par cartes cadeaux ou virement, ou poussent un lien de « séquestre sécurisé ». Ne payez jamais une voiture que vous n'avez pas vue en personne.",
          ],
        },
        {
          heading: "6. Faux particuliers (marchands déguisés)",
          paragraphs: [
            "Quelqu'un se faisant passer pour un particulier mais revendant de nombreuses voitures (« je vends pour un ami », refuse de recevoir chez lui) contourne les protections du consommateur. Demandez à voir la carte grise à son nom.",
          ],
        },
        {
          heading: "Votre kit de défense simple",
          paragraphs: [
            "Voyez la voiture en personne et à froid, vérifiez le VIN et la propriété, faites les contrôles d'historique et de gage, ne versez jamais un acompte trop élevé, et faites une inspection.",
            "Un rapport CarGuard AI et une vérification d'historique transforment la plupart de ces arnaques en signaux d'alerte évidents avant toute perte d'argent.",
          ],
        },
      ],
    },
  },
  // -------------------------------------------------------------------
  {
    slug: "how-much-mileage-is-too-much",
    updated: GUIDES_UPDATED,
    title: {
      en: "How much mileage is too much on a used car?",
      fr: "Quel kilométrage est trop élevé pour une voiture d'occasion ?",
    },
    description: {
      en: "Mileage matters, but how the car was used and maintained matters more. Here's how to judge whether a car's mileage is a problem.",
      fr: "Le kilométrage compte, mais l'usage et l'entretien comptent davantage. Voici comment juger si le kilométrage d'une voiture pose problème.",
    },
    body: {
      en: [
        {
          heading: "Mileage is only part of the story",
          paragraphs: [
            "A well-maintained, high-mileage car can be a better buy than a neglected low-mileage one. Cars are designed to run; how they were used and serviced matters more than a single number.",
          ],
        },
        {
          heading: "The rough yardstick",
          paragraphs: [
            "Cars average around 10,000–15,000 km (about 6,000–9,000 miles) a year. Compare the odometer with the age to see whether the car has done more or less than average.",
          ],
        },
        {
          heading: "Why low mileage isn't always good",
          paragraphs: [
            "A car that sat unused can suffer from perished seals, flat-spotted tyres, corroded brakes and a tired battery. Lots of short, cold trips are also harder on an engine than steady motorway miles.",
          ],
        },
        {
          heading: "Why high mileage isn't always bad",
          paragraphs: [
            "Mostly-motorway miles with a full service history and the major jobs (timing belt, clutch) already done can mean a reliable, well-understood car at a lower price.",
          ],
        },
        {
          heading: "What to check beyond the number",
          paragraphs: [
            "Service history, the condition of wear items (tyres, brakes, clutch), evidence the timing belt/chain was serviced on schedule, and whether wear inside the car matches the mileage.",
          ],
        },
        {
          heading: "Match mileage to your needs",
          paragraphs: [
            "For long daily commutes, a slightly higher-mileage car with great history can be smart. For occasional use, you may prefer lower mileage — just confirm it was driven and maintained, not left to rot.",
            "Whatever the mileage, a CarGuard AI inspection and a history check confirm the car's real condition matches the figure on the dash.",
          ],
        },
      ],
      fr: [
        {
          heading: "Le kilométrage n'est qu'une partie de l'histoire",
          paragraphs: [
            "Une voiture bien entretenue à fort kilométrage peut être un meilleur achat qu'une voiture peu kilométrée mais négligée. Les voitures sont faites pour rouler ; l'usage et l'entretien comptent plus qu'un simple chiffre.",
          ],
        },
        {
          heading: "Le repère approximatif",
          paragraphs: [
            "Une voiture parcourt en moyenne 10 000 à 15 000 km par an. Comparez le compteur à l'âge pour voir si la voiture a roulé plus ou moins que la moyenne.",
          ],
        },
        {
          heading: "Pourquoi un faible kilométrage n'est pas toujours bon",
          paragraphs: [
            "Une voiture restée immobile peut souffrir de joints durcis, de pneus déformés, de freins corrodés et d'une batterie fatiguée. De nombreux petits trajets à froid usent aussi plus le moteur que des kilomètres réguliers sur autoroute.",
          ],
        },
        {
          heading: "Pourquoi un fort kilométrage n'est pas toujours mauvais",
          paragraphs: [
            "Des kilomètres surtout autoroutiers, avec un carnet d'entretien complet et les gros travaux (distribution, embrayage) déjà faits, peuvent signifier une voiture fiable et bien connue à un prix plus bas.",
          ],
        },
        {
          heading: "Ce qu'il faut vérifier au-delà du chiffre",
          paragraphs: [
            "Le carnet d'entretien, l'état des pièces d'usure (pneus, freins, embrayage), la preuve d'un entretien de la distribution dans les temps, et la cohérence entre l'usure intérieure et le kilométrage.",
          ],
        },
        {
          heading: "Adaptez le kilométrage à vos besoins",
          paragraphs: [
            "Pour de longs trajets quotidiens, une voiture un peu plus kilométrée avec un excellent historique peut être judicieuse. Pour un usage occasionnel, vous préférerez peut-être un faible kilométrage — en confirmant qu'elle a roulé et été entretenue, pas laissée à l'abandon.",
            "Quel que soit le kilométrage, une inspection CarGuard AI et une vérification d'historique confirment que l'état réel de la voiture correspond au chiffre affiché.",
          ],
        },
      ],
    },
  },
  // -------------------------------------------------------------------
  {
    slug: "paperwork-when-buying-used-car",
    updated: GUIDES_UPDATED,
    title: {
      en: "Paperwork and documents when buying a used car",
      fr: "Les papiers et documents pour acheter une voiture d'occasion",
    },
    description: {
      en: "The right documents protect you and prove the car is legally and mechanically sound. Here's the paperwork checklist before you pay.",
      fr: "Les bons documents vous protègent et prouvent que la voiture est saine légalement et mécaniquement. Voici la check-list des papiers avant de payer.",
    },
    body: {
      en: [
        {
          heading: "Why paperwork protects you",
          paragraphs: [
            "Documents prove ownership, history and legality. Missing or inconsistent paperwork is one of the strongest reasons to walk away from an otherwise tempting car.",
          ],
        },
        {
          heading: "1. Registration / title",
          paragraphs: [
            "Confirm the seller's name matches the registration document and an ID. Check the VIN and details on the document against the car itself.",
          ],
        },
        {
          heading: "2. Service history and invoices",
          paragraphs: [
            "A stamped service book and receipts prove maintenance and record mileage over time. They are gold for trust and for resale value later.",
          ],
        },
        {
          heading: "3. Roadworthiness / inspection certificate",
          paragraphs: [
            "Where required (e.g. MOT in the UK, contrôle technique in France, state inspection in the US), check the latest certificate and any advisories listed on it.",
          ],
        },
        {
          heading: "4. Vehicle-history report",
          paragraphs: [
            "Confirms accidents, write-offs, mileage timeline and number of owners. Treat it as essential, especially in a private sale.",
          ],
        },
        {
          heading: "5. Finance and lien check",
          paragraphs: [
            "Make sure there is no outstanding loan secured against the car, which could let a lender reclaim it after you buy.",
          ],
        },
        {
          heading: "6. The sale receipt / bill of sale",
          paragraphs: [
            "Get a written receipt with both parties' details, the car's VIN, the price, the date and a condition statement. Keep a copy.",
          ],
        },
        {
          heading: "7. Hand-over checklist",
          paragraphs: [
            "Collect all keys, the owner's manual, locking wheel-nut key, service records and any accessories, and complete the change of ownership promptly.",
            "Pairing this paperwork with a CarGuard AI inspection report gives you a complete, documented picture of the car before money changes hands.",
          ],
        },
      ],
      fr: [
        {
          heading: "Pourquoi les papiers vous protègent",
          paragraphs: [
            "Les documents prouvent la propriété, l'historique et la légalité. Des papiers manquants ou incohérents sont l'une des meilleures raisons de renoncer à une voiture pourtant tentante.",
          ],
        },
        {
          heading: "1. Carte grise / certificat d'immatriculation",
          paragraphs: [
            "Vérifiez que le nom du vendeur correspond à la carte grise et à une pièce d'identité. Contrôlez le VIN et les informations du document avec la voiture elle-même.",
          ],
        },
        {
          heading: "2. Carnet d'entretien et factures",
          paragraphs: [
            "Un carnet tamponné et des factures prouvent l'entretien et enregistrent le kilométrage dans le temps. C'est précieux pour la confiance et pour la revente future.",
          ],
        },
        {
          heading: "3. Contrôle technique",
          paragraphs: [
            "Là où il est exigé (contrôle technique en France, MOT au Royaume-Uni, inspection selon l'État aux États-Unis), vérifiez le dernier procès-verbal et les défauts qui y sont signalés.",
          ],
        },
        {
          heading: "4. Rapport d'historique",
          paragraphs: [
            "Il confirme accidents, irréparables, courbe de kilométrage et nombre de propriétaires. À considérer comme indispensable, surtout entre particuliers.",
          ],
        },
        {
          heading: "5. Vérification de gage et de crédit",
          paragraphs: [
            "Assurez-vous qu'aucun crédit n'est en cours garanti par la voiture, ce qui pourrait permettre à un organisme de la récupérer après l'achat.",
          ],
        },
        {
          heading: "6. Le certificat de cession",
          paragraphs: [
            "Établissez un document écrit avec les coordonnées des deux parties, le VIN, le prix, la date et une mention sur l'état. Conservez-en une copie.",
          ],
        },
        {
          heading: "7. Check-list de remise des clés",
          paragraphs: [
            "Récupérez toutes les clés, le manuel, la clé d'antivol de roues, les justificatifs d'entretien et les accessoires, et effectuez rapidement le changement de titulaire.",
            "Associer ces papiers à un rapport d'inspection CarGuard AI vous donne une vision complète et documentée de la voiture avant tout échange d'argent.",
          ],
        },
      ],
    },
  },
  // -------------------------------------------------------------------
  {
    slug: "import-a-used-car",
    updated: GUIDES_UPDATED,
    title: {
      en: "How to import a used car",
      fr: "Comment importer une voiture d'occasion",
    },
    description: {
      en: "Importing can save money or find a rare model, but customs, taxes and registration add complexity. Here's how to import a used car safely.",
      fr: "Importer peut faire économiser ou dénicher un modèle rare, mais douane, taxes et immatriculation ajoutent de la complexité. Voici comment importer sereinement.",
    },
    body: {
      en: [
        {
          heading: "Why import a car",
          paragraphs: [
            "Importing can mean a lower price, a specification not sold locally, or a rare model. But the savings only make sense once you have counted every cost and confirmed the car can be legally registered where you live.",
          ],
        },
        {
          heading: "1. Check it can be registered",
          paragraphs: [
            "Before anything, confirm the model meets your country's standards (emissions, lights, safety) and can obtain a certificate of conformity. A car that cannot be registered is worthless to you.",
          ],
        },
        {
          heading: "2. Count the true total cost",
          paragraphs: [
            "Add the purchase price, transport, import duty, VAT/taxes, conformity and any modifications, inspection and registration fees. Compare that grand total — not just the sticker price — with a local equivalent.",
          ],
        },
        {
          heading: "3. Verify the car remotely",
          paragraphs: [
            "Buying at a distance increases risk. Get many detailed photos, a video, the VIN and a vehicle-history report, and ideally a local inspection before you pay.",
          ],
        },
        {
          heading: "4. Handle customs and taxes",
          paragraphs: [
            "Within trade areas (e.g. the EU) the process is simpler; from outside, expect import duty and local taxes. Keep every document — purchase invoice, transport papers, proof of tax — for registration.",
          ],
        },
        {
          heading: "5. Conformity and technical checks",
          paragraphs: [
            "You may need a certificate of conformity and a technical/roadworthiness inspection in the destination country before plates are issued. Some cars need minor modifications (lights, units) to comply.",
          ],
        },
        {
          heading: "6. Register and insure",
          paragraphs: [
            "Complete the change of ownership, pay any registration tax, get plates and arrange insurance before driving.",
            "Even when importing, a photo-based pre-screening like CarGuard AI helps catch bodywork or repair red flags before you commit to a car you cannot easily inspect in person.",
          ],
        },
      ],
      fr: [
        {
          heading: "Pourquoi importer une voiture",
          paragraphs: [
            "Importer peut signifier un prix plus bas, une finition non vendue localement, ou un modèle rare. Mais l'économie n'a de sens qu'une fois tous les coûts additionnés et la possibilité d'immatriculer la voiture confirmée chez vous.",
          ],
        },
        {
          heading: "1. Vérifiez qu'elle est immatriculable",
          paragraphs: [
            "Avant tout, confirmez que le modèle respecte les normes de votre pays (émissions, éclairage, sécurité) et peut obtenir un certificat de conformité. Une voiture non immatriculable n'a aucune valeur pour vous.",
          ],
        },
        {
          heading: "2. Calculez le coût total réel",
          paragraphs: [
            "Additionnez le prix d'achat, le transport, les droits de douane, la TVA/taxes, la conformité et d'éventuelles modifications, l'inspection et les frais d'immatriculation. Comparez ce total — pas seulement le prix affiché — avec un équivalent local.",
          ],
        },
        {
          heading: "3. Vérifiez la voiture à distance",
          paragraphs: [
            "Acheter à distance augmente le risque. Obtenez de nombreuses photos détaillées, une vidéo, le VIN et un rapport d'historique, et idéalement une inspection locale avant de payer.",
          ],
        },
        {
          heading: "4. Gérez douane et taxes",
          paragraphs: [
            "À l'intérieur d'une zone d'échange (ex. l'UE), la procédure est plus simple ; depuis l'extérieur, prévoyez droits de douane et taxes locales. Conservez chaque document — facture d'achat, papiers de transport, preuve de taxe — pour l'immatriculation.",
          ],
        },
        {
          heading: "5. Conformité et contrôles techniques",
          paragraphs: [
            "Un certificat de conformité et un contrôle technique peuvent être exigés dans le pays de destination avant l'émission des plaques. Certaines voitures nécessitent de petites modifications (éclairage, unités) pour être conformes.",
          ],
        },
        {
          heading: "6. Immatriculez et assurez",
          paragraphs: [
            "Effectuez le changement de titulaire, payez l'éventuelle taxe d'immatriculation, obtenez les plaques et souscrivez une assurance avant de rouler.",
            "Même à l'import, un pré-diagnostic par photos comme CarGuard AI aide à repérer les signaux de carrosserie ou de réparation avant de vous engager sur une voiture difficile à inspecter en personne.",
          ],
        },
      ],
    },
  },
  // -------------------------------------------------------------------
  {
    slug: "used-car-warranty-explained",
    updated: GUIDES_UPDATED,
    title: {
      en: "Used car warranties explained",
      fr: "La garantie d'une voiture d'occasion expliquée",
    },
    description: {
      en: "Legal warranty, dealer warranty, extended cover or none at all — understand what protects you when buying a used car and what each really covers.",
      fr: "Garantie légale, garantie du vendeur, extension ou rien du tout — comprenez ce qui vous protège à l'achat d'une voiture d'occasion et ce que chacune couvre vraiment.",
    },
    body: {
      en: [
        {
          heading: "Why warranty matters",
          paragraphs: [
            "A warranty decides who pays if something fails soon after purchase. The level of protection differs hugely between a dealer and a private sale, so know what you actually have.",
          ],
        },
        {
          heading: "1. Legal / statutory protection",
          paragraphs: [
            "In many countries, buying from a professional gives you a legal guarantee against hidden defects or non-conformity for a set period. Private sales usually offer far weaker protection — closer to \"sold as seen\".",
          ],
        },
        {
          heading: "2. Dealer (commercial) warranty",
          paragraphs: [
            "Dealers often add their own warranty of a few months to a year. Read exactly what it covers (parts, labour, which components) and what voids it.",
          ],
        },
        {
          heading: "3. Manufacturer warranty remaining",
          paragraphs: [
            "A newer used car may still have part of the original manufacturer warranty, which usually transfers to you. Confirm the dates and any service conditions to keep it valid.",
          ],
        },
        {
          heading: "4. Extended warranties",
          paragraphs: [
            "Optional extended cover can be worth it on complex or expensive cars, but read the exclusions, claim limits and excess carefully — many cover less than buyers expect.",
          ],
        },
        {
          heading: "5. What warranties usually exclude",
          paragraphs: [
            "Wear items (tyres, brakes, clutch), pre-existing faults, damage from poor maintenance and cosmetic issues are commonly excluded. A warranty is not a substitute for buying a sound car.",
          ],
        },
        {
          heading: "6. Get it in writing",
          paragraphs: [
            "Whatever the cover, keep the warranty terms and the sale documents. The best protection is still buying a car in good condition in the first place.",
            "A CarGuard AI inspection before purchase reduces the chance you ever need to rely on a warranty at all.",
          ],
        },
      ],
      fr: [
        {
          heading: "Pourquoi la garantie compte",
          paragraphs: [
            "Une garantie détermine qui paie si une panne survient peu après l'achat. Le niveau de protection diffère énormément entre un professionnel et une vente entre particuliers : sachez ce dont vous disposez réellement.",
          ],
        },
        {
          heading: "1. Protection légale",
          paragraphs: [
            "Dans de nombreux pays, l'achat chez un professionnel ouvre une garantie légale contre les vices cachés ou la non-conformité pendant une durée donnée. Les ventes entre particuliers offrent une protection bien plus faible — proche du « vendu en l'état ».",
          ],
        },
        {
          heading: "2. Garantie commerciale du vendeur",
          paragraphs: [
            "Les professionnels ajoutent souvent leur propre garantie de quelques mois à un an. Lisez précisément ce qu'elle couvre (pièces, main-d'œuvre, quels organes) et ce qui l'annule.",
          ],
        },
        {
          heading: "3. Garantie constructeur restante",
          paragraphs: [
            "Une occasion récente peut conserver une partie de la garantie constructeur d'origine, généralement transférable. Vérifiez les dates et les conditions d'entretien pour la maintenir valide.",
          ],
        },
        {
          heading: "4. Les extensions de garantie",
          paragraphs: [
            "Une extension optionnelle peut valoir le coup sur des voitures complexes ou coûteuses, mais lisez attentivement les exclusions, plafonds et franchises — beaucoup couvrent moins que ce que l'acheteur imagine.",
          ],
        },
        {
          heading: "5. Ce que les garanties excluent souvent",
          paragraphs: [
            "Les pièces d'usure (pneus, freins, embrayage), les défauts préexistants, les dommages dus à un mauvais entretien et les soucis esthétiques sont fréquemment exclus. Une garantie ne remplace pas l'achat d'une voiture saine.",
          ],
        },
        {
          heading: "6. Obtenez tout par écrit",
          paragraphs: [
            "Quelle que soit la couverture, conservez les conditions de garantie et les documents de vente. La meilleure protection reste d'acheter d'emblée une voiture en bon état.",
            "Une inspection CarGuard AI avant l'achat réduit le risque d'avoir un jour à recourir à une garantie.",
          ],
        },
      ],
    },
  },
  // -------------------------------------------------------------------
  {
    slug: "car-insurance-before-buying",
    updated: GUIDES_UPDATED,
    title: {
      en: "Car insurance: what to sort before you buy",
      fr: "Assurance auto : ce qu'il faut régler avant d'acheter",
    },
    description: {
      en: "Insurance cost can make or break a used car deal. Here's how to estimate premiums, arrange cover for the drive home, and avoid surprises.",
      fr: "Le coût de l'assurance peut faire ou défaire une affaire. Voici comment estimer les primes, assurer le trajet retour et éviter les surprises.",
    },
    body: {
      en: [
        {
          heading: "Insurance is part of the price",
          paragraphs: [
            "Two similar cars can cost very different amounts to insure. Always get a quote before you buy — a cheap car with a high premium may cost more overall than a pricier, cheaper-to-insure one.",
          ],
        },
        {
          heading: "1. Get quotes before committing",
          paragraphs: [
            "Run quotes for the exact model, version and engine you are considering. Insurance groups vary by power, repair cost and theft risk, sometimes dramatically within the same model range.",
          ],
        },
        {
          heading: "2. Understand what drives the premium",
          paragraphs: [
            "Your age and history, where you park, annual mileage, the car's value and power, and its security all affect the price. Performance versions and large engines usually cost much more.",
          ],
        },
        {
          heading: "3. Choose the right level of cover",
          paragraphs: [
            "Comprehensive cover protects your own car too; third-party is cheaper but pays only for others' damage. On an older, low-value car, full cover may not be worth it.",
          ],
        },
        {
          heading: "4. Arrange cover for the drive home",
          paragraphs: [
            "You must be insured the moment you drive away. Set up a policy or temporary cover to start on collection day so you are never driving uninsured.",
          ],
        },
        {
          heading: "5. Watch for cost multipliers",
          paragraphs: [
            "Modifications, a salvage/repaired title, or imported status can raise premiums or require specialist insurers. Factor this in before you buy such a car.",
          ],
        },
        {
          heading: "6. Keep the total cost in view",
          paragraphs: [
            "Budget for insurance, fuel/charging, tax, servicing and tyres — not just the purchase. A CarGuard AI inspection helps confirm the car's condition so your running-cost estimate is realistic.",
          ],
        },
      ],
      fr: [
        {
          heading: "L'assurance fait partie du prix",
          paragraphs: [
            "Deux voitures similaires peuvent coûter très différemment à assurer. Obtenez toujours un devis avant d'acheter — une voiture pas chère mais à prime élevée peut coûter plus cher au total qu'un modèle plus cher mais moins cher à assurer.",
          ],
        },
        {
          heading: "1. Faites des devis avant de vous engager",
          paragraphs: [
            "Demandez des devis pour le modèle, la version et le moteur exacts envisagés. Les groupes d'assurance varient selon la puissance, le coût de réparation et le risque de vol, parfois fortement au sein d'une même gamme.",
          ],
        },
        {
          heading: "2. Comprenez ce qui fait la prime",
          paragraphs: [
            "Votre âge et votre historique, votre lieu de stationnement, le kilométrage annuel, la valeur et la puissance de la voiture, et sa sécurité influencent le prix. Les versions performantes et les gros moteurs coûtent généralement beaucoup plus.",
          ],
        },
        {
          heading: "3. Choisissez le bon niveau de couverture",
          paragraphs: [
            "L'assurance tous risques protège aussi votre voiture ; au tiers, c'est moins cher mais cela ne couvre que les dommages causés à autrui. Sur une voiture ancienne et de faible valeur, le tous risques n'est pas toujours rentable.",
          ],
        },
        {
          heading: "4. Assurez le trajet retour",
          paragraphs: [
            "Vous devez être assuré dès que vous partez. Mettez en place un contrat ou une assurance temporaire débutant le jour de la remise pour ne jamais rouler sans assurance.",
          ],
        },
        {
          heading: "5. Attention aux facteurs aggravants",
          paragraphs: [
            "Des modifications, un titre « réparé/épave » ou un statut importé peuvent augmenter les primes ou nécessiter des assureurs spécialisés. Intégrez-le avant d'acheter une telle voiture.",
          ],
        },
        {
          heading: "6. Gardez le coût total en tête",
          paragraphs: [
            "Budgétez l'assurance, le carburant/la recharge, la taxe, l'entretien et les pneus — pas seulement l'achat. Une inspection CarGuard AI aide à confirmer l'état de la voiture pour une estimation réaliste des coûts d'usage.",
          ],
        },
      ],
    },
  },
  // -------------------------------------------------------------------
  {
    slug: "which-car-type-to-choose",
    updated: GUIDES_UPDATED,
    title: {
      en: "City car, saloon or SUV: which type to choose",
      fr: "Citadine, berline ou SUV : quel type de voiture choisir",
    },
    description: {
      en: "The right body type depends on your real needs, not trends. Compare city cars, saloons, estates and SUVs on cost, space and running costs.",
      fr: "Le bon type de carrosserie dépend de vos besoins réels, pas des tendances. Comparez citadines, berlines, breaks et SUV sur le coût, l'espace et l'usage.",
    },
    body: {
      en: [
        {
          heading: "Start from your real needs",
          paragraphs: [
            "Choose by how you actually drive — daily distance, passengers, parking, terrain and budget — not by what is fashionable. The cheapest car to own is the one that fits your life.",
          ],
        },
        {
          heading: "City cars",
          paragraphs: [
            "Small, cheap to buy, insure and park, and efficient in town. Less comfortable on long motorway trips and tighter on space, but ideal for urban use and new drivers.",
          ],
        },
        {
          heading: "Saloons and hatchbacks",
          paragraphs: [
            "A balanced all-rounder: comfortable, efficient and practical for most families, usually cheaper to buy and run than an equivalent SUV.",
          ],
        },
        {
          heading: "Estates (wagons)",
          paragraphs: [
            "The space of an SUV with car-like running costs and handling. Excellent for families and big loads if you do not need extra ground clearance.",
          ],
        },
        {
          heading: "SUVs and crossovers",
          paragraphs: [
            "High driving position, space and a feeling of safety, plus all-wheel-drive options. But they usually cost more to buy, fuel and insure, and use more tyres and brakes due to weight.",
          ],
        },
        {
          heading: "Match running costs to budget",
          paragraphs: [
            "Bigger and heavier generally means higher fuel, tyre and insurance costs. Be honest about whether you need the size or just want it.",
          ],
        },
        {
          heading: "Whatever you pick, inspect it",
          paragraphs: [
            "Each type has typical weak points — clutches on city cars, suspension and brakes on heavy SUVs. A CarGuard AI inspection screens the specific car's condition before you buy.",
          ],
        },
      ],
      fr: [
        {
          heading: "Partez de vos besoins réels",
          paragraphs: [
            "Choisissez selon votre usage réel — distance quotidienne, passagers, stationnement, terrain et budget — pas selon la mode. La voiture la moins chère à posséder est celle qui correspond à votre vie.",
          ],
        },
        {
          heading: "Les citadines",
          paragraphs: [
            "Petites, peu chères à l'achat, à l'assurance et au stationnement, et économes en ville. Moins confortables sur longs trajets autoroutiers et plus justes en espace, mais idéales en usage urbain et pour les jeunes conducteurs.",
          ],
        },
        {
          heading: "Berlines et compactes",
          paragraphs: [
            "Le bon compromis polyvalent : confortable, économe et pratique pour la plupart des familles, généralement moins cher à l'achat et à l'usage qu'un SUV équivalent.",
          ],
        },
        {
          heading: "Les breaks",
          paragraphs: [
            "L'espace d'un SUV avec des coûts d'usage et un comportement de voiture. Excellents pour les familles et les gros chargements si vous n'avez pas besoin de garde au sol supplémentaire.",
          ],
        },
        {
          heading: "SUV et crossovers",
          paragraphs: [
            "Position de conduite haute, espace et sentiment de sécurité, plus des options à quatre roues motrices. Mais ils coûtent généralement plus cher à l'achat, en carburant et en assurance, et usent plus pneus et freins du fait du poids.",
          ],
        },
        {
          heading: "Adaptez les coûts d'usage au budget",
          paragraphs: [
            "Plus gros et plus lourd signifie généralement plus de carburant, de pneus et d'assurance. Soyez honnête : avez-vous besoin de la taille ou en avez-vous seulement envie ?",
          ],
        },
        {
          heading: "Quel que soit le choix, inspectez",
          paragraphs: [
            "Chaque type a ses points faibles typiques — embrayage des citadines, suspension et freins des SUV lourds. Une inspection CarGuard AI pré-diagnostique l'état de la voiture précise avant l'achat.",
          ],
        },
      ],
    },
  },
  // -------------------------------------------------------------------
  {
    slug: "first-car-budget",
    updated: GUIDES_UPDATED,
    title: {
      en: "Buying your first car: how to set a budget",
      fr: "Acheter sa première voiture : comment fixer son budget",
    },
    description: {
      en: "Your first car costs more than its price tag. Learn how to budget for purchase, insurance, fuel, tax and repairs — and avoid first-buyer mistakes.",
      fr: "Une première voiture coûte plus que son prix affiché. Apprenez à budgéter l'achat, l'assurance, le carburant, la taxe et les réparations — et à éviter les erreurs de débutant.",
    },
    body: {
      en: [
        {
          heading: "Think total cost, not sticker price",
          paragraphs: [
            "The purchase price is only the start. A realistic first-car budget includes insurance (often high for new drivers), fuel or charging, tax, maintenance, tyres and a buffer for surprises.",
          ],
        },
        {
          heading: "1. Set a hard purchase limit",
          paragraphs: [
            "Decide the maximum you will spend on the car itself and keep some money aside — never spend your entire budget on the purchase and leave nothing for insurance and repairs.",
          ],
        },
        {
          heading: "2. Get insurance quotes first",
          paragraphs: [
            "For a new driver, insurance can rival the car's price. Quote a few candidate models before choosing — a small, low-power car is usually far cheaper to insure.",
          ],
        },
        {
          heading: "3. Budget for running costs",
          paragraphs: [
            "Estimate annual fuel/charging from your mileage, plus tax and routine servicing. Older cars are cheaper to buy but can cost more to keep running.",
          ],
        },
        {
          heading: "4. Keep a repair buffer",
          paragraphs: [
            "Set aside a few hundred for the first wear items — tyres, brakes, battery — which often need attention soon after buying an older car.",
          ],
        },
        {
          heading: "5. Choose a sensible first car",
          paragraphs: [
            "Favour a common, simple, reliable model with cheap parts and a low insurance group. Avoid powerful or complex cars as a first purchase — they cost more to insure, fuel and fix.",
          ],
        },
        {
          heading: "6. Don't skip the inspection",
          paragraphs: [
            "First-time buyers are the most likely to miss hidden problems. A CarGuard AI inspection and a quick history check are cheap insurance against an expensive mistake.",
          ],
        },
      ],
      fr: [
        {
          heading: "Raisonnez coût total, pas prix affiché",
          paragraphs: [
            "Le prix d'achat n'est qu'un début. Un budget réaliste de première voiture inclut l'assurance (souvent élevée pour les jeunes conducteurs), le carburant ou la recharge, la taxe, l'entretien, les pneus et une marge pour les imprévus.",
          ],
        },
        {
          heading: "1. Fixez une limite d'achat ferme",
          paragraphs: [
            "Décidez du maximum à consacrer à la voiture elle-même et gardez de l'argent de côté — ne dépensez jamais tout votre budget à l'achat sans rien laisser pour l'assurance et les réparations.",
          ],
        },
        {
          heading: "2. Faites d'abord des devis d'assurance",
          paragraphs: [
            "Pour un jeune conducteur, l'assurance peut rivaliser avec le prix de la voiture. Demandez des devis pour quelques modèles candidats avant de choisir — une petite voiture peu puissante est généralement bien moins chère à assurer.",
          ],
        },
        {
          heading: "3. Budgétez les coûts d'usage",
          paragraphs: [
            "Estimez le carburant/la recharge annuels selon votre kilométrage, plus la taxe et l'entretien courant. Les voitures anciennes coûtent moins cher à l'achat mais peuvent coûter plus cher à entretenir.",
          ],
        },
        {
          heading: "4. Prévoyez une réserve réparations",
          paragraphs: [
            "Mettez de côté quelques centaines d'euros pour les premières pièces d'usure — pneus, freins, batterie — souvent à prévoir peu après l'achat d'une voiture ancienne.",
          ],
        },
        {
          heading: "5. Choisissez une première voiture raisonnable",
          paragraphs: [
            "Privilégiez un modèle courant, simple et fiable, à pièces peu chères et groupe d'assurance bas. Évitez les voitures puissantes ou complexes pour un premier achat — elles coûtent plus cher à assurer, en carburant et en réparation.",
          ],
        },
        {
          heading: "6. Ne sautez pas l'inspection",
          paragraphs: [
            "Les primo-acheteurs sont les plus susceptibles de manquer des problèmes cachés. Une inspection CarGuard AI et une vérification rapide d'historique sont une assurance bon marché contre une erreur coûteuse.",
          ],
        },
      ],
    },
  },
  // -------------------------------------------------------------------
  {
    slug: "petrol-diesel-hybrid-or-electric",
    updated: GUIDES_UPDATED,
    title: {
      en: "Petrol, diesel, hybrid or electric: which to choose",
      fr: "Essence, diesel, hybride ou électrique : que choisir",
    },
    description: {
      en: "Each fuel type suits a different driver. Compare petrol, diesel, hybrid and electric on cost, mileage and use to pick the right used car.",
      fr: "Chaque motorisation convient à un profil différent. Comparez essence, diesel, hybride et électrique sur le coût, le kilométrage et l'usage pour bien choisir.",
    },
    body: {
      en: [
        {
          heading: "There is no single best fuel",
          paragraphs: [
            "The right choice depends on your mileage, the type of journeys you make and where you can refuel or charge. Match the fuel to your driving, not to the trend of the moment.",
          ],
        },
        {
          heading: "Petrol",
          paragraphs: [
            "Cheaper to buy, simpler and quieter, and well suited to lower mileage and town driving. Slightly higher fuel use on long trips than diesel, but fewer expensive emissions parts to fail.",
          ],
        },
        {
          heading: "Diesel",
          paragraphs: [
            "Efficient and strong for high annual mileage and motorway driving. But on short, urban trips the emissions systems (DPF, EGR) can clog and become costly — avoid a city-only diesel.",
          ],
        },
        {
          heading: "Hybrid",
          paragraphs: [
            "Great for mixed and urban driving, with low fuel use and no range anxiety. Check the condition of the hybrid battery and that both the electric and petrol systems work smoothly.",
          ],
        },
        {
          heading: "Electric",
          paragraphs: [
            "Lowest running costs and ideal if you can charge at home, but purchase price and battery health are key. Confirm real-world range and remaining battery warranty.",
          ],
        },
        {
          heading: "Match it to your mileage",
          paragraphs: [
            "Low mileage / city: petrol or hybrid. High motorway mileage: diesel or hybrid. Home charging and short-to-medium trips: electric. Be honest about your real pattern.",
          ],
        },
        {
          heading: "Inspect the right things",
          paragraphs: [
            "Each type has specific checks — DPF on diesels, battery health on hybrids and EVs, belts and chains on petrols. A CarGuard AI inspection screens bodywork and engine condition whatever the fuel.",
          ],
        },
      ],
      fr: [
        {
          heading: "Il n'y a pas une seule meilleure motorisation",
          paragraphs: [
            "Le bon choix dépend de votre kilométrage, du type de trajets et de l'endroit où vous pouvez faire le plein ou recharger. Adaptez la motorisation à votre conduite, pas à la tendance du moment.",
          ],
        },
        {
          heading: "Essence",
          paragraphs: [
            "Moins chère à l'achat, plus simple et plus silencieuse, bien adaptée aux faibles kilométrages et à la ville. Consommation un peu plus élevée que le diesel sur longs trajets, mais moins de pièces de dépollution coûteuses à tomber en panne.",
          ],
        },
        {
          heading: "Diesel",
          paragraphs: [
            "Économe et performant pour de gros kilométrages annuels et l'autoroute. Mais sur de courts trajets urbains, les systèmes de dépollution (FAP, EGR) peuvent s'encrasser et coûter cher — évitez un diesel uniquement citadin.",
          ],
        },
        {
          heading: "Hybride",
          paragraphs: [
            "Idéal pour un usage mixte et urbain, avec une faible consommation et sans angoisse d'autonomie. Vérifiez l'état de la batterie hybride et le bon fonctionnement des systèmes électrique et essence.",
          ],
        },
        {
          heading: "Électrique",
          paragraphs: [
            "Coûts d'usage les plus bas et idéal si vous pouvez recharger à domicile, mais le prix d'achat et l'état de la batterie sont décisifs. Confirmez l'autonomie réelle et la garantie batterie restante.",
          ],
        },
        {
          heading: "Adaptez à votre kilométrage",
          paragraphs: [
            "Faible kilométrage / ville : essence ou hybride. Gros kilométrage autoroutier : diesel ou hybride. Recharge à domicile et trajets courts à moyens : électrique. Soyez honnête sur votre usage réel.",
          ],
        },
        {
          heading: "Inspectez les bons points",
          paragraphs: [
            "Chaque type a ses vérifications — FAP sur les diesels, état de batterie sur hybrides et VE, courroies et chaînes sur les essences. Une inspection CarGuard AI pré-diagnostique la carrosserie et l'état moteur quelle que soit la motorisation.",
          ],
        },
      ],
    },
  },
];

export function guideBySlug(slug: string): Guide | undefined {
  return GUIDES.find((g) => g.slug === slug);
}
