import Link from "next/link";
import { ArrowLeft, ScanLine, Sparkles, ShieldCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { ReportPreview } from "@/components/report-preview";
import { getServerLocale } from "@/lib/i18n-server";
import { t } from "@/lib/i18n";
import { getDemoReport } from "@/lib/demo-report";

export const metadata = {
  title: "Sample report — CarGuard AI",
  description:
    "See a full CarGuard AI inspection report before you buy: AI hidden-damage analysis, engine checks, vehicle history, mileage and market value.",
};

const RED_GRADIENT = "linear-gradient(90deg,#FF2A2A,#E50914)";

export default async function ReportExamplePage() {
  const locale = await getServerLocale();
  const report = getDemoReport(locale);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const startHref = user ? "/inspections/new" : "/signup";

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <header className="sticky top-0 z-10 border-b bg-white/90 backdrop-blur">
        <div className="mx-auto flex w-full max-w-3xl items-center justify-between px-5 py-3">
          <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="size-4" /> {t(locale, "example.backHome")}
          </Link>
          <Link
            href={startHref}
            className="inline-flex h-10 items-center gap-2 rounded-full px-5 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(229,9,20,0.4)]"
            style={{ backgroundImage: RED_GRADIENT }}
          >
            <ScanLine className="size-4" aria-hidden /> {t(locale, "example.cta")}
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl px-5 py-8">
        {/* Intro */}
        <div className="mb-6 text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-xs font-semibold text-accent">
            <Sparkles className="size-3.5" aria-hidden /> {t(locale, "example.badge")}
          </span>
          <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-foreground">
            {t(locale, "example.title")}
          </h1>
          <p className="mx-auto mt-2 max-w-xl text-sm text-muted-foreground">
            {t(locale, "example.subtitle")}
          </p>
        </div>

        {/* Sample notice */}
        <div className="mb-6 flex items-start gap-3 rounded-2xl border border-amber-300/60 bg-amber-50 p-4">
          <ShieldCheck className="mt-0.5 size-5 shrink-0 text-amber-600" aria-hidden />
          <p className="text-sm text-amber-900">{t(locale, "example.notice")}</p>
        </div>

        {/* The report */}
        <ReportPreview report={report} />

        {/* Closing CTA */}
        <div className="mt-10 flex flex-col items-center gap-3 rounded-3xl border bg-muted/30 p-8 text-center">
          <h2 className="text-xl font-bold text-foreground">{t(locale, "example.ctaTitle")}</h2>
          <p className="max-w-md text-sm text-muted-foreground">{t(locale, "example.ctaBody")}</p>
          <Link
            href={startHref}
            className="mt-1 inline-flex h-14 items-center justify-center gap-2 rounded-2xl px-8 text-base font-semibold text-white shadow-[0_16px_40px_rgba(229,9,20,0.4)] transition-transform hover:scale-[1.02]"
            style={{ backgroundImage: RED_GRADIENT }}
          >
            <ScanLine className="size-5" aria-hidden /> {t(locale, "example.cta")}
          </Link>
        </div>
      </main>
    </div>
  );
}
