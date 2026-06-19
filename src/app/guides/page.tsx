import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { MobileShell } from "@/components/mobile/mobile-shell";
import { GUIDES } from "@/lib/content/guides";
import { getServerLocale } from "@/lib/i18n-server";

export const metadata: Metadata = {
  title: "Used car buyer guides — CarGuard AI",
  description:
    "Free guides to buy a used car with confidence: spot accident damage, check a VIN, detect a repaint, and more.",
  alternates: { canonical: "/guides" },
};

export default async function GuidesPage() {
  const locale = await getServerLocale();
  const title = locale === "fr" ? "Guides d'achat" : "Buyer guides";
  const intro =
    locale === "fr"
      ? "Des guides gratuits pour acheter une voiture d'occasion en confiance."
      : "Free guides to buy a used car with confidence.";

  return (
    <MobileShell backHref="/">
      <h1 className="text-2xl font-extrabold text-[#111827]">{title}</h1>
      <p className="mt-2 text-sm leading-relaxed text-[#6B7280]">{intro}</p>

      <div className="mt-6 flex flex-col gap-3">
        {GUIDES.map((g) => (
          <Link
            key={g.slug}
            href={`/guides/${g.slug}`}
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
