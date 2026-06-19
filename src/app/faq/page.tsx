import type { Metadata } from "next";
import { ChevronRight } from "lucide-react";
import { MobileShell } from "@/components/mobile/mobile-shell";
import { FAQ_ITEMS } from "@/lib/content/faq";
import { getServerLocale } from "@/lib/i18n-server";
import { JsonLd, faqSchema } from "@/components/seo/json-ld";

export const metadata: Metadata = {
  title: "Frequently asked questions — CarGuard AI",
  description:
    "Answers about CarGuard AI: what it checks, pricing, accuracy, privacy, refunds and supported countries.",
  alternates: { canonical: "/faq" },
};

export default async function FaqPage() {
  const locale = await getServerLocale();
  const title = locale === "fr" ? "Questions fréquentes" : "Frequently asked questions";

  return (
    <MobileShell backHref="/">
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
