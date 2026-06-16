import Link from "next/link";
import {
  AlignVerticalJustifyCenter,
  Camera,
  Car,
  ChevronRight,
  Droplets,
  FileText,
  Flame,
  Gauge,
  Lightbulb,
  Palette,
  ScanLine,
  ScanSearch,
  ShieldCheck,
  Volume2,
  Wrench,
} from "lucide-react";
import { LogoMark } from "@/components/mobile/logo-mark";
import { LanguageSwitcher } from "@/components/language-switcher";
import { createClient } from "@/lib/supabase/server";
import { getServerLocale } from "@/lib/i18n-server";
import { t } from "@/lib/i18n";

const HOW_IT_WORKS = [
  { icon: Car, title: "Enter the vehicle details", text: "Type it in, or auto-fill instantly from the VIN." },
  { icon: Camera, title: "Take 8 guided exterior photos", text: "We guide each angle to check the bodywork." },
  { icon: Wrench, title: "Add engine & mechanical checks", text: "Cold start, smoke, oil, coolant, leaks, sounds." },
  { icon: FileText, title: "Get a clear AI report", text: "Risk score, suspicious points, questions, PDF." },
];

const BODYWORK = [
  { label: "Panel alignment", icon: AlignVerticalJustifyCenter },
  { label: "Color & repaint differences", icon: Palette },
  { label: "Bumper fitment", icon: ShieldCheck },
  { label: "Headlights & taillights", icon: ShieldCheck },
  { label: "Signs of previous body repairs", icon: ScanSearch },
];

const ENGINE = [
  { label: "Cold-start noises (knocking, rattling)", icon: Volume2 },
  { label: "Exhaust smoke (white / blue / black)", icon: Flame },
  { label: "Oil & coolant condition", icon: Droplets },
  { label: "Leaks under the engine", icon: Droplets },
  { label: "Dashboard warning lights", icon: Gauge },
];

export default async function HomePage() {
  let authed = false;
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    authed = Boolean(user);
  } catch {
    // Supabase not configured yet — render the public landing.
  }
  const startHref = authed ? "/dashboard" : "/signup";
  const locale = await getServerLocale();

  return (
    <div className="min-h-screen w-full bg-[#EEF0F3]">
      <div
        className="relative mx-auto min-h-screen w-full max-w-[430px] overflow-hidden bg-white shadow-[0_0_80px_rgba(0,0,0,0.08)] md:border-x md:border-[#E5E7EB]"
        style={{ backgroundImage: "linear-gradient(135deg,#FFFFFF 0%,#FAFAFA 45%,#FFF5F5 100%)" }}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute right-[-100px] top-[-60px] h-64 w-64 rounded-full blur-3xl"
          style={{ background: "rgba(229,9,20,0.10)" }}
        />

        {/* Header */}
        <header className="sticky top-0 z-40 flex items-center justify-between border-b border-[#EFEFEF] bg-white/85 px-5 py-3 backdrop-blur">
          <LogoMark href="/" size={24} />
          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <Link href="/login" className="px-2 py-1 text-sm font-medium text-[#374151]">
              {t(locale, "landing.login")}
            </Link>
            <Link
              href={startHref}
              className="rounded-full px-3 py-1.5 text-sm font-semibold text-white"
              style={{ backgroundImage: "linear-gradient(135deg,#FF2A2A 0%,#E50914 45%,#B00008 100%)" }}
            >
              {t(locale, "common.start")}
            </Link>
          </div>
        </header>

        <main className="relative px-5 pb-16">
          {/* Hero */}
          <section className="pt-8 text-center">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[#E5E7EB] bg-white px-3 py-1 text-xs font-medium text-[#374151]">
              <ShieldCheck className="size-3.5 text-[#E50914]" aria-hidden />
              {t(locale, "landing.badge")}
            </span>
            <h1 className="mt-5 text-[30px] font-extrabold leading-[1.1] tracking-tight text-[#111827]">
              {t(locale, "landing.hero.pre")}{" "}
              <span className="text-[#E50914]">{t(locale, "landing.hero.defect")}</span>{" "}
              {t(locale, "landing.hero.mid")}{" "}
              <span className="text-[#E50914]">{t(locale, "landing.hero.before")}</span>{" "}
              {t(locale, "landing.hero.suffix")}
            </h1>
            <p className="mt-3 text-[15px] leading-snug text-[#6B7280]">
              {t(locale, "landing.hero.subtitle")}
            </p>

            <div className="mt-6 space-y-3">
              <Link
                href={startHref}
                className="relative flex h-14 w-full items-center justify-center gap-2 overflow-hidden rounded-2xl text-base font-semibold text-white shadow-[0_12px_30px_rgba(229,9,20,0.28)] transition-transform active:scale-[0.98]"
                style={{ backgroundImage: "linear-gradient(135deg,#FF2A2A 0%,#E50914 45%,#B00008 100%)" }}
              >
                <span aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-1/2 bg-white/15" />
                <ScanLine className="size-5" aria-hidden />
                {t(locale, "landing.start")}
              </Link>
              <Link
                href="#how"
                className="flex h-14 w-full items-center justify-center rounded-2xl border border-[#E5E7EB] bg-white text-base font-semibold text-[#111827] transition-transform active:scale-[0.98]"
              >
                {t(locale, "landing.how")}
              </Link>
            </div>
            <p className="mt-3 text-xs text-[#6B7280]">{t(locale, "landing.tagline")}</p>
          </section>

          {/* How it works */}
          <section id="how" className="mt-12">
            <h2 className="text-center text-2xl font-bold text-[#111827]">{t(locale, "landing.how.title")}</h2>
            <div className="mt-5 space-y-3">
              {HOW_IT_WORKS.map((step, i) => (
                <div
                  key={step.title}
                  className="flex items-start gap-3 rounded-2xl border border-[#E5E7EB] bg-white/90 p-4 shadow-sm"
                >
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[rgba(229,9,20,0.10)] text-[#E50914]">
                    <step.icon className="size-5" aria-hidden />
                  </span>
                  <div>
                    <div className="text-xs font-semibold text-[#27D3D8]">Step {i + 1}</div>
                    <h3 className="font-semibold text-[#111827]">{step.title}</h3>
                    <p className="text-sm text-[#6B7280]">{step.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* What we check */}
          <section id="checks" className="mt-12">
            <h2 className="text-center text-2xl font-bold text-[#111827]">{t(locale, "landing.checks.title")}</h2>
            <p className="mx-auto mt-2 max-w-xs text-center text-sm text-[#6B7280]">
              {t(locale, "landing.checks.subtitle")}
            </p>
            <div className="mt-5 space-y-4">
              <CheckGroup title={t(locale, "landing.checks.bodywork")} icon={Camera} items={BODYWORK} />
              <CheckGroup title={t(locale, "landing.checks.engine")} icon={Wrench} items={ENGINE} />
            </div>
          </section>

          {/* Why it matters */}
          <section className="mt-12 text-center">
            <Lightbulb className="mx-auto mb-3 size-9 text-[#27D3D8]" aria-hidden />
            <h2 className="text-2xl font-bold text-[#111827]">{t(locale, "landing.why.title")}</h2>
            <p className="mt-3 text-[15px] leading-snug text-[#6B7280]">
              {t(locale, "landing.why.body")}
            </p>
            <div className="mt-5 rounded-2xl border border-[#E5E7EB] bg-[#F7F8FA] p-4 text-left text-xs text-[#6B7280]">
              CarGuard AI provides a preliminary, photo- and sound-based
              screening. It does not replace a professional inspection or a
              certified mechanic.
            </div>
          </section>

          {/* Pricing CTA */}
          <section className="mt-10 text-center">
            <Link
              href="/pricing"
              className="inline-flex items-center gap-1 rounded-full bg-[#F2F3F5] px-5 py-2.5 text-sm font-semibold text-[#111827]"
            >
              {t(locale, "landing.pricing")} <ChevronRight className="size-4" aria-hidden />
            </Link>
          </section>

          {/* Footer */}
          <footer className="mt-12 border-t border-[#EFEFEF] pt-6 text-center text-xs text-[#9AA3AF]">
            <div className="flex justify-center gap-5">
              <Link href="/terms">Terms</Link>
              <Link href="/privacy">Privacy</Link>
              <Link href="/disclaimer">Disclaimer</Link>
            </div>
            <p className="mt-3">© {new Date().getFullYear()} CarGuard AI</p>
          </footer>
        </main>
      </div>
    </div>
  );
}

function CheckGroup({
  title,
  icon: Icon,
  items,
}: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  items: { label: string; icon: React.ComponentType<{ className?: string }> }[];
}) {
  return (
    <div className="rounded-2xl border border-[#E5E7EB] bg-white/90 p-4 shadow-sm">
      <div className="mb-3 flex items-center gap-2">
        <span className="flex size-9 items-center justify-center rounded-lg bg-[rgba(229,9,20,0.10)] text-[#E50914]">
          <Icon className="size-5" aria-hidden />
        </span>
        <h3 className="font-semibold text-[#111827]">{title}</h3>
      </div>
      <ul className="space-y-2.5">
        {items.map((it) => (
          <li key={it.label} className="flex items-center gap-3">
            <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-[rgba(39,211,216,0.12)] text-[#1FAEB3]">
              <it.icon className="size-4" aria-hidden />
            </span>
            <span className="text-sm font-medium text-[#374151]">{it.label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
