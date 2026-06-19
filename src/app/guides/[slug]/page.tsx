import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MobileShell } from "@/components/mobile/mobile-shell";
import { ArticleDoc } from "@/components/article-doc";
import { GUIDES, guideBySlug } from "@/lib/content/guides";
import { getServerLocale } from "@/lib/i18n-server";

export function generateStaticParams() {
  return GUIDES.map((g) => ({ slug: g.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const guide = guideBySlug(slug);
  if (!guide) return {};
  const locale = await getServerLocale();
  return {
    title: `${guide.title[locale]} — CarGuard AI`,
    description: guide.description[locale],
    alternates: { canonical: `/guides/${guide.slug}` },
    openGraph: {
      type: "article",
      title: guide.title[locale],
      description: guide.description[locale],
      url: `/guides/${guide.slug}`,
    },
  };
}

export default async function GuidePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const guide = guideBySlug(slug);
  if (!guide) notFound();
  const locale = await getServerLocale();
  return (
    <MobileShell backHref="/guides">
      <ArticleDoc guide={guide} locale={locale} />
    </MobileShell>
  );
}
