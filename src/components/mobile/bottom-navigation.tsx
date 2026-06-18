"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Camera,
  Car,
  CreditCard,
  FileText,
  LifeBuoy,
  MoreHorizontal,
  Settings as SettingsIcon,
  ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useI18n } from "@/components/i18n-provider";

// Primary tabs shown in the bottom bar (besides the center camera button).
const ITEMS = [
  { href: "/dashboard", key: "nav.home", icon: ShieldCheck, match: (p: string) => p === "/dashboard" },
  { href: "/inspections", key: "nav.inspections", icon: Car, match: (p: string) => p === "/inspections" || (p.startsWith("/inspections/") && !p.endsWith("/new")) },
  { href: "/reports", key: "nav.reports", icon: FileText, match: (p: string) => p.startsWith("/reports") },
];

// Secondary destinations grouped under the "More" tab (no room in the bar).
const MORE_ITEMS = [
  { href: "/settings", key: "page.settings", icon: SettingsIcon, match: (p: string) => p.startsWith("/settings") },
  { href: "/billing", key: "nav.billing", icon: CreditCard, match: (p: string) => p.startsWith("/billing") },
  { href: "/support", key: "page.support", icon: LifeBuoy, match: (p: string) => p.startsWith("/support") },
];

export function BottomNavigation() {
  const pathname = usePathname();
  const { t } = useI18n();
  const [moreOpen, setMoreOpen] = useState(false);

  // Close the sheet whenever the route changes.
  useEffect(() => {
    setMoreOpen(false);
  }, [pathname]);

  // Hide during the full-screen guided inspection wizard.
  if (pathname === "/inspections/new") return null;

  const moreActive = MORE_ITEMS.some((item) => item.match(pathname));

  return (
    <>
      {/* "More" bottom sheet */}
      {moreOpen && (
        <>
          <button
            aria-label={t("nav.more")}
            onClick={() => setMoreOpen(false)}
            className="fixed inset-0 z-[55] bg-black/40 lg:hidden"
          />
          <div className="fixed inset-x-0 bottom-0 z-[60] mx-auto w-full max-w-[480px] rounded-t-2xl border-t border-[#E5E7EB] bg-white p-4 pb-[calc(env(safe-area-inset-bottom)+1rem)] shadow-[0_-10px_40px_rgba(0,0,0,0.18)] md:max-w-2xl lg:hidden">
            <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-[#E5E7EB]" />
            <nav aria-label="More" className="flex flex-col gap-1">
              {MORE_ITEMS.map((item) => {
                const Icon = item.icon;
                const active = item.match(pathname);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMoreOpen(false)}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors",
                      active
                        ? "bg-[rgba(229,9,20,0.10)] text-[#E50914]"
                        : "text-[#111827] hover:bg-secondary",
                    )}
                  >
                    <Icon className="size-5" aria-hidden />
                    {t(item.key)}
                  </Link>
                );
              })}
            </nav>
          </div>
        </>
      )}

      <nav
        aria-label="Primary"
        className="fixed inset-x-0 bottom-0 z-50 mx-auto flex h-[82px] w-full max-w-[480px] items-stretch justify-around border-t border-[#E5E7EB] bg-white/92 px-2 pb-[env(safe-area-inset-bottom)] backdrop-blur-md shadow-[0_-10px_30px_rgba(0,0,0,0.08)] md:max-w-2xl lg:hidden"
      >
        {/* left two */}
        {ITEMS.slice(0, 2).map((item) => (
          <NavItem key={item.href} item={item} active={item.match(pathname)} />
        ))}

        {/* center scan button (elevated) */}
        <div className="relative flex w-16 shrink-0 items-center justify-center">
          <Link
            href="/inspections/new"
            aria-label="Start a new inspection"
            className="absolute -top-6 flex size-16 items-center justify-center rounded-full text-white shadow-[0_12px_30px_rgba(229,9,20,0.40)] transition-transform active:scale-95"
            style={{ backgroundImage: "linear-gradient(135deg,#FF2A2A 0%,#E50914 45%,#B00008 100%)" }}
          >
            <Camera className="size-7" aria-hidden />
          </Link>
        </div>

        {/* right: Reports + the "More" menu */}
        <NavItem item={ITEMS[2]} active={ITEMS[2].match(pathname)} />
        <MoreButton
          label={t("nav.more")}
          active={moreActive || moreOpen}
          onClick={() => setMoreOpen((v) => !v)}
        />
      </nav>
    </>
  );
}

function NavItem({
  item,
  active,
}: {
  item: (typeof ITEMS)[number];
  active: boolean;
}) {
  const { t } = useI18n();
  const Icon = item.icon;
  const label = t(item.key);
  return (
    <Link
      href={item.href}
      aria-label={label}
      aria-current={active ? "page" : undefined}
      className={cn(
        "flex flex-1 flex-col items-center justify-center gap-1 text-[11px] font-medium transition-colors",
        active ? "text-[#E50914]" : "text-[#6B7280] hover:text-[#111827]",
      )}
    >
      <span
        className={cn(
          "flex size-9 items-center justify-center rounded-full transition-colors",
          active && "bg-[rgba(229,9,20,0.10)]",
        )}
      >
        <Icon className="size-5" aria-hidden />
      </span>
      {label}
    </Link>
  );
}

function MoreButton({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      aria-haspopup="menu"
      aria-expanded={active}
      className={cn(
        "flex flex-1 flex-col items-center justify-center gap-1 text-[11px] font-medium transition-colors",
        active ? "text-[#E50914]" : "text-[#6B7280] hover:text-[#111827]",
      )}
    >
      <span
        className={cn(
          "flex size-9 items-center justify-center rounded-full transition-colors",
          active && "bg-[rgba(229,9,20,0.10)]",
        )}
      >
        <MoreHorizontal className="size-5" aria-hidden />
      </span>
      {label}
    </button>
  );
}
