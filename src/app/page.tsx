import Link from "next/link";
import {
  AlignVerticalJustifyCenter,
  Camera,
  Car,
  ChevronRight,
  CreditCard,
  Droplets,
  FileText,
  Flame,
  Gauge,
  Lightbulb,
  Lock,
  Palette,
  Quote,
  ScanLine,
  ScanSearch,
  ShieldCheck,
  Smartphone,
  Star,
  Volume2,
  Wrench,
  Zap,
} from "lucide-react";
import { LogoMark } from "@/components/mobile/logo-mark";
import { LanguageSwitcher } from "@/components/language-switcher";
import { createClient } from "@/lib/supabase/server";
import { getServerLocale } from "@/lib/i18n-server";
import { t, formatMoney, localeCurrency } from "@/lib/i18n";
import { INSPECTION_PRICE } from "@/lib/billing";

const HOW_IT_WORKS = [
  { icon: Car, k: "s1" },
  { icon: Camera, k: "s2" },
  { icon: Wrench, k: "s3" },
  { icon: FileText, k: "s4" },
];
const BODYWORK = [
  { k: "landing.body.1", icon: AlignVerticalJustifyCenter },
  { k: "landing.body.2", icon: Palette },
  { k: "landing.body.3", icon: ShieldCheck },
  { k: "landing.body.4", icon: ShieldCheck },
  { k: "landing.body.5", icon: ScanSearch },
];
const ENGINE = [
  { k: "landing.eng.1", icon: Volume2 },
  { k: "landing.eng.2", icon: Flame },
  { k: "landing.eng.3", icon: Droplets },
  { k: "landing.eng.4", icon: Droplets },
  { k: "landing.eng.5", icon: Gauge },
];
const TRUST = [
  { icon: Lock, k: "landing.trust.secure" },
  { icon: CreditCard, k: "landing.trust.noSub" },
  { icon: Zap, k: "landing.trust.instant" },
  { icon: Smartphone, k: "landing.trust.devices" },
];
const REVIEWS = ["r1", "r2", "r3"];
const FAQ = ["q1", "q2", "q3", "q4", "q5"];

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
  const priceLabel = formatMoney(INSPECTION_PRICE, localeCurrency(locale));

  return (
    <div className="min-h-screen w-full bg-[#EEF0F3] lg:bg-white">
      <div className="relative mx-auto min-h-screen w-full max-w-[480px] overflow-hidden bg-white shadow-[0_0_80px_rgba(0,0,0,0.08)] md:max-w-3xl md:border-x md:border-[#E5E7EB] lg:max-w-none lg:overflow-visible lg:border-0 lg:shadow-none">
        {/* Decorative phone gradient + glow — small screens only. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 lg:hidden"
          style={{ backgroundImage: "linear-gradient(135deg,#FFFFFF 0%,#FAFAFA 45%,#FFF5F5 100%)" }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute right-[-100px] top-[-60px] h-64 w-64 rounded-full blur-3xl lg:hidden"
          style={{ background: "rgba(229,9,20,0.10)" }}
        />

        {/* Header */}
        <header className="sticky top-0 z-40 border-b border-[#EFEFEF] bg-white/85 px-5 py-3 backdrop-blur lg:px-8">
          <div className="mx-auto flex w-full max-w-6xl items-center justify-between">
            <LogoMark href="/" size={24} />
            <div className="flex items-center gap-2">
              <LanguageSwitcher />
              <Link href="/login" className="px-2 py-1 text-sm font-medium text-[#374151]">
                {t(locale, "landing.login")}
              </Link>
              <Link
                href={startHref}
                className="rounded-full px-3 py-1.5 text-sm font-semibold text-white lg:px-5 lg:py-2"
                style={{ backgroundImage: "linear-gradient(135deg,#FF2A2A 0%,#E50914 45%,#B00008 100%)" }}
              >
                {t(locale, "common.start")}
              </Link>
            </div>
          </div>
        </header>

        <main className="relative px-5 pb-16 lg:px-8">
          {/* Hero */}
          <section className="mx-auto max-w-3xl pt-8 text-center lg:pt-24">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[#E5E7EB] bg-white px-3 py-1 text-xs font-medium text-[#374151]">
              <ShieldCheck className="size-3.5 text-[#E50914]" aria-hidden />
              {t(locale, "landing.badge")}
            </span>
            <h1 className="mt-5 text-[30px] font-extrabold leading-[1.1] tracking-tight text-[#111827] lg:text-5xl xl:text-6xl">
              {t(locale, "landing.hero.pre")}{" "}
              <span className="text-[#E50914]">{t(locale, "landing.hero.defect")}</span>{" "}
              {t(locale, "landing.hero.mid")}{" "}
              <span className="text-[#E50914]">{t(locale, "landing.hero.before")}</span>{" "}
              {t(locale, "landing.hero.suffix")}
            </h1>
            <p className="mx-auto mt-3 max-w-xl text-[15px] leading-snug text-[#6B7280] lg:mt-5 lg:text-lg">
              {t(locale, "landing.hero.subtitle")}
            </p>

            <div className="mt-6 space-y-3 sm:flex sm:justify-center sm:gap-3 sm:space-y-0 lg:mt-8">
              <Link
                href={startHref}
                className="relative flex h-14 w-full items-center justify-center gap-2 overflow-hidden rounded-2xl text-base font-semibold text-white shadow-[0_12px_30px_rgba(229,9,20,0.28)] transition-transform active:scale-[0.98] sm:w-auto sm:px-8"
                style={{ backgroundImage: "linear-gradient(135deg,#FF2A2A 0%,#E50914 45%,#B00008 100%)" }}
              >
                <span aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-1/2 bg-white/15" />
                <ScanLine className="size-5" aria-hidden />
                {t(locale, "landing.start")}
              </Link>
              <Link
                href="#how"
                className="flex h-14 w-full items-center justify-center rounded-2xl border border-[#E5E7EB] bg-white text-base font-semibold text-[#111827] transition-transform active:scale-[0.98] sm:w-auto sm:px-8"
              >
                {t(locale, "landing.how")}
              </Link>
            </div>
            <p className="mt-3 text-xs text-[#6B7280]">{t(locale, "landing.tagline")}</p>
          </section>

          {/* Trust bar */}
          <section className="mx-auto mt-10 max-w-4xl">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {TRUST.map((it) => (
                <div
                  key={it.k}
                  className="flex flex-col items-center gap-2 rounded-2xl border border-[#E5E7EB] bg-white/90 p-4 text-center shadow-sm"
                >
                  <span className="flex size-9 items-center justify-center rounded-lg bg-[rgba(39,211,216,0.12)] text-[#1FAEB3]">
                    <it.icon className="size-5" aria-hidden />
                  </span>
                  <span className="text-xs font-medium text-[#374151]">{t(locale, it.k)}</span>
                </div>
              ))}
            </div>
          </section>

          {/* How it works */}
          <section id="how" className="mx-auto mt-12 max-w-6xl lg:mt-24">
            <h2 className="text-center text-2xl font-bold text-[#111827] lg:text-3xl">{t(locale, "landing.how.title")}</h2>
            <div className="mt-5 grid gap-3 lg:mt-10 lg:grid-cols-4 lg:gap-5">
              {HOW_IT_WORKS.map((step, i) => (
                <div
                  key={step.k}
                  className="flex items-start gap-3 rounded-2xl border border-[#E5E7EB] bg-white/90 p-4 shadow-sm lg:flex-col lg:gap-3"
                >
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[rgba(229,9,20,0.10)] text-[#E50914]">
                    <step.icon className="size-5" aria-hidden />
                  </span>
                  <div>
                    <div className="text-xs font-semibold text-[#27D3D8]">Step {i + 1}</div>
                    <h3 className="font-semibold text-[#111827]">{t(locale, `landing.how.${step.k}.title`)}</h3>
                    <p className="text-sm text-[#6B7280]">{t(locale, `landing.how.${step.k}.text`)}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* What we check */}
          <section id="checks" className="mx-auto mt-12 max-w-5xl lg:mt-24">
            <h2 className="text-center text-2xl font-bold text-[#111827] lg:text-3xl">{t(locale, "landing.checks.title")}</h2>
            <p className="mx-auto mt-2 max-w-md text-center text-sm text-[#6B7280]">
              {t(locale, "landing.checks.subtitle")}
            </p>
            <div className="mt-5 grid gap-4 lg:mt-10 lg:grid-cols-2">
              <CheckGroup title={t(locale, "landing.checks.bodywork")} icon={Camera} items={BODYWORK} locale={locale} />
              <CheckGroup title={t(locale, "landing.checks.engine")} icon={Wrench} items={ENGINE} locale={locale} />
            </div>
          </section>

          {/* Price vs risk comparison */}
          <section className="mx-auto mt-12 max-w-4xl text-center lg:mt-24">
            <h2 className="text-2xl font-bold text-[#111827] lg:text-3xl">{t(locale, "landing.compare.title")}</h2>
            <p className="mx-auto mt-2 max-w-lg text-sm text-[#6B7280]">{t(locale, "landing.compare.subtitle")}</p>
            <div className="mt-6 grid gap-4 text-left sm:grid-cols-2">
              <div className="rounded-2xl border border-risk-low/40 bg-risk-low/5 p-5">
                <div className="text-3xl font-extrabold text-[#111827]">{priceLabel}</div>
                <h3 className="mt-1 font-semibold text-[#111827]">{t(locale, "landing.compare.now.title")}</h3>
                <p className="mt-1 text-sm text-[#6B7280]">{t(locale, "landing.compare.now.desc")}</p>
              </div>
              <div className="rounded-2xl border border-risk-critical/40 bg-risk-critical/5 p-5">
                <div className="text-3xl font-extrabold text-[#B00008]">{t(locale, "landing.compare.risk.price")}</div>
                <h3 className="mt-1 font-semibold text-[#111827]">{t(locale, "landing.compare.risk.title")}</h3>
                <p className="mt-1 text-sm text-[#6B7280]">{t(locale, "landing.compare.risk.desc")}</p>
              </div>
            </div>
            <Link
              href={startHref}
              className="mt-6 inline-flex h-12 items-center justify-center gap-2 rounded-2xl px-6 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(229,9,20,0.28)]"
              style={{ backgroundImage: "linear-gradient(135deg,#FF2A2A 0%,#E50914 45%,#B00008 100%)" }}
            >
              <ScanLine className="size-5" aria-hidden /> {t(locale, "landing.compare.cta")}
            </Link>
          </section>

          {/* Social proof */}
          <section className="mx-auto mt-12 max-w-6xl lg:mt-24">
            <h2 className="text-center text-2xl font-bold text-[#111827] lg:text-3xl">{t(locale, "landing.reviews.title")}</h2>
            <p className="mx-auto mt-2 max-w-md text-center text-sm text-[#6B7280]">{t(locale, "landing.reviews.subtitle")}</p>
            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              {REVIEWS.map((r) => (
                <figure key={r} className="rounded-2xl border border-[#E5E7EB] bg-white/90 p-5 shadow-sm">
                  <Quote className="size-6 text-[#E50914]/30" aria-hidden />
                  <div className="mt-2 flex gap-0.5 text-[#F5A623]">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className="size-4 fill-current" aria-hidden />
                    ))}
                  </div>
                  <blockquote className="mt-2 text-sm text-[#374151]">{t(locale, `landing.reviews.${r}.quote`)}</blockquote>
                  <figcaption className="mt-3 text-xs font-medium text-[#6B7280]">— {t(locale, `landing.reviews.${r}.author`)}</figcaption>
                </figure>
              ))}
            </div>
          </section>

          {/* Why it matters */}
          <section className="mx-auto mt-12 max-w-2xl text-center lg:mt-24">
            <Lightbulb className="mx-auto mb-3 size-9 text-[#27D3D8]" aria-hidden />
            <h2 className="text-2xl font-bold text-[#111827] lg:text-3xl">{t(locale, "landing.why.title")}</h2>
            <p className="mt-3 text-[15px] leading-snug text-[#6B7280] lg:text-lg">
              {t(locale, "landing.why.body")}
            </p>
            <div className="mt-5 rounded-2xl border border-[#E5E7EB] bg-[#F7F8FA] p-4 text-left text-xs text-[#6B7280]">
              {t(locale, "landing.why.disclaimer")}
            </div>
          </section>

          {/* FAQ */}
          <section className="mx-auto mt-12 max-w-3xl lg:mt-24">
            <h2 className="text-center text-2xl font-bold text-[#111827] lg:text-3xl">{t(locale, "landing.faq.title")}</h2>
            <div className="mt-5 divide-y divide-[#EFEFEF] overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white/90">
              {FAQ.map((q) => (
                <details key={q} className="group p-4">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-3 font-medium text-[#111827]">
                    {t(locale, `landing.faq.${q}`)}
                    <ChevronRight className="size-4 shrink-0 text-[#6B7280] transition-transform group-open:rotate-90" aria-hidden />
                  </summary>
                  <p className="mt-2 text-sm text-[#6B7280]">{t(locale, `landing.faq.a${q.slice(1)}`)}</p>
                </details>
              ))}
            </div>
          </section>

          {/* Final CTA */}
          <section className="mx-auto mt-12 max-w-4xl lg:mt-20">
            <div
              className="rounded-3xl px-6 py-10 text-center text-white shadow-[0_20px_50px_rgba(229,9,20,0.30)]"
              style={{ backgroundImage: "linear-gradient(135deg,#FF2A2A 0%,#E50914 45%,#B00008 100%)" }}
            >
              <h2 className="text-2xl font-extrabold lg:text-3xl">{t(locale, "landing.final.title")}</h2>
              <p className="mx-auto mt-2 max-w-md text-sm text-white/90">{t(locale, "landing.final.subtitle")}</p>
              <Link
                href={startHref}
                className="mt-6 inline-flex h-14 items-center justify-center gap-2 rounded-2xl bg-white px-8 text-base font-semibold text-[#B00008] transition-transform active:scale-[0.98]"
              >
                <ScanLine className="size-5" aria-hidden /> {t(locale, "landing.start")}
              </Link>
            </div>
          </section>

          {/* Footer */}
          <footer className="mx-auto mt-12 max-w-6xl border-t border-[#EFEFEF] pt-6 text-center text-xs text-[#9AA3AF] lg:mt-16">
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
  locale,
}: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  items: { k: string; icon: React.ComponentType<{ className?: string }> }[];
  locale: Parameters<typeof t>[0];
}) {
  return (
    <div className="rounded-2xl border border-[#E5E7EB] bg-white/90 p-4 shadow-sm lg:p-6">
      <div className="mb-3 flex items-center gap-2">
        <span className="flex size-9 items-center justify-center rounded-lg bg-[rgba(229,9,20,0.10)] text-[#E50914]">
          <Icon className="size-5" aria-hidden />
        </span>
        <h3 className="font-semibold text-[#111827]">{title}</h3>
      </div>
      <ul className="space-y-2.5">
        {items.map((it) => (
          <li key={it.k} className="flex items-center gap-3">
            <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-[rgba(39,211,216,0.12)] text-[#1FAEB3]">
              <it.icon className="size-4" aria-hidden />
            </span>
            <span className="text-sm font-medium text-[#374151]">{t(locale, it.k)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
