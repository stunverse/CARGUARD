// =====================================================================
// CarGuard AI — i18n core (pure helpers; safe on server & client)
// Locale drives language + currency (€/$) + distance unit (km/mi).
// =====================================================================

import { dict } from "@/lib/i18n-dict";

export type Locale = "en" | "fr";
export const DEFAULT_LOCALE: Locale = "en";
export const LOCALE_COOKIE = "cg_locale";

export function isLocale(v: string | undefined | null): v is Locale {
  return v === "en" || v === "fr";
}

export function localeCurrency(l: Locale): "EUR" | "USD" {
  return l === "fr" ? "EUR" : "USD";
}

export function unitForCurrency(currency?: string | null): "km" | "mi" {
  return (currency || "").toUpperCase() === "EUR" ? "km" : "mi";
}

export function localeUnit(l: Locale): "km" | "mi" {
  return l === "fr" ? "km" : "mi";
}

export function formatMoney(
  amount: number | null | undefined,
  currency: string = "USD",
): string {
  if (amount == null) return "—";
  try {
    return new Intl.NumberFormat(currency === "EUR" ? "fr-FR" : "en-US", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${amount} ${currency}`;
  }
}

export function formatDistance(
  value: number | null | undefined,
  currency?: string | null,
): string {
  if (value == null) return "—";
  const unit = unitForCurrency(currency);
  const loc = unit === "km" ? "fr-FR" : "en-US";
  return `${value.toLocaleString(loc)} ${unit}`;
}

// Translate a key for a locale, falling back to English then the key itself.
export function t(locale: Locale, key: string): string {
  return dict[locale]?.[key] ?? dict.en[key] ?? key;
}
