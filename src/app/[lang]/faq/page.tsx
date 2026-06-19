import type { Metadata } from "next";
import { ChevronRight } from "lucide-react";
import { MobileShell } from "@/components/mobile/mobile-shell";
import { FAQ_ITEMS } from "@/lib/content/faq";
import { isLocale, type Locale } from "@/lib/i18n";
import { lp, localizedAlternates, LOCALES } from "@/lib/i18n-routing";
import { JsonLd, faqSchema } from "@/components/seo/json-ld";

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
        ? "Questions fréquentes — CarGuard AI"
        : "Frequently asked questions — CarGuard AI",
    description:
      locale === "fr"
        ? "Réponses sur CarGuard AI : ce qu'il vérifie, les prix, la fiabilité, la confidentialité, les remboursements et les pays couverts."
        : "Answers about CarGuard AI: what it checks, pricing, accuracy, privacy, refunds and supported countries.",
    alternates: localizedAlternates(locale, "/faq"),
  };
}

export default async function FaqPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const locale: Locale = isLocale(lang) ? lang : "en";
  const title = locale === "fr" ? "Questions fréquentes" : "Frequently asked questions";

  return (
    <MobileShell backHref={lp(locale, "/")} homeHref={lp(locale, "/")}>
      <JsonLd
        data={faqSchema(
          FAQ_ITEMS.map((it) => ({
            question: it.question[locale],
            answer: it.answer[locale],
          })),
        )}
      />
      <h1 className="text-2xl font-extrabold text-[#111827]">{title}</h1>

      <div className="mt-5 divide-y divide-[#EFEFEF] overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white">
        {FAQ_ITEMS.map((it) => (
          <details key={it.question.en} className="group p-4">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 font-medium text-[#111827]">
              {it.question[locale]}
              <ChevronRight className="size-4 shrink-0 text-[#6B7280] transition-transform group-open:rotate-90" aria-hidden />
            </summary>
            <p className="mt-2 text-sm leading-relaxed text-[#6B7280]">
              {it.answer[locale]}
            </p>
          </details>
        ))}
      </div>
    </MobileShell>
  );
}
