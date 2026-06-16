// =====================================================================
// CarGuard AI — translation dictionary
// Add keys here; components/pages read them via t(locale, key).
// Currently translated: navigation, home, landing, common buttons.
// Other screens fall back to English until translated.
// =====================================================================

import type { Locale } from "@/lib/i18n";

export const dict: Record<Locale, Record<string, string>> = {
  en: {
    // nav
    "nav.home": "Home",
    "nav.inspections": "Inspections",
    "nav.reports": "Reports",
    "nav.profile": "Profile",
    // home
    "home.hero.title": "Protect your\nnext car purchase",
    "home.hero.subtitle": "Detect hidden accident or mechanical defects before you buy a used car.",
    "home.start": "Start Inspection",
    "home.caption": "One inspection: exterior photos, engine audio and mechanical checks — then a report with a confidence score.",
    // landing
    "landing.badge": "AI-powered hidden-defect detection",
    "landing.hero.pre": "Spot a",
    "landing.hero.defect": "hidden defect",
    "landing.hero.mid": "the seller may be hiding —",
    "landing.hero.before": "before you buy",
    "landing.hero.suffix": "a used car.",
    "landing.hero.subtitle": "CarGuard AI guides you through exterior photos and engine & mechanical checks, then flags possible signs of past accidents, body repairs, repainting and engine problems.",
    "landing.start": "Start an inspection",
    "landing.how": "See how it works",
    "landing.tagline": "Bodywork + engine checks · AI risk score · shareable PDF report",
    "landing.how.title": "How it works",
    "landing.how.subtitle": "A guided inspection anyone can do with a phone — no mechanical knowledge required.",
    "landing.checks.title": "What CarGuard AI checks",
    "landing.checks.subtitle": "Two complementary modules — the bodywork and the engine & mechanical condition.",
    "landing.checks.bodywork": "Bodywork & accident signs",
    "landing.checks.engine": "Engine & mechanical",
    "landing.why.title": "Why it matters",
    "landing.why.body": "Some used cars are patched up quickly before resale — a repainted panel, a head-gasket issue, a warning light cleared just before the viewing. CarGuard AI helps you spot the signs before you pay.",
    "landing.pricing": "View pricing",
    "landing.login": "Log in",
    "common.start": "Start",
    "step.continue": "Continue",
  },
  fr: {
    // nav
    "nav.home": "Accueil",
    "nav.inspections": "Inspections",
    "nav.reports": "Rapports",
    "nav.profile": "Profil",
    // home
    "home.hero.title": "Protégez votre\nprochain achat auto",
    "home.hero.subtitle": "Détectez les vices cachés (accident ou mécanique) avant d'acheter une voiture d'occasion.",
    "home.start": "Démarrer l'inspection",
    "home.caption": "Une inspection : photos extérieures, son moteur et contrôles mécaniques — puis un rapport avec score de confiance.",
    // landing
    "landing.badge": "Détection de vices cachés par l'IA",
    "landing.hero.pre": "Repérez un",
    "landing.hero.defect": "vice caché",
    "landing.hero.mid": "que le vendeur pourrait dissimuler —",
    "landing.hero.before": "avant d'acheter",
    "landing.hero.suffix": "une voiture d'occasion.",
    "landing.hero.subtitle": "CarGuard AI vous guide à travers des photos extérieures et des contrôles moteur & mécanique, puis signale les signes possibles d'accident, de réparation, de peinture ou de problème moteur.",
    "landing.start": "Démarrer une inspection",
    "landing.how": "Voir comment ça marche",
    "landing.tagline": "Carrosserie + moteur · Score de risque IA · Rapport PDF partageable",
    "landing.how.title": "Comment ça marche",
    "landing.how.subtitle": "Une inspection guidée que tout le monde peut faire avec un téléphone — aucune connaissance mécanique requise.",
    "landing.checks.title": "Ce que CarGuard AI vérifie",
    "landing.checks.subtitle": "Deux modules complémentaires — la carrosserie et l'état moteur & mécanique.",
    "landing.checks.bodywork": "Carrosserie & signes d'accident",
    "landing.checks.engine": "Moteur & mécanique",
    "landing.why.title": "Pourquoi c'est important",
    "landing.why.body": "Certaines occasions sont rafistolées juste avant la revente — un panneau repeint, un joint de culasse, un voyant effacé avant la visite. CarGuard AI vous aide à repérer les signes avant de payer.",
    "landing.pricing": "Voir les tarifs",
    "landing.login": "Connexion",
    "common.start": "Démarrer",
    "step.continue": "Continuer",
  },
};
