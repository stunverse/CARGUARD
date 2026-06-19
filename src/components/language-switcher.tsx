"use client";

import { usePathname, useRouter } from "next/navigation";
import { LOCALE_COOKIE } from "@/lib/i18n";
import { useI18n } from "@/components/i18n-provider";
import { cn } from "@/lib/utils";

// EN / FR toggle. On localized URLs (/en…, /fr…) it swaps the path prefix so
// the language change is reflected in the URL (good for SEO/sharing). On other
// pages it persists the cookie and refreshes the server components.
export function LanguageSwitcher({ className }: { className?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const { locale } = useI18n();

  function set(next: "en" | "fr") {
    if (next === locale) return;
    document.cookie = `${LOCALE_COOKIE}=${next}; path=/; max-age=31536000; samesite=lax`;
    if (/^\/(en|fr)(\/|$)/.test(pathname)) {
      router.push(pathname.replace(/^\/(en|fr)/, `/${next}`));
    } else {
      router.refresh();
    }
  }

  return (
    <div className={cn("inline-flex overflow-hidden rounded-full border border-[#E5E7EB] text-xs font-semibold", className)}>
      {(["en", "fr"] as const).map((l) => (
        <button
          key={l}
          onClick={() => set(l)}
          aria-pressed={locale === l}
          className={cn(
            "px-3 py-1.5 transition-colors",
            locale === l ? "bg-[#E50914] text-white" : "bg-white text-[#6B7280]",
          )}
        >
          {l.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
