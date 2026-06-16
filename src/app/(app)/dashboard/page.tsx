import Link from "next/link";
import { Bell, ChevronRight, Menu, ScanLine } from "lucide-react";
import { LogoMark } from "@/components/mobile/logo-mark";
import { getServerLocale } from "@/lib/i18n-server";
import { t } from "@/lib/i18n";

export const metadata = { title: "CarGuard AI" };

export default async function DashboardPage() {
  const locale = await getServerLocale();
  const title = t(locale, "home.hero.title").split("\n");
  return (
    <div className="flex min-h-[calc(100vh-7rem)] flex-col px-5">
      {/* Header */}
      <header className="flex items-center justify-between pt-4">
        <Link
          href="/settings"
          aria-label="Menu"
          className="flex size-11 items-center justify-center rounded-full border border-[#E5E7EB] bg-white text-[#374151] shadow-sm transition-transform active:scale-95"
        >
          <Menu className="size-5" aria-hidden />
        </Link>
        <LogoMark href={null} />
        <button
          type="button"
          aria-label="Notifications"
          className="relative flex size-11 items-center justify-center rounded-full border border-[#E5E7EB] bg-white text-[#374151] shadow-sm transition-transform active:scale-95"
        >
          <Bell className="size-5" aria-hidden />
          <span className="absolute right-2.5 top-2.5 size-2 rounded-full bg-[#E50914]" aria-hidden />
        </button>
      </header>

      {/* Centered hero + single action */}
      <div className="flex flex-1 flex-col items-center justify-center text-center">
        <h1 className="text-[34px] font-extrabold leading-[1.05] tracking-tight text-[#111827]">
          {title.map((line, i) => (
            <span key={i}>
              {line}
              {i < title.length - 1 && <br />}
            </span>
          ))}
        </h1>
        <p className="mt-3 max-w-xs text-[15px] leading-snug text-[#6B7280]">
          {t(locale, "home.hero.subtitle")}
        </p>

        <Link
          href="/inspections/new"
          className="relative mt-8 flex h-16 w-full max-w-sm items-center justify-center gap-2 overflow-hidden rounded-[18px] text-lg font-semibold text-white shadow-[0_12px_30px_rgba(229,9,20,0.28)] transition-transform active:scale-[0.98]"
          style={{ backgroundImage: "linear-gradient(135deg,#FF2A2A 0%,#E50914 45%,#B00008 100%)" }}
        >
          <span aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-1/2 bg-white/15" />
          <ScanLine className="size-5" aria-hidden />
          <span>{t(locale, "home.start")}</span>
          <ChevronRight className="size-5 opacity-90" aria-hidden />
        </Link>

        <p className="mt-3 max-w-xs text-xs text-[#6B7280]">{t(locale, "home.caption")}</p>
      </div>
    </div>
  );
}
