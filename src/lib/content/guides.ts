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
];

export function guideBySlug(slug: string): Guide | undefined {
  return GUIDES.find((g) => g.slug === slug);
}
