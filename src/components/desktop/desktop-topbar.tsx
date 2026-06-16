"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";
import { useI18n } from "@/components/i18n-provider";

// Desktop-only content header: a breadcrumb + the current page title at the top
// of the main area. Hidden below lg (mobile uses in-page headers / bottom nav).
// Also hidden on the dashboard (it's a hero) and the full-screen wizard.

const SECTION_TITLE: Record<string, string> = {
  inspections: "nav.inspections",
  reports: "nav.reports",
  billing: "nav.billing",
  settings: "page.settings",
  support: "page.support",
  admin: "adm.title",
};

const SUB_TITLE: Record<string, string> = {
  analysis: "tab.analysis",
  report: "tab.report",
};

export function DesktopTopbar() {
  const pathname = usePathname();
  const { t } = useI18n();

  // Hide on the hero dashboard and the immersive inspection wizard.
  if (pathname === "/dashboard" || pathname === "/inspections/new") return null;

  const segments = pathname.split("/").filter(Boolean);
  const base = segments[0];
  const sectionKey = base ? SECTION_TITLE[base] : undefined;
  if (!sectionKey) return null;

  type Crumb = { label: string; href?: string };
  const crumbs: Crumb[] = [{ label: t(sectionKey), href: `/${base}` }];

  // Detail page (/inspections/<id> …)
  if (segments.length > 1 && segments[1] !== "new") {
    const sub = segments[2] ? SUB_TITLE[segments[2]] : undefined;
    crumbs.push({ label: t("crumb.detail"), href: `/${base}/${segments[1]}` });
    if (sub) crumbs.push({ label: t(sub) });
  }

  const title = crumbs[crumbs.length - 1].label;

  return (
    <div className="hidden border-b border-[#E5E7EB] bg-white/80 px-8 py-4 backdrop-blur lg:block">
      <div className="mx-auto max-w-5xl">
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-[#6B7280]">
          <Link href="/dashboard" className="flex items-center gap-1 hover:text-[#111827]">
            <Home className="size-3.5" aria-hidden /> {t("crumb.home")}
          </Link>
          {crumbs.map((c, i) => (
            <span key={i} className="flex items-center gap-1.5">
              <ChevronRight className="size-3.5" aria-hidden />
              {c.href && i < crumbs.length - 1 ? (
                <Link href={c.href} className="hover:text-[#111827]">
                  {c.label}
                </Link>
              ) : (
                <span className="text-[#111827]">{c.label}</span>
              )}
            </span>
          ))}
        </nav>
        <h1 className="mt-1 text-xl font-bold text-[#111827]">{title}</h1>
      </div>
    </div>
  );
}
