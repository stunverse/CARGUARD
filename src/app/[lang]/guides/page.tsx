import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { MobileShell } from "@/components/mobile/mobile-shell";
import { GUIDES } from "@/lib/content/guides";
import { isLocale, type Locale } from "@/lib/i18n";
import { lp, localizedAlternates, LOCALES } from "@/lib/i18n-routing";

export function generateStaticParams() {
  return LOCALES.map((lang) => ({ lang }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const locale: Locale = isLocale(lang) ? lang : "en";
  return {
    title:
      locale === "fr"
        ? "Guides d'achat d'une voiture d'occasion — CarGuard AI"
        : "Used car buyer guides — CarGuard AI",
    description:
      locale === "fr"
        ? "Des guides gratuits pour acheter une voiture d'occasion en confiance : repérer un accident, vérifier un VIN, détecter une repeinte, et plus."
        : "Free guides to buy a used car with confidence: spot accident damage, check a VIN, detect a repaint, and more.",
    alternates: localizedAlternates(locale, "/guides"),
  };
}

export default async function GuidesPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const locale: Locale = isLocale(lang) ? lang : "en";
  const title = locale === "fr" ? "Guides d'achat" : "Buyer guides";
  const intro =
    locale === "fr"
      ? "Des guides gratuits pour acheter une voiture d'occasion en confiance."
      : "Free guides to buy a used car with confidence.";

  return (
    <MobileShell backHref={lp(locale, "/")} homeHref={lp(locale, "/")}>
      <h1 className="text-2xl font-extrabold text-[#111827]">{title}</h1>
      <p className="mt-2 text-sm leading-relaxed text-[#6B7280]">{intro}</p>

      <div className="mt-6 flex flex-col gap-3">
        {GUIDES.map((g) => (
          <Link
            key={g.slug}
            href={lp(locale, `/guides/${g.slug}`)}
            className="group flex items-start justify-between gap-3 rounded-2xl border border-[#E5E7EB] bg-white p-4 transition-colors hover:border-[#E50914]/40"
          >
            <span>
              <span className="block font-semibold text-[#111827]">
                {g.title[locale]}
              </span>
              <span className="mt-1 block text-sm text-[#6B7280]">
                {g.description[locale]}
              </span>
            </span>
            <ChevronRight className="mt-1 size-5 shrink-0 text-[#9AA3AF] transition-transform group-hover:translate-x-0.5" aria-hidden />
          </Link>
        ))}
      </div>
    </MobileShell>
  );
}
