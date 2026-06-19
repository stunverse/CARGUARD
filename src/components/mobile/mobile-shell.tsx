import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { LogoMark } from "@/components/mobile/logo-mark";

// Phone-width canvas for PUBLIC pages (pricing, legal). Mirrors the
// authenticated app shell so the whole product reads as a mobile app.
export function MobileShell({
  children,
  backHref = "/",
  homeHref = "/",
}: {
  children: React.ReactNode;
  backHref?: string;
  homeHref?: string;
}) {
  return (
    <div className="min-h-screen w-full bg-[#EEF0F3]">
      <div
        className="relative mx-auto min-h-screen w-full max-w-[480px] overflow-hidden bg-white shadow-[0_0_80px_rgba(0,0,0,0.08)] md:max-w-3xl md:border-x md:border-[#E5E7EB]"
        style={{ backgroundImage: "linear-gradient(135deg,#FFFFFF 0%,#FAFAFA 45%,#FFF5F5 100%)" }}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute right-[-100px] top-[-60px] h-64 w-64 rounded-full blur-3xl"
          style={{ background: "rgba(229,9,20,0.10)" }}
        />
        <header className="sticky top-0 z-40 flex items-center justify-between border-b border-[#EFEFEF] bg-white/85 px-5 py-3 backdrop-blur">
          <Link
            href={backHref}
            aria-label="Back"
            className="flex size-9 items-center justify-center rounded-full border border-[#E5E7EB] bg-white text-[#374151]"
          >
            <ChevronLeft className="size-5" aria-hidden />
          </Link>
          <LogoMark href={homeHref} size={22} />
          <span className="w-9" aria-hidden />
        </header>
        <main className="relative px-5 py-6">{children}</main>
      </div>
    </div>
  );
}
