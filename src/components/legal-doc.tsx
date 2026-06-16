import Link from "next/link";
import type { LegalDocContent } from "@/lib/legal-content";
import type { Locale } from "@/lib/i18n";

// Renders a legal document (Privacy / Terms / CGV) with cross-links.
export function LegalDoc({ doc, locale }: { doc: LegalDocContent; locale: Locale }) {
  const updatedLabel = locale === "fr" ? "Dernière mise à jour" : "Last updated";
  const links =
    locale === "fr"
      ? [
          { href: "/privacy", label: "Confidentialité" },
          { href: "/terms", label: "CGU" },
          { href: "/cgv", label: "CGV" },
          { href: "/disclaimer", label: "Avertissement" },
        ]
      : [
          { href: "/privacy", label: "Privacy" },
          { href: "/terms", label: "Terms" },
          { href: "/cgv", label: "Sales terms" },
          { href: "/disclaimer", label: "Disclaimer" },
        ];

  return (
    <div>
      <h1 className="text-2xl font-extrabold text-[#111827]">{doc.title}</h1>
      <p className="mt-1 text-xs text-[#9AA3AF]">
        {updatedLabel}: {doc.updated}
      </p>
      <div className="mt-3 rounded-lg border border-amber-300/60 bg-amber-50 p-3 text-xs text-amber-800">
        {locale === "fr"
          ? "Modèle fourni à titre indicatif — à faire valider par un juriste et à compléter avec les informations de la société avant le lancement."
          : "Template provided for guidance — have it reviewed by a lawyer and complete the company details before launch."}
      </div>

      <p className="mt-4 text-sm leading-relaxed text-[#6B7280]">{doc.intro}</p>

      {doc.sections.map((s) => (
        <section key={s.heading} className="mt-6">
          <h2 className="text-base font-bold text-[#111827]">{s.heading}</h2>
          {s.paragraphs.map((p, i) => (
            <p key={i} className="mt-2 text-sm leading-relaxed text-[#6B7280]">
              {p}
            </p>
          ))}
        </section>
      ))}

      <nav className="mt-10 flex flex-wrap gap-4 border-t border-[#EFEFEF] pt-5 text-sm text-[#6B7280]">
        {links.map((l) => (
          <Link key={l.href} href={l.href} className="hover:text-[#111827]">
            {l.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
