"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Camera, Car, FileText, ShieldCheck, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useI18n } from "@/components/i18n-provider";

const ITEMS = [
  { href: "/dashboard", key: "nav.home", icon: ShieldCheck, match: (p: string) => p === "/dashboard" },
  { href: "/inspections", key: "nav.inspections", icon: Car, match: (p: string) => p === "/inspections" || (p.startsWith("/inspections/") && !p.endsWith("/new")) },
  { href: "/reports", key: "nav.reports", icon: FileText, match: (p: string) => p.startsWith("/reports") },
  { href: "/settings", key: "nav.profile", icon: User, match: (p: string) => p.startsWith("/settings") },
];

export function BottomNavigation() {
  const pathname = usePathname();

  // Hide during the full-screen guided inspection wizard.
  if (pathname === "/inspections/new") return null;

  return (
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

      {/* right two */}
      {ITEMS.slice(2).map((item) => (
        <NavItem key={item.href} item={item} active={item.match(pathname)} />
      ))}
    </nav>
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
