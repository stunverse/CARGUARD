// =====================================================================
// CarGuard AI — SEO content: full FAQ (bilingual FR/EN)
// Used by the dedicated /faq page and its FAQPage structured data.
// =====================================================================

import type { Locale } from "@/lib/i18n";

export interface FaqItem {
  question: Record<Locale, string>;
  answer: Record<Locale, string>;
}

export const FAQ_ITEMS: FaqItem[] = [
  {
    question: {
      en: "Does CarGuard AI replace a mechanic or a professional inspection?",
      fr: "CarGuard AI remplace-t-il un mécanicien ou une inspection professionnelle ?",
    },
    answer: {
      en: "No. CarGuard AI is a fast, AI-based pre-screening from the photos, sounds and documents you provide. It flags suspicious areas so you can ask better questions and negotiate, but a professional inspection is still recommended before a final decision.",
      fr: "Non. CarGuard AI est un pré-diagnostic rapide par IA à partir de vos photos, sons et documents. Il signale les zones suspectes pour mieux questionner le vendeur et négocier, mais une inspection professionnelle reste recommandée avant la décision finale.",
    },
  },
  {
    question: {
      en: "How much does an inspection cost?",
      fr: "Combien coûte une inspection ?",
    },
    answer: {
      en: "You pay once per inspection — there is no subscription. The exact price is shown before you pay, in your local currency.",
      fr: "Vous payez une fois par inspection — sans abonnement. Le prix exact est affiché avant le paiement, dans votre devise locale.",
    },
  },
  {
    question: {
      en: "How long does an inspection take?",
      fr: "Combien de temps prend une inspection ?",
    },
    answer: {
      en: "About 10–15 minutes to capture the guided photos and sounds, then the AI report is generated in a few minutes.",
      fr: "Environ 10 à 15 minutes pour capturer les photos et sons guidés, puis le rapport IA est généré en quelques minutes.",
    },
  },
  {
    question: {
      en: "What does CarGuard AI actually check?",
      fr: "Que vérifie réellement CarGuard AI ?",
    },
    answer: {
      en: "It analyses bodywork (panel alignment, paint and color consistency, signs of repair or repaint), engine start-up sound, and — where available — vehicle history, mileage and market value.",
      fr: "Il analyse la carrosserie (alignement des panneaux, cohérence de peinture et de teinte, signes de réparation ou de repeinte), le son de démarrage du moteur et — si disponible — l'historique, le kilométrage et la valeur de marché.",
    },
  },
  {
    question: {
      en: "Do I need any car knowledge to use it?",
      fr: "Faut-il des connaissances en mécanique pour l'utiliser ?",
    },
    answer: {
      en: "No. Every photo and check is guided step by step, so anyone can complete an inspection.",
      fr: "Non. Chaque photo et chaque contrôle est guidé étape par étape : tout le monde peut réaliser une inspection.",
    },
  },
  {
    question: {
      en: "Which countries are supported?",
      fr: "Quels pays sont pris en charge ?",
    },
    answer: {
      en: "CarGuard AI works in the United States and across Europe, with localized currency and units (km/mi). Vehicle-history coverage depends on the country and data sources.",
      fr: "CarGuard AI fonctionne aux États-Unis et en Europe, avec devise et unités localisées (km/mi). La couverture de l'historique dépend du pays et des sources de données.",
    },
  },
  {
    question: {
      en: "How accurate are the results?",
      fr: "Quelle est la fiabilité des résultats ?",
    },
    answer: {
      en: "Results are estimates expressed as probabilities, based only on the media you provide. Better photos in good light give better analysis. They are a screening aid, not a guarantee about a vehicle's condition or history.",
      fr: "Les résultats sont des estimations exprimées en probabilités, basées uniquement sur les médias fournis. De meilleures photos, bien éclairées, donnent une meilleure analyse. C'est une aide au pré-diagnostic, pas une garantie sur l'état ou l'historique du véhicule.",
    },
  },
  {
    question: {
      en: "Is my data private?",
      fr: "Mes données sont-elles confidentielles ?",
    },
    answer: {
      en: "Yes. Your media is stored privately and processed by our AI providers only to produce your report. We never sell your personal data, and you can delete your media and account at any time. See our Privacy Policy for details.",
      fr: "Oui. Vos médias sont stockés de manière privée et traités par nos prestataires d'IA uniquement pour produire votre rapport. Nous ne vendons jamais vos données et vous pouvez supprimer vos médias et votre compte à tout moment. Voir notre politique de confidentialité.",
    },
  },
  {
    question: {
      en: "Can I get a refund?",
      fr: "Puis-je être remboursé ?",
    },
    answer: {
      en: "Unused credits can be refunded within 14 days of purchase. Once an inspection's analysis has started, the service is considered delivered. See our Sales Terms (CGV) for details.",
      fr: "Les crédits non utilisés peuvent être remboursés dans les 14 jours suivant l'achat. Une fois l'analyse d'une inspection démarrée, le service est considéré comme exécuté. Voir nos CGV pour les détails.",
    },
  },
];
