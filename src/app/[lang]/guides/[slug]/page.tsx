import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MobileShell } from "@/components/mobile/mobile-shell";
import { ArticleDoc } from "@/components/article-doc";
import { GUIDES, guideBySlug } from "@/lib/content/guides";
import { isLocale, type Locale } from "@/lib/i18n";
import { lp, localizedAlternates, LOCALES } from "@/lib/i18n-routing";

export function generateStaticParams() {
  return LOCALES.flatMap((lang) => GUIDES.map((g) => ({ lang, slug: g.slug })));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}): Promise<Metadata> {
  const { lang, slug } = await params;
  const guide = guideBySlug(slug);
  if (!guide) return {};
  const locale: Locale = isLocale(lang) ? lang : "en";
  return {
    title: `${guide.title[locale]} — CarGuard AI`,
    description: guide.description[locale],
    alternates: localizedAlternates(locale, `/guides/${guide.slug}`),
    openGraph: {
      type: "article",
      title: guide.title[locale],
      description: guide.description[locale],
      url: lp(locale, `/guides/${guide.slug}`),
    },
  };
}

export default async function GuidePage({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}) {
  const { lang, slug } = await params;
  const guide = guideBySlug(slug);
  if (!guide) notFound();
  const locale: Locale = isLocale(lang) ? lang : "en";
  return (
    <MobileShell backHref={lp(locale, "/guides")} homeHref={lp(locale, "/")}>
      <ArticleDoc guide={guide} locale={locale} />
    </MobileShell>
  );
}
