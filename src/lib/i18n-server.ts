import { cookies } from "next/headers";
import { DEFAULT_LOCALE, LOCALE_COOKIE, isLocale, type Locale } from "@/lib/i18n";

// Read the active locale from the cookie (server components / route handlers).
export async function getServerLocale(): Promise<Locale> {
  try {
    const c = await cookies();
    const v = c.get(LOCALE_COOKIE)?.value;
    return isLocale(v) ? v : DEFAULT_LOCALE;
  } catch {
    return DEFAULT_LOCALE;
  }
}
