"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Car,
  CreditCard,
  FileText,
  LayoutDashboard,
  LifeBuoy,
  LogOut,
  Plus,
  Settings,
  ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { useI18n } from "@/components/i18n-provider";
import { LanguageSwitcher } from "@/components/language-switcher";

// Desktop / large-tablet sidebar. Hidden below lg (phones & small tablets use
// the bottom navigation instead). Same routes as the mobile nav, plus the
// secondary destinations that don't fit a bottom bar.
const ITEMS = [
  { href: "/dashboard", key: "nav.home", icon: LayoutDashboard, exact: true },
  { href: "/inspections", key: "nav.inspections", icon: Car, exact: false },
  { href: "/reports", key: "nav.reports", icon: FileText, exact: false },
  { href: "/billing", key: "nav.billing", icon: CreditCard, exact: false },
  { href: "/settings", key: "page.settings", icon: Settings, exact: false },
  { href: "/support", key: "page.support", icon: LifeBuoy, exact: false },
];

export function SideNav({ isAdmin = false }: { isAdmin?: boolean }) {
  const pathname = usePathname();
  const router = useRouter();
  const { t } = useI18n();

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  const isActive = (href: string, exact: boolean) =>
    exact ? pathname === href : pathname === href || pathname.startsWith(href + "/");

  return (
    <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col gap-1 border-r border-[#E5E7EB] bg-white px-4 py-6 lg:flex">
      <Link href="/dashboard" className="mb-5 flex items-center gap-2 px-2 text-lg font-bold">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/icon.svg" alt="" aria-hidden className="size-8" />
        CarGuard <span className="text-[#E50914]">AI</span>
      </Link>

      <Link
        href="/inspections/new"
        className="mb-3 flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(229,9,20,0.30)] transition-transform active:scale-95"
        style={{ backgroundImage: "linear-gradient(135deg,#FF2A2A 0%,#E50914 45%,#B00008 100%)" }}
      >
        <Plus className="size-4" /> {t("nav.newInspection")}
      </Link>

      <nav className="flex flex-col gap-1">
        {ITEMS.map((item) => {
          const active = isActive(item.href, item.exact);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-[rgba(229,9,20,0.10)] text-[#E50914]"
                  : "text-[#6B7280] hover:bg-secondary hover:text-[#111827]",
              )}
            >
              <Icon className="size-5" aria-hidden />
              {t(item.key)}
            </Link>
          );
        })}
        {isAdmin && (
          <Link
            href="/admin"
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
              pathname.startsWith("/admin")
                ? "bg-[rgba(229,9,20,0.10)] text-[#E50914]"
                : "text-[#6B7280] hover:bg-secondary hover:text-[#111827]",
            )}
          >
            <ShieldCheck className="size-5" aria-hidden />
            {t("adm.title")}
          </Link>
        )}
      </nav>

      <div className="mt-auto flex flex-col gap-2 pt-4">
        <LanguageSwitcher />
        <button
          type="button"
          onClick={signOut}
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-[#6B7280] transition-colors hover:bg-secondary hover:text-[#111827]"
        >
          <LogOut className="size-5" aria-hidden /> {t("nav.signOut")}
        </button>
      </div>
    </aside>
  );
}
