import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

type CookieToSet = { name: string; value: string; options?: CookieOptions };

// Refreshes the Supabase session cookie, guards private routes, and applies
// URL-based locale (/en, /fr) for the public marketing/content pages.
const PROTECTED_PREFIXES = [
  "/dashboard",
  "/inspections",
  "/billing",
  "/settings",
  "/support",
  "/admin",
];

const DEFAULT_LOCALE = "en";
// Public paths that have localized (/en, /fr) versions.
const LOCALIZED_ROOTS = ["/pricing", "/guides", "/faq"];
const COOKIE_OPTS = { path: "/", maxAge: 31536000, sameSite: "lax" as const };

function isLocalizedRoot(pathname: string): boolean {
  if (pathname === "/") return true;
  return LOCALIZED_ROOTS.some((p) => pathname === p || pathname.startsWith(p + "/"));
}

function localePrefix(pathname: string): "en" | "fr" | null {
  if (pathname === "/en" || pathname.startsWith("/en/")) return "en";
  if (pathname === "/fr" || pathname.startsWith("/fr/")) return "fr";
  return null;
}

function pickLocale(request: NextRequest): "en" | "fr" {
  const cookie = request.cookies.get("cg_locale")?.value;
  if (cookie === "en" || cookie === "fr") return cookie;
  const first = (request.headers.get("accept-language") || "")
    .split(",")[0]
    ?.trim()
    .toLowerCase();
  if (first?.startsWith("fr")) return "fr";
  return DEFAULT_LOCALE;
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // 1) Redirect unprefixed public content paths to the visitor's locale.
  if (isLocalizedRoot(pathname) && !localePrefix(pathname)) {
    const locale = pickLocale(request);
    const url = request.nextUrl.clone();
    url.pathname = pathname === "/" ? `/${locale}` : `/${locale}${pathname}`;
    const res = NextResponse.redirect(url);
    res.cookies.set("cg_locale", locale, COOKIE_OPTS);
    return res;
  }

  // Active locale for this render: from the URL prefix, else the preference.
  // Expose it to server components via the request cookie on THIS request.
  const locale = localePrefix(pathname) ?? pickLocale(request);
  request.cookies.set("cg_locale", locale);

  let response = NextResponse.next({ request });
  response.cookies.set("cg_locale", locale, COOKIE_OPTS);

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // If Supabase isn't configured yet, don't block rendering (dev/demo).
  if (!supabaseUrl || !supabaseKey) return response;

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet: CookieToSet[]) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        response.cookies.set("cg_locale", locale, COOKIE_OPTS);
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isProtected = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p));
  if (isProtected && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
