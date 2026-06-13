import Link from "next/link";
import {
  AlignVerticalJustifyCenter,
  Camera,
  Car,
  Droplets,
  FileText,
  Flame,
  Gauge,
  Lightbulb,
  Palette,
  ScanSearch,
  ShieldCheck,
  Volume2,
  Wrench,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SiteHeader } from "@/components/site-header";
import { DisclaimerBanner } from "@/components/disclaimer-banner";
import { createClient } from "@/lib/supabase/server";

const HOW_IT_WORKS = [
  { icon: Car, title: "Enter the vehicle details", text: "Type it in, or auto-fill instantly from the VIN." },
  { icon: Camera, title: "Take 8 guided exterior photos", text: "We guide each angle to check the bodywork." },
  { icon: Wrench, title: "Add the engine & mechanical checks", text: "Cold start, smoke, oil, coolant, leaks, sounds — optional." },
  { icon: FileText, title: "Get a clear AI report before buying", text: "Risk score, suspicious points, questions, PDF." },
];

const BODYWORK_CHECKS = [
  { label: "Panel alignment", icon: AlignVerticalJustifyCenter },
  { label: "Color & repaint differences", icon: Palette },
  { label: "Bumper fitment", icon: ShieldCheck },
  { label: "Hood & trunk alignment", icon: AlignVerticalJustifyCenter },
  { label: "Headlights & taillights", icon: ShieldCheck },
  { label: "Signs of previous body repairs", icon: ScanSearch },
];

const ENGINE_CHECKS = [
  { label: "Cold-start noises (knocking, rattling)", icon: Volume2 },
  { label: "Exhaust smoke (white / blue / black)", icon: Flame },
  { label: "Oil & coolant condition (mayonnaise)", icon: Droplets },
  { label: "Leaks under the engine", icon: Droplets },
  { label: "Dashboard warning lights", icon: Gauge },
  { label: "Rough idle & acceleration", icon: Wrench },
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
    // Supabase not configured yet — render the public landing page.
  }

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader authed={authed} />

      {/* Hero */}
      <section className="border-b bg-gradient-to-b from-primary/5 to-background">
        <div className="container flex flex-col items-center gap-6 py-20 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border bg-background px-4 py-1.5 text-sm font-medium">
            <ShieldCheck className="size-4 text-primary" />
            AI-powered hidden-defect detection
          </div>
          <h1 className="max-w-4xl text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
            Spot a <span className="text-primary">hidden defect</span> the seller
            may be hiding — <span className="text-primary">before you buy</span> a
            used car.
          </h1>
          <p className="max-w-2xl text-lg text-muted-foreground">
            CarGuard AI guides you through exterior photos and engine &amp;
            mechanical checks, then uses AI to flag possible signs of past
            accidents, body repairs, repainting and engine problems — so you can
            negotiate, or walk away, with confidence.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link href={authed ? "/inspections/new" : "/signup"}>
                Start an inspection
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/#how">See how it works</Link>
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Bodywork + engine checks · AI risk score · shareable PDF report
          </p>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="container py-20">
        <h2 className="mb-3 text-center text-3xl font-bold">How it works</h2>
        <p className="mx-auto mb-12 max-w-xl text-center text-muted-foreground">
          A guided inspection anyone can do with a phone — no mechanical
          knowledge required.
        </p>
        <div className="grid gap-6 md:grid-cols-4">
          {HOW_IT_WORKS.map((step, i) => (
            <Card key={step.title} className="relative">
              <CardContent className="pt-6">
                <div className="mb-4 inline-flex size-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <step.icon className="size-6" />
                </div>
                <div className="mb-1 text-sm font-semibold text-accent">
                  Step {i + 1}
                </div>
                <h3 className="font-semibold">{step.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{step.text}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* What we check */}
      <section id="checks" className="border-y bg-muted/30 py-20">
        <div className="container">
          <h2 className="mb-3 text-center text-3xl font-bold">
            What CarGuard AI checks
          </h2>
          <p className="mx-auto mb-12 max-w-xl text-center text-muted-foreground">
            Two complementary modules: the bodywork (accident &amp; repair signs)
            and the engine &amp; mechanical condition.
          </p>
          <div className="grid gap-8 md:grid-cols-2">
            <CheckGroup
              title="Bodywork & accident signs"
              icon={Camera}
              items={BODYWORK_CHECKS}
            />
            <CheckGroup
              title="Engine & mechanical"
              icon={Wrench}
              items={ENGINE_CHECKS}
            />
          </div>
        </div>
      </section>

      {/* Why it matters */}
      <section className="container py-20">
        <div className="mx-auto max-w-2xl text-center">
          <Lightbulb className="mx-auto mb-4 size-10 text-accent" />
          <h2 className="text-3xl font-bold">Why it matters</h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Some used cars are repaired or patched up quickly before resale — a
            repainted panel, a head-gasket issue, a warning light cleared just
            before the viewing. CarGuard AI helps you spot the warning signs
            before you pay.
          </p>
          <div className="mt-10">
            <DisclaimerBanner text="CarGuard AI provides a preliminary, photo- and sound-based screening. It does not replace a professional inspection or a certified mechanic." />
          </div>
          <div className="mt-10">
            <Button asChild size="lg">
              <Link href="/pricing">View pricing</Link>
            </Button>
          </div>
        </div>
      </section>

      <footer className="border-t py-10">
        <div className="container flex flex-col items-center justify-between gap-4 text-sm text-muted-foreground md:flex-row">
          <span>© {new Date().getFullYear()} CarGuard AI</span>
          <nav className="flex gap-6">
            <Link href="/terms">Terms</Link>
            <Link href="/privacy">Privacy</Link>
            <Link href="/disclaimer">Disclaimer</Link>
          </nav>
        </div>
      </footer>
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
    <Card>
      <CardContent className="pt-6">
        <div className="mb-4 flex items-center gap-2">
          <span className="inline-flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Icon className="size-5" />
          </span>
          <h3 className="text-lg font-semibold">{title}</h3>
        </div>
        <ul className="space-y-3">
          {items.map((it) => (
            <li key={it.label} className="flex items-center gap-3">
              <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-md bg-accent/10 text-accent">
                <it.icon className="size-4" />
              </span>
              <span className="text-sm font-medium">{it.label}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
