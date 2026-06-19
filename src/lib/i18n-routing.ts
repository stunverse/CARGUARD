// =====================================================================
// CarGuard AI — locale routing helpers (URL-prefixed i18n: /en, /fr)
// =====================================================================

import type { Locale } from "@/lib/i18n";

export const LOCALES = ["en", "fr"] as const;

// Prefix a public path with a locale. Use "/" for the home page.
export function lp(lang: Locale, path = "/"): string {
  return path === "/" ? `/${lang}` : `/${lang}${path}`;
}

// Next.js `alternates` block (canonical + hreflang) for a localized path.
// `path` is the locale-less path, e.g. "/guides" or "/" for home.
export function localizedAlternates(lang: Locale, path = "/") {
  const en = lp("en", path);
  const fr = lp("fr", path);
  return {
    canonical: lp(lang, path),
    languages: { en, fr, "x-default": en },
  };
}
