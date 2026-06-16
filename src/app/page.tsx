import Link from "next/link";
import {
  AlertTriangle,
  AlignVerticalJustifyCenter,
  Award,
  Camera,
  Car,
  CheckCircle2,
  ChevronRight,
  CreditCard,
  Droplets,
  FileSearch,
  FileText,
  Flame,
  Gauge,
  Lightbulb,
  Lock,
  Palette,
  Quote,
  ScanLine,
  ScanSearch,
  ShieldAlert,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Star,
  Volume2,
  Wrench,
  Zap,
} from "lucide-react";
import { LogoMark } from "@/components/mobile/logo-mark";
import { LanguageSwitcher } from "@/components/language-switcher";
import { Reveal } from "@/components/landing/reveal";
import { CountUp } from "@/components/landing/count-up";
import { createClient } from "@/lib/supabase/server";
import { getServerLocale } from "@/lib/i18n-server";
import { t, formatMoney, localeCurrency } from "@/lib/i18n";
import { INSPECTION_PRICE } from "@/lib/billing";

const HOW = [
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
const HISTORY = [
  { k: "landing.hist.1", icon: AlertTriangle },
  { k: "landing.hist.2", icon: ShieldAlert },
  { k: "landing.hist.3", icon: Gauge },
  { k: "landing.hist.4", icon: FileText },
  { k: "landing.hist.5", icon: Award },
];
const TRUST = [
  { icon: Lock, k: "landing.trust.secure" },
  { icon: CreditCard, k: "landing.trust.noSub" },
  { icon: Zap, k: "landing.trust.instant" },
  { icon: Smartphone, k: "landing.trust.devices" },
];
const STATS = [
  { value: 8, k: "landing.stats.photos" },
  { value: 14, k: "landing.stats.checks" },
  { value: 17, k: "landing.stats.sections" },
];
const REVIEWS = ["r1", "r2", "r3"];
const FAQ = ["q1", "q2", "q3", "q4", "q5"];

const RED_GRADIENT = "linear-gradient(135deg,#FF2A2A 0%,#E50914 45%,#B00008 100%)";

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
  const marquee = t(locale, "landing.marquee.line");

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-white text-[#111827]">
      {/* Sticky dark header */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#0B0B12]/85 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-3 lg:px-8">
          <Link href="/" className="flex items-center gap-2 text-lg font-extrabold text-white">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="" aria-hidden className="size-9" />
            CarGuard <span className="text-[#FF4D4D]">AI</span>
          </Link>
          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <Link href="/login" className="hidden px-2 py-1 text-sm font-medium text-white/80 hover:text-white sm:block">
              {t(locale, "landing.login")}
            </Link>
            <Link
              href={startHref}
              className="rounded-full px-4 py-2 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(229,9,20,0.45)]"
              style={{ backgroundImage: RED_GRADIENT }}
            >
              {t(locale, "common.start")}
            </Link>
          </div>
        </div>
      </header>

      {/* ============================ HERO (dark) ============================ */}
      <section className="relative overflow-hidden bg-[#0B0B12] text-white">
        {/* Animated red blobs */}
        <div aria-hidden className="pointer-events-none absolute -left-24 -top-24 size-80 rounded-full bg-[#E50914]/30 blur-3xl animate-cg-blob" />
        <div aria-hidden className="pointer-events-none absolute -right-16 top-40 size-72 rounded-full bg-[#FF2A2A]/20 blur-3xl animate-cg-blob" style={{ animationDelay: "3s" }} />
        {/* Grid texture */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              "linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)",
            backgroundSize: "44px 44px",
          }}
        />

        <div className="relative mx-auto grid w-full max-w-6xl items-center gap-10 px-5 py-16 lg:grid-cols-2 lg:gap-12 lg:px-8 lg:py-24">
          {/* Copy */}
          <div className="text-center lg:text-left">
            <Reveal>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-medium text-white/85">
                <Sparkles className="size-3.5 text-[#FF4D4D]" aria-hidden />
                {t(locale, "landing.badge")}
              </span>
            </Reveal>
            <Reveal delay={80}>
              <h1 className="mt-5 text-[34px] font-extrabold leading-[1.08] tracking-tight lg:text-[56px]">
                {t(locale, "landing.hero.pre")}{" "}
                <span className="text-[#FF4D4D]">{t(locale, "landing.hero.defect")}</span>{" "}
                {t(locale, "landing.hero.mid")}{" "}
                <span className="text-[#FF4D4D]">{t(locale, "landing.hero.before")}</span>{" "}
                {t(locale, "landing.hero.suffix")}
              </h1>
            </Reveal>
            <Reveal delay={160}>
              <p className="mx-auto mt-4 max-w-xl text-[15px] leading-relaxed text-white/70 lg:mx-0 lg:text-lg">
                {t(locale, "landing.hero.subtitle")}
              </p>
            </Reveal>
            <Reveal delay={240}>
              <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:justify-center lg:justify-start">
                <Link
                  href={startHref}
                  className="relative flex h-14 items-center justify-center gap-2 overflow-hidden rounded-2xl px-8 text-base font-semibold text-white shadow-[0_16px_40px_rgba(229,9,20,0.45)] transition-transform hover:scale-[1.02] active:scale-[0.98]"
                  style={{ backgroundImage: RED_GRADIENT }}
                >
                  <ScanLine className="size-5" aria-hidden />
                  {t(locale, "landing.start")}
                </Link>
                <Link
                  href="#how"
                  className="flex h-14 items-center justify-center rounded-2xl border border-white/20 bg-white/5 px-8 text-base font-semibold text-white transition-colors hover:bg-white/10"
                >
                  {t(locale, "landing.how")}
                </Link>
              </div>
            </Reveal>
            <Reveal delay={320}>
              <p className="mt-4 text-xs text-white/50">{t(locale, "landing.tagline")}</p>
            </Reveal>
          </div>

          {/* Floating report mockup with scan animation */}
          <Reveal delay={200} className="hidden lg:block">
            <div className="relative mx-auto w-full max-w-sm animate-cg-float">
              <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] p-5 shadow-2xl backdrop-blur">
                {/* scan line */}
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-x-0 h-16 animate-cg-scan"
                  style={{ background: "linear-gradient(180deg,transparent,rgba(229,9,20,0.25),transparent)" }}
                />
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wide text-white/50">CarGuard AI</span>
                  <span className="rounded-full bg-[#E50914]/20 px-2 py-0.5 text-[10px] font-bold text-[#FF7A7A]">RISK 18/100</span>
                </div>
                {/* ring */}
                <div className="mt-4 flex items-center gap-4">
                  <RiskRing />
                  <div className="flex-1 space-y-2">
                    {[78, 64, 90].map((w, i) => (
                      <div key={i} className="h-2 rounded-full bg-white/10">
                        <div className="h-full rounded-full" style={{ width: `${w}%`, backgroundImage: RED_GRADIENT }} />
                      </div>
                    ))}
                  </div>
                </div>
                {/* check rows */}
                <div className="mt-4 space-y-2">
                  {["landing.body.2", "landing.eng.1", "landing.eng.5"].map((k) => (
                    <div key={k} className="flex items-center gap-2 rounded-xl bg-white/[0.04] px-3 py-2 text-sm text-white/80">
                      <CheckCircle2 className="size-4 shrink-0 text-[#27D3D8]" aria-hidden />
                      <span className="truncate">{t(locale, k)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Reveal>
        </div>

        {/* Marquee of detected issues */}
        <div className="relative border-y border-white/10 bg-black/30 py-3">
          <div className="flex w-max cg-marquee gap-8 whitespace-nowrap px-4 text-sm font-medium text-white/55">
            <span>{marquee}</span>
            <span aria-hidden>{marquee}</span>
          </div>
        </div>
      </section>

      {/* ============================ STATS ============================ */}
      <section className="bg-white">
        <div className="mx-auto grid w-full max-w-6xl grid-cols-2 gap-4 px-5 py-12 sm:grid-cols-4 lg:px-8 lg:py-16">
          {STATS.map((s) => (
            <Reveal key={s.k} className="text-center">
              <div className="text-4xl font-extrabold text-[#E50914] lg:text-5xl">
                <CountUp value={s.value} />
              </div>
              <p className="mt-1 text-sm font-medium text-[#6B7280]">{t(locale, s.k)}</p>
            </Reveal>
          ))}
          <Reveal className="text-center">
            <div className="text-4xl font-extrabold text-[#E50914] lg:text-5xl">US·EU</div>
            <p className="mt-1 text-sm font-medium text-[#6B7280]">{t(locale, "landing.stats.markets")}</p>
          </Reveal>
        </div>
      </section>

      {/* ============================ TRUST ============================ */}
      <section className="bg-[#F7F8FA]">
        <div className="mx-auto grid w-full max-w-6xl grid-cols-2 gap-3 px-5 py-10 sm:grid-cols-4 lg:px-8">
          {TRUST.map((it, i) => (
            <Reveal key={it.k} delay={i * 60}>
              <div className="flex h-full flex-col items-center gap-2 rounded-2xl border border-[#E5E7EB] bg-white p-4 text-center shadow-sm transition-transform hover:-translate-y-1">
                <span className="flex size-10 items-center justify-center rounded-xl bg-[rgba(39,211,216,0.12)] text-[#1FAEB3]">
                  <it.icon className="size-5" aria-hidden />
                </span>
                <span className="text-xs font-medium text-[#374151]">{t(locale, it.k)}</span>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ============================ HOW IT WORKS ============================ */}
      <section id="how" className="bg-white">
        <div className="mx-auto w-full max-w-6xl px-5 py-16 lg:px-8 lg:py-24">
          <Reveal>
            <h2 className="text-center text-3xl font-extrabold lg:text-4xl">{t(locale, "landing.how.title")}</h2>
            <p className="mx-auto mt-3 max-w-md text-center text-[#6B7280]">{t(locale, "landing.how.subtitle")}</p>
          </Reveal>
          <div className="mt-10 grid gap-4 lg:grid-cols-4 lg:gap-5">
            {HOW.map((step, i) => (
              <Reveal key={step.k} delay={i * 90}>
                <div className="group relative h-full overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg">
                  <span className="absolute right-3 top-2 text-5xl font-black text-[#F2F3F5] transition-colors group-hover:text-[rgba(229,9,20,0.10)]">
                    {i + 1}
                  </span>
                  <span className="relative flex size-11 items-center justify-center rounded-xl text-white" style={{ backgroundImage: RED_GRADIENT }}>
                    <step.icon className="size-5" aria-hidden />
                  </span>
                  <h3 className="relative mt-4 font-bold">{t(locale, `landing.how.${step.k}.title`)}</h3>
                  <p className="relative mt-1 text-sm text-[#6B7280]">{t(locale, `landing.how.${step.k}.text`)}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ============================ WHAT WE CHECK (tinted) ============================ */}
      <section id="checks" className="bg-gradient-to-b from-[#FFF5F5] to-white">
        <div className="mx-auto w-full max-w-6xl px-5 py-16 lg:px-8 lg:py-24">
          <Reveal>
            <h2 className="text-center text-3xl font-extrabold lg:text-4xl">{t(locale, "landing.checks.title")}</h2>
            <p className="mx-auto mt-3 max-w-xl text-center text-[#6B7280]">{t(locale, "landing.checks.subtitle")}</p>
          </Reveal>
          <div className="mt-10 grid gap-5 lg:grid-cols-3">
            <Reveal>
              <CheckGroup title={t(locale, "landing.checks.bodywork")} icon={Camera} items={BODYWORK} locale={locale} />
            </Reveal>
            <Reveal delay={120}>
              <CheckGroup title={t(locale, "landing.checks.engine")} icon={Wrench} items={ENGINE} locale={locale} />
            </Reveal>
            <Reveal delay={240}>
              <CheckGroup title={t(locale, "landing.checks.history")} icon={FileSearch} items={HISTORY} locale={locale} />
            </Reveal>
          </div>
        </div>
      </section>

      {/* ============================ COMPARISON (dark) ============================ */}
      <section className="bg-[#0B0B12] text-white">
        <div className="mx-auto w-full max-w-4xl px-5 py-16 text-center lg:px-8 lg:py-24">
          <Reveal>
            <h2 className="text-3xl font-extrabold lg:text-4xl">{t(locale, "landing.compare.title")}</h2>
            <p className="mx-auto mt-3 max-w-lg text-white/70">{t(locale, "landing.compare.subtitle")}</p>
          </Reveal>
          <div className="mt-8 grid gap-4 text-left sm:grid-cols-2">
            <Reveal>
              <div className="h-full rounded-2xl border border-[#27D3D8]/40 bg-[#27D3D8]/10 p-6">
                <div className="text-4xl font-extrabold text-white">{priceLabel}</div>
                <h3 className="mt-2 font-bold">{t(locale, "landing.compare.now.title")}</h3>
                <p className="mt-1 text-sm text-white/70">{t(locale, "landing.compare.now.desc")}</p>
              </div>
            </Reveal>
            <Reveal delay={120}>
              <div className="h-full rounded-2xl border border-[#FF4D4D]/40 bg-[#FF4D4D]/10 p-6">
                <div className="text-4xl font-extrabold text-[#FF7A7A]">{t(locale, "landing.compare.risk.price")}</div>
                <h3 className="mt-2 font-bold">{t(locale, "landing.compare.risk.title")}</h3>
                <p className="mt-1 text-sm text-white/70">{t(locale, "landing.compare.risk.desc")}</p>
              </div>
            </Reveal>
          </div>
          <Reveal delay={160}>
            <Link
              href={startHref}
              className="mt-8 inline-flex h-12 items-center justify-center gap-2 rounded-2xl px-7 text-sm font-semibold text-white shadow-[0_16px_40px_rgba(229,9,20,0.45)] transition-transform hover:scale-[1.02]"
              style={{ backgroundImage: RED_GRADIENT }}
            >
              <ScanLine className="size-5" aria-hidden /> {t(locale, "landing.compare.cta")}
            </Link>
          </Reveal>
        </div>
      </section>

      {/* ============================ REVIEWS ============================ */}
      <section className="bg-white">
        <div className="mx-auto w-full max-w-6xl px-5 py-16 lg:px-8 lg:py-24">
          <Reveal>
            <h2 className="text-center text-3xl font-extrabold lg:text-4xl">{t(locale, "landing.reviews.title")}</h2>
            <p className="mx-auto mt-3 max-w-md text-center text-[#6B7280]">{t(locale, "landing.reviews.subtitle")}</p>
          </Reveal>
          <div className="mt-10 grid gap-5 sm:grid-cols-3">
            {REVIEWS.map((r, i) => (
              <Reveal key={r} delay={i * 90}>
                <figure className="h-full rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg">
                  <Quote className="size-7 text-[#E50914]/25" aria-hidden />
                  <div className="mt-2 flex gap-0.5 text-[#F5A623]">
                    {Array.from({ length: 5 }).map((_, j) => (
                      <Star key={j} className="size-4 fill-current" aria-hidden />
                    ))}
                  </div>
                  <blockquote className="mt-3 text-sm leading-relaxed text-[#374151]">
                    {t(locale, `landing.reviews.${r}.quote`)}
                  </blockquote>
                  <figcaption className="mt-4 text-xs font-semibold text-[#6B7280]">
                    — {t(locale, `landing.reviews.${r}.author`)}
                  </figcaption>
                </figure>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ============================ WHY + FAQ (tinted) ============================ */}
      <section className="bg-[#F7F8FA]">
        <div className="mx-auto w-full max-w-3xl px-5 py-16 lg:px-8 lg:py-24">
          <Reveal className="text-center">
            <Lightbulb className="mx-auto mb-3 size-9 text-[#27D3D8]" aria-hidden />
            <h2 className="text-3xl font-extrabold lg:text-4xl">{t(locale, "landing.why.title")}</h2>
            <p className="mt-3 text-[15px] leading-relaxed text-[#6B7280] lg:text-lg">{t(locale, "landing.why.body")}</p>
          </Reveal>

          <Reveal delay={120}>
            <h3 className="mt-14 text-center text-2xl font-bold">{t(locale, "landing.faq.title")}</h3>
            <div className="mt-5 divide-y divide-[#EFEFEF] overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white">
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
          </Reveal>

          <Reveal>
            <p className="mx-auto mt-8 max-w-xl rounded-2xl border border-[#E5E7EB] bg-white p-4 text-center text-xs text-[#6B7280]">
              {t(locale, "landing.why.disclaimer")}
            </p>
          </Reveal>
        </div>
      </section>

      {/* ============================ FINAL CTA ============================ */}
      <section className="bg-white px-5 py-16 lg:py-24">
        <Reveal className="mx-auto w-full max-w-5xl">
          <div
            className="cg-animated-gradient relative overflow-hidden rounded-3xl px-6 py-14 text-center text-white shadow-[0_30px_70px_rgba(229,9,20,0.35)]"
            style={{ backgroundImage: "linear-gradient(120deg,#FF2A2A 0%,#E50914 40%,#B00008 70%,#7a0006 100%)" }}
          >
            <div aria-hidden className="pointer-events-none absolute -left-10 -top-10 size-44 rounded-full bg-white/10 blur-2xl animate-cg-blob" />
            <h2 className="relative text-3xl font-extrabold lg:text-4xl">{t(locale, "landing.final.title")}</h2>
            <p className="relative mx-auto mt-3 max-w-md text-white/90">{t(locale, "landing.final.subtitle")}</p>
            <Link
              href={startHref}
              className="relative mt-7 inline-flex h-14 items-center justify-center gap-2 rounded-2xl bg-white px-9 text-base font-bold text-[#B00008] transition-transform hover:scale-[1.03] active:scale-[0.98]"
            >
              <ScanLine className="size-5" aria-hidden /> {t(locale, "landing.start")}
            </Link>
          </div>
        </Reveal>
      </section>

      {/* ============================ FOOTER (dark) ============================ */}
      <footer className="bg-[#0B0B12] text-white/60">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-4 px-5 py-10 text-center text-xs lg:px-8">
          <div className="flex items-center gap-2 text-base font-extrabold text-white">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="" aria-hidden className="size-7" /> CarGuard <span className="text-[#FF4D4D]">AI</span>
          </div>
          <div className="flex justify-center gap-5">
            <Link href="/terms" className="hover:text-white">Terms</Link>
            <Link href="/privacy" className="hover:text-white">Privacy</Link>
            <Link href="/disclaimer" className="hover:text-white">Disclaimer</Link>
            <Link href="/pricing" className="hover:text-white">{t(locale, "landing.pricing")}</Link>
          </div>
          <p>© {new Date().getFullYear()} CarGuard AI</p>
        </div>
      </footer>
    </div>
  );
}

function RiskRing() {
  const size = 84;
  const r = (size - 10) / 2;
  const circ = 2 * Math.PI * r;
  const value = 82; // safety score for the mockup
  const offset = circ - (value / 100) * circ;
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} strokeWidth={8} className="fill-none stroke-white/10" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          strokeWidth={8}
          strokeLinecap="round"
          className="fill-none"
          stroke="#27D3D8"
          strokeDasharray={circ}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-xl font-extrabold text-white">{value}</span>
        <span className="text-[9px] text-white/50">/ 100</span>
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
    <div className="h-full rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center gap-2">
        <span className="flex size-10 items-center justify-center rounded-xl text-white" style={{ backgroundImage: RED_GRADIENT }}>
          <Icon className="size-5" aria-hidden />
        </span>
        <h3 className="text-lg font-bold text-[#111827]">{title}</h3>
      </div>
      <ul className="space-y-3">
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
