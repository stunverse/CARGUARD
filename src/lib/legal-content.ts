// =====================================================================
// CarGuard AI — Legal content (Privacy, Terms/CGU, Sales terms/CGV)
//
// ⚠️ DRAFT TEMPLATES — have a lawyer review before launch. Placeholders in
// [BRACKETS] must be filled with the operating company's real details.
// Bilingual FR/EN. Rendered by <LegalDoc/>.
// =====================================================================

import type { Locale } from "@/lib/i18n";

export interface LegalSection {
  heading: string;
  paragraphs: string[];
}
export interface LegalDocContent {
  title: string;
  updated: string;
  intro: string;
  sections: LegalSection[];
}

export const LEGAL_UPDATED = { en: "19 June 2026", fr: "19 juin 2026" };

// Company identity — fill these in before launch.
const CO = {
  name: "Stunverse&Co L.L.C.",
  form: "Limited Liability Company (LLC), Wyoming, USA",
  address: "30 N Gould St, Ste N, Sheridan, WY 82801, USA",
  email: "contact@carguard-ai.com",
  dpo: "contact@carguard-ai.com",
  director: "Mamadou Doucoure",
};

// ---------------------------------------------------------------------
// PRIVACY POLICY
// ---------------------------------------------------------------------
export const PRIVACY: Record<Locale, LegalDocContent> = {
  en: {
    title: "Privacy Policy",
    updated: LEGAL_UPDATED.en,
    intro:
      `This policy explains how CarGuard AI (operated by ${CO.name}, ${CO.address}) collects and processes your personal data under the EU GDPR and applicable laws. Data controller: ${CO.name} — ${CO.email}.`,
    sections: [
      {
        heading: "1. Data we collect",
        paragraphs: [
          "Account data: email, name, phone, country, language, password (hashed by our auth provider).",
          "Inspection data you provide: vehicle details (make, model, year, VIN, mileage, price), the 8 exterior photos, engine videos/photos, start-up audio, and the documents you photograph (registration, maintenance records, etc.).",
          "Payment data: handled by Stripe. We never store your full card number; we keep payment status, amount, currency and a Stripe identifier.",
          "Usage data: activity logs, device/browser information and technical logs needed to run and secure the service.",
        ],
      },
      {
        heading: "2. Purposes and legal bases",
        paragraphs: [
          "Provide the inspection and generate your report (performance of our contract).",
          "Process payments and prevent fraud (contract + legal obligation).",
          "Run AI analysis of your photos, audio and documents to produce the report (performance of our contract).",
          "Improve and secure the service (our legitimate interest).",
          "Send service emails (contract); marketing only with your consent.",
        ],
      },
      {
        heading: "3. AI processing and sub-processors",
        paragraphs: [
          "Your media and inspection inputs are sent to AI providers solely to produce your analysis. We use, among others: Supabase (hosting, database, storage, authentication), OpenAI (AI vision/audio analysis), Stripe (payments), and vehicle-data sources (e.g. NHTSA, and paid providers such as VinAudit/NMVTIS where you request a history report).",
          "These providers act as our processors and only process data on our instructions.",
        ],
      },
      {
        heading: "4. International transfers",
        paragraphs: [
          "Some processors (e.g. OpenAI, Stripe) are located in the United States. Transfers are framed by appropriate safeguards such as the EU Standard Contractual Clauses.",
        ],
      },
      {
        heading: "5. Retention",
        paragraphs: [
          "Inspection media and reports are kept for the duration of your account, then deleted within a reasonable period after account closure. Accounting/payment records are kept for the legal retention period. You can delete your media and account at any time from Settings.",
        ],
      },
      {
        heading: "6. Your rights",
        paragraphs: [
          "You have the right to access, rectify, erase, restrict and port your data, and to object to certain processing. Exercise them at " + CO.dpo + ".",
          "You can also lodge a complaint with your supervisory authority (in France, the CNIL — www.cnil.fr).",
        ],
      },
      {
        heading: "7. Security",
        paragraphs: [
          "Media is stored in private buckets accessed via signed URLs; access is restricted per user. We apply technical and organisational measures appropriate to the risk.",
        ],
      },
      {
        heading: "8. Cookies",
        paragraphs: [
          "We use only essential cookies (authentication and language preference). If we add analytics or marketing cookies, we will ask for your consent first.",
        ],
      },
      {
        heading: "9. Contact",
        paragraphs: [`Questions about this policy: ${CO.dpo} (${CO.name}, ${CO.address}). Publication director: ${CO.director}.`],
      },
    ],
  },
  fr: {
    title: "Politique de confidentialité",
    updated: LEGAL_UPDATED.fr,
    intro:
      `La présente politique explique comment CarGuard AI (exploité par ${CO.name}, ${CO.address}) collecte et traite vos données personnelles conformément au RGPD et aux lois applicables. Responsable de traitement : ${CO.name} — ${CO.email}.`,
    sections: [
      {
        heading: "1. Données collectées",
        paragraphs: [
          "Données de compte : e-mail, nom, téléphone, pays, langue, mot de passe (haché par notre prestataire d'authentification).",
          "Données d'inspection que vous fournissez : détails du véhicule (marque, modèle, année, VIN, kilométrage, prix), les 8 photos extérieures, vidéos/photos moteur, audio de démarrage, et les documents que vous photographiez (carte grise, factures d'entretien, etc.).",
          "Données de paiement : gérées par Stripe. Nous ne stockons jamais votre numéro de carte complet ; nous conservons le statut, le montant, la devise et un identifiant Stripe.",
          "Données d'usage : journaux d'activité, informations sur l'appareil/navigateur et journaux techniques nécessaires au fonctionnement et à la sécurité.",
        ],
      },
      {
        heading: "2. Finalités et bases légales",
        paragraphs: [
          "Fournir l'inspection et générer votre rapport (exécution de notre contrat).",
          "Traiter les paiements et prévenir la fraude (contrat + obligation légale).",
          "Analyser par IA vos photos, audio et documents pour produire le rapport (exécution du contrat).",
          "Améliorer et sécuriser le service (notre intérêt légitime).",
          "Envoyer des e-mails de service (contrat) ; le marketing uniquement avec votre consentement.",
        ],
      },
      {
        heading: "3. Traitements IA et sous-traitants",
        paragraphs: [
          "Vos médias et informations d'inspection sont transmis à des prestataires d'IA uniquement pour produire votre analyse. Nous utilisons notamment : Supabase (hébergement, base de données, stockage, authentification), OpenAI (analyse IA vision/audio), Stripe (paiements) et des sources de données véhicule (ex. NHTSA, et des fournisseurs payants comme VinAudit/NMVTIS lorsque vous demandez un rapport d'historique).",
          "Ces prestataires agissent comme sous-traitants et ne traitent les données que sur nos instructions.",
        ],
      },
      {
        heading: "4. Transferts internationaux",
        paragraphs: [
          "Certains sous-traitants (ex. OpenAI, Stripe) sont situés aux États-Unis. Les transferts sont encadrés par des garanties appropriées telles que les Clauses Contractuelles Types de l'UE.",
        ],
      },
      {
        heading: "5. Durées de conservation",
        paragraphs: [
          "Les médias et rapports d'inspection sont conservés pendant la durée de votre compte, puis supprimés dans un délai raisonnable après sa clôture. Les pièces comptables/paiement sont conservées selon la durée légale. Vous pouvez supprimer vos médias et votre compte à tout moment depuis les Réglages.",
        ],
      },
      {
        heading: "6. Vos droits",
        paragraphs: [
          "Vous disposez des droits d'accès, de rectification, d'effacement, de limitation et de portabilité, et du droit d'opposition à certains traitements. Exercez-les à l'adresse " + CO.dpo + ".",
          "Vous pouvez également introduire une réclamation auprès de votre autorité de contrôle (en France, la CNIL — www.cnil.fr).",
        ],
      },
      {
        heading: "7. Sécurité",
        paragraphs: [
          "Les médias sont stockés dans des espaces privés, accessibles via des URLs signées ; l'accès est restreint par utilisateur. Nous appliquons des mesures techniques et organisationnelles adaptées au risque.",
        ],
      },
      {
        heading: "8. Cookies",
        paragraphs: [
          "Nous utilisons uniquement des cookies essentiels (authentification et préférence de langue). Si nous ajoutons des cookies d'analyse ou marketing, nous recueillerons d'abord votre consentement.",
        ],
      },
      {
        heading: "9. Contact",
        paragraphs: [`Questions sur cette politique : ${CO.dpo} (${CO.name}, ${CO.address}). Directeur de la publication : ${CO.director}.`],
      },
    ],
  },
};

// ---------------------------------------------------------------------
// TERMS OF SERVICE / CGU
// ---------------------------------------------------------------------
export const TERMS: Record<Locale, LegalDocContent> = {
  en: {
    title: "Terms of Service",
    updated: LEGAL_UPDATED.en,
    intro: `These terms govern your use of CarGuard AI, operated by ${CO.name}. By using the service you accept them.`,
    sections: [
      { heading: "1. The service", paragraphs: ["CarGuard AI is a preliminary, AI-based screening tool from the photos, sounds and documents you provide. It is NOT a professional inspection, a mechanic, a body-shop expert or a guarantee about a vehicle's condition or history."] },
      { heading: "2. Account & eligibility", paragraphs: ["You must be of legal age and provide accurate information. You are responsible for your account and credentials."] },
      { heading: "3. Acceptable use", paragraphs: ["You will use the service lawfully and only on vehicles you are genuinely considering. You will not use it to harass, defame or falsely accuse a seller. You are responsible for the photos and information you upload and confirm you have the right to capture them."] },
      { heading: "4. Results & no warranty", paragraphs: ["Reports are estimates expressed in probabilities, not certainties, and may contain errors. They do not replace a professional inspection or vehicle-history check. Decisions you make based on a report are your sole responsibility."] },
      { heading: "5. Intellectual property", paragraphs: ["The service, software and content are protected. You keep ownership of your uploaded media; you grant us the right to process it to provide the service."] },
      { heading: "6. Liability", paragraphs: ["To the extent permitted by law, our liability is limited to the amount you paid for the relevant inspection. We are not liable for indirect or consequential damages. Nothing limits liability that cannot be excluded by law."] },
      { heading: "7. Suspension & termination", paragraphs: ["We may suspend or close accounts that breach these terms. You may close your account at any time."] },
      { heading: "8. Changes & law", paragraphs: [`We may update these terms; material changes will be notified. These terms are governed by French law, without prejudice to mandatory consumer protections. Contact: ${CO.email}.`] },
    ],
  },
  fr: {
    title: "Conditions Générales d'Utilisation",
    updated: LEGAL_UPDATED.fr,
    intro: `Les présentes CGU régissent l'utilisation de CarGuard AI, exploité par ${CO.name}. En utilisant le service, vous les acceptez.`,
    sections: [
      { heading: "1. Le service", paragraphs: ["CarGuard AI est un outil de pré-diagnostic préliminaire par IA, basé sur les photos, sons et documents que vous fournissez. Ce N'EST PAS une inspection professionnelle, un mécanicien, un expert en carrosserie, ni une garantie sur l'état ou l'historique d'un véhicule."] },
      { heading: "2. Compte & éligibilité", paragraphs: ["Vous devez être majeur et fournir des informations exactes. Vous êtes responsable de votre compte et de vos identifiants."] },
      { heading: "3. Usage autorisé", paragraphs: ["Vous utiliserez le service de manière licite, uniquement sur des véhicules que vous envisagez réellement. Vous ne l'utiliserez pas pour harceler, diffamer ou accuser à tort un vendeur. Vous êtes responsable des photos et informations importées et confirmez avoir le droit de les capturer."] },
      { heading: "4. Résultats & absence de garantie", paragraphs: ["Les rapports sont des estimations exprimées en probabilités, non en certitudes, et peuvent comporter des erreurs. Ils ne remplacent pas une inspection professionnelle ni une vérification d'historique. Les décisions prises sur la base d'un rapport relèvent de votre seule responsabilité."] },
      { heading: "5. Propriété intellectuelle", paragraphs: ["Le service, le logiciel et les contenus sont protégés. Vous conservez la propriété de vos médias ; vous nous accordez le droit de les traiter pour fournir le service."] },
      { heading: "6. Responsabilité", paragraphs: ["Dans la limite autorisée par la loi, notre responsabilité est limitée au montant payé pour l'inspection concernée. Nous ne sommes pas responsables des dommages indirects. Rien ne limite la responsabilité qui ne peut être exclue par la loi."] },
      { heading: "7. Suspension & résiliation", paragraphs: ["Nous pouvons suspendre ou clôturer les comptes en violation des présentes. Vous pouvez clôturer votre compte à tout moment."] },
      { heading: "8. Modifications & droit applicable", paragraphs: [`Nous pouvons mettre à jour ces CGU ; les changements importants seront notifiés. Les présentes sont régies par le droit français, sans préjudice des protections impératives du consommateur. Contact : ${CO.email}.`] },
    ],
  },
};

// ---------------------------------------------------------------------
// SALES TERMS / CGV (mandatory in FR for a paid service)
// ---------------------------------------------------------------------
export const CGV: Record<Locale, LegalDocContent> = {
  en: {
    title: "Sales Terms",
    updated: LEGAL_UPDATED.en,
    intro: `These sales terms apply to purchases of inspection credits on CarGuard AI, sold by ${CO.name} (${CO.form}), ${CO.address} — ${CO.email}.`,
    sections: [
      { heading: "1. Products & prices", paragraphs: ["We sell packs of inspection credits: 1 inspection (€29), 2 inspections (€49), 3 inspections (€69). Prices are in the currency shown at checkout, taxes included where applicable. One inspection consumes one credit. Credits do not expire and are non-transferable."] },
      { heading: "2. Order & payment", paragraphs: ["Payment is processed securely by Stripe at the time of order. Access to the credits/inspection is granted once payment is confirmed."] },
      { heading: "3. Right of withdrawal & immediate execution", paragraphs: [
        "For digital services, the law grants a 14-day right of withdrawal. However, by starting an inspection (capturing photos/sound/documents and running the AI analysis) you expressly request immediate performance and acknowledge that you LOSE your right of withdrawal for any inspection once its analysis has begun (EU Directive 2011/83/EU; in France, art. L221-28 of the Consumer Code).",
        "Unused credits: you may request a refund of credits that have not been used (no inspection started) within 14 days of purchase.",
      ] },
      { heading: "4. Refunds & claims", paragraphs: [`Refund requests and complaints: ${CO.email}. EU consumers may also use the EU ODR platform (ec.europa.eu/consumers/odr).`] },
      { heading: "5. Service limits", paragraphs: ["CarGuard AI provides a preliminary AI screening, not a guarantee. See the Terms of Service for disclaimers and liability limits."] },
      { heading: "6. Governing law", paragraphs: ["These sales terms are governed by French law, without prejudice to mandatory consumer protections in your country of residence."] },
    ],
  },
  fr: {
    title: "Conditions Générales de Vente",
    updated: LEGAL_UPDATED.fr,
    intro: `Les présentes CGV s'appliquent à l'achat de crédits d'inspection sur CarGuard AI, vendus par ${CO.name} (${CO.form}), ${CO.address} — ${CO.email}.`,
    sections: [
      { heading: "1. Produits & prix", paragraphs: ["Nous vendons des formules de crédits d'inspection : 1 inspection (29 €), 2 inspections (49 €), 3 inspections (69 €). Les prix sont indiqués dans la devise affichée au paiement, toutes taxes comprises le cas échéant. Une inspection consomme un crédit. Les crédits n'expirent pas et sont non cessibles."] },
      { heading: "2. Commande & paiement", paragraphs: ["Le paiement est traité de manière sécurisée par Stripe au moment de la commande. L'accès aux crédits/à l'inspection est accordé dès confirmation du paiement."] },
      { heading: "3. Droit de rétractation & exécution immédiate", paragraphs: [
        "Pour les services numériques, la loi prévoit un droit de rétractation de 14 jours. Toutefois, en démarrant une inspection (capture des photos/son/documents et lancement de l'analyse IA), vous demandez expressément l'exécution immédiate et reconnaissez PERDRE votre droit de rétractation pour toute inspection dont l'analyse a commencé (Directive 2011/83/UE ; en France, art. L221-28 du Code de la consommation).",
        "Crédits non utilisés : vous pouvez demander le remboursement des crédits non utilisés (aucune inspection démarrée) dans un délai de 14 jours suivant l'achat.",
      ] },
      { heading: "4. Remboursements & réclamations", paragraphs: [`Demandes de remboursement et réclamations : ${CO.email}. Les consommateurs de l'UE peuvent également recourir à la plateforme RLL de l'UE (ec.europa.eu/consumers/odr).`] },
      { heading: "5. Limites du service", paragraphs: ["CarGuard AI fournit un pré-diagnostic IA préliminaire, et non une garantie. Voir les CGU pour les avertissements et limites de responsabilité."] },
      { heading: "6. Droit applicable", paragraphs: ["Les présentes CGV sont régies par le droit français, sans préjudice des protections impératives du consommateur dans votre pays de résidence."] },
    ],
  },
};
