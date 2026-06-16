"use client";

import { createContext, useContext } from "react";
import {
  formatDistance,
  formatMoney,
  localeCurrency,
  localeUnit,
  t as translate,
  type Locale,
} from "@/lib/i18n";

interface I18nValue {
  locale: Locale;
  t: (key: string) => string;
  currency: "EUR" | "USD";
  unit: "km" | "mi";
  formatMoney: (amount: number | null | undefined, currency?: string) => string;
  formatDistance: (value: number | null | undefined, currency?: string | null) => string;
}

const I18nContext = createContext<I18nValue | null>(null);

export function I18nProvider({
  locale,
  children,
}: {
  locale: Locale;
  children: React.ReactNode;
}) {
  const value: I18nValue = {
    locale,
    t: (key) => translate(locale, key),
    currency: localeCurrency(locale),
    unit: localeUnit(locale),
    formatMoney,
    formatDistance,
  };
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nValue {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    // Fallback when used outside a provider (defaults to English).
    return {
      locale: "en",
      t: (key) => translate("en", key),
      currency: "USD",
      unit: "mi",
      formatMoney,
      formatDistance,
    };
  }
  return ctx;
}
