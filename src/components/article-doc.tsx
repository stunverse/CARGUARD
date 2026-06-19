import Link from "next/link";
import { ScanLine } from "lucide-react";
import type { Guide } from "@/lib/content/guides";
import { GUIDES } from "@/lib/content/guides";
import type { Locale } from "@/lib/i18n";
import { SITE_URL } from "@/lib/constants";
import {
  JsonLd,
  articleSchema,
  breadcrumbSchema,
} from "@/components/seo/json-ld";

// Renders a buyer guide article with breadcrumb, structured data, a soft
// call to action and links to the other guides.
export function ArticleDoc({ guide, locale }: { guide: Guide; locale: Locale }) {
  const updatedLabel = locale === "fr" ? "Dernière mise à jour" : "Last updated";
  const guidesLabel = locale === "fr" ? "Guides" : "Guides";
  const homeLabel = locale === "fr" ? "Accueil" : "Home";
  const moreLabel = locale === "fr" ? "Autres guides" : "More guides";
  const ctaTitle =
    locale === "fr"
      ? "Inspectez une voiture en quelques minutes"
      : "Inspect a car in minutes";
  const ctaText =
    locale === "fr"
      ? "Laissez l'IA repérer les signes suspects à partir de vos photos."
      : "Let AI flag suspicious signs from your photos.";
  const ctaBtn = locale === "fr" ? "Démarrer une inspection" : "Start an inspection";

  const url = `${SITE_URL}/guides/${guide.slug}`;
  const others = GUIDES.filter((g) => g.slug !== guide.slug);

  return (
    <article>
      <JsonLd
        data={[
          articleSchema({
            headline: guide.title[locale],
            description: guide.description[locale],
            url,
            inLanguage: locale,
          }),
          breadcrumbSchema([
            { name: homeLabel, url: SITE_URL },
            { name: guidesLabel, url: `${SITE_URL}/guides` },
            { name: guide.title[locale], url },
          ]),
        ]}
      />

      <nav className="flex items-center gap-1.5 text-xs text-[#9AA3AF]">
        <Link href="/guides" className="hover:text-[#111827]">
          {guidesLabel}
        </Link>
      </nav>

      <h1 className="mt-2 text-2xl font-extrabold leading-tight text-[#111827]">
        {guide.title[locale]}
      </h1>
      <p className="mt-1 text-xs text-[#9AA3AF]">
        {updatedLabel}: {guide.updated}
      </p>
      <p className="mt-4 text-sm leading-relaxed text-[#6B7280]">
        {guide.description[locale]}
      </p>

      {guide.body[locale].map((s) => (
        <section key={s.heading} className="mt-6">
          <h2 className="text-base font-bold text-[#111827]">{s.heading}</h2>
          {s.paragraphs.map((p, i) => (
            <p key={i} className="mt-2 text-sm leading-relaxed text-[#6B7280]">
              {p}
            </p>
          ))}
        </section>
      ))}

      {/* Soft call to action */}
      <div
        className="mt-10 overflow-hidden rounded-2xl px-5 py-6 text-center text-white"
        style={{ backgroundImage: "linear-gradient(135deg,#FF2A2A 0%,#E50914 45%,#B00008 100%)" }}
      >
        <h2 className="text-lg font-extrabold">{ctaTitle}</h2>
        <p className="mt-1 text-sm text-white/90">{ctaText}</p>
        <Link
          href="/signup"
          className="mt-4 inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-white px-5 text-sm font-bold text-[#B00008]"
        >
          <ScanLine className="size-4" aria-hidden /> {ctaBtn}
        </Link>
      </div>

      {/* Other guides */}
      <nav className="mt-10 border-t border-[#EFEFEF] pt-5">
        <h2 className="text-sm font-bold text-[#111827]">{moreLabel}</h2>
        <ul className="mt-3 flex flex-col gap-2">
          {others.map((g) => (
            <li key={g.slug}>
              <Link
                href={`/guides/${g.slug}`}
                className="text-sm text-[#E50914] hover:underline"
              >
                {g.title[locale]}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </article>
  );
}
