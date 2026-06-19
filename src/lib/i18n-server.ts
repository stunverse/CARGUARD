import { cookies, headers } from "next/headers";
import { DEFAULT_LOCALE, LOCALE_COOKIE, isLocale, type Locale } from "@/lib/i18n";

// Read the active locale. Middleware sets an `x-cg-locale` request header from
// the URL prefix (/en, /fr) or the visitor's preference, so that takes
// priority; we fall back to the cookie, then the default.
export async function getServerLocale(): Promise<Locale> {
  try {
    const h = await headers();
    const fromHeader = h.get("x-cg-locale");
    if (isLocale(fromHeader)) return fromHeader;
  } catch {
    // headers() unavailable in this context — fall through to cookie.
  }
  try {
    const c = await cookies();
    const v = c.get(LOCALE_COOKIE)?.value;
    return isLocale(v) ? v : DEFAULT_LOCALE;
  } catch {
    return DEFAULT_LOCALE;
  }
}
