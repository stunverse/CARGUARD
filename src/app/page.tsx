import Link from "next/link";
import {
  AlignVerticalJustifyCenter,
  Camera,
  Car,
  FileText,
  Lightbulb,
  Palette,
  ScanSearch,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SiteHeader } from "@/components/site-header";
import { DisclaimerBanner } from "@/components/disclaimer-banner";
import { createClient } from "@/lib/supabase/server";

const HOW_IT_WORKS = [
  { icon: Car, title: "Enter the vehicle details", text: "Make, model, year, mileage, price and seller." },
  { icon: Camera, title: "Take 8 guided exterior photos", text: "We guide you through every required angle." },
  { icon: ScanSearch, title: "Get AI-powered damage risk analysis", text: "Quality checks then a per-photo analysis." },
  { icon: FileText, title: "Receive a clear report before buying", text: "Score, suspicious points, and seller questions." },
];

const CHECKS = [
  "Panel alignment",
  "Color differences",
  "Bumper fitment",
  "Hood and trunk alignment",
  "Headlights and taillights",
  "Side panel consistency",
  "Signs of repainting",
  "Possible previous body repairs",
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
            AI-powered hidden damage detection
          </div>
          <h1 className="max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
            Detect hidden accident damage{" "}
            <span className="text-primary">before buying</span> a used car.
          </h1>
          <p className="max-w-2xl text-lg text-muted-foreground">
            CarGuard AI guides you through 8 exterior photos and helps identify
            possible signs of previous accidents, repainting, body repairs, or
            suspicious panel alignment.
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
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="container py-20">
        <h2 className="mb-12 text-center text-3xl font-bold">How it works</h2>
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
          <h2 className="mb-12 text-center text-3xl font-bold">
            What CarGuard AI checks
          </h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {CHECKS.map((c) => (
              <div
                key={c}
                className="flex items-center gap-3 rounded-lg border bg-background p-4"
              >
                <CheckIcon label={c} />
                <span className="text-sm font-medium">{c}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why it matters */}
      <section className="container py-20">
        <div className="mx-auto max-w-2xl text-center">
          <Lightbulb className="mx-auto mb-4 size-10 text-accent" />
          <h2 className="text-3xl font-bold">Why it matters</h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Some used cars are repaired quickly before resale. CarGuard AI helps
            you spot visual warning signs before you pay.
          </p>
          <div className="mt-10">
            <DisclaimerBanner text="CarGuard AI does not replace a professional inspection." />
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

function CheckIcon({ label }: { label: string }) {
  // Vary icon per check for a bit of life.
  const Icon =
    label.includes("Color") || label.includes("repaint")
      ? Palette
      : label.includes("alignment") || label.includes("consistency")
        ? AlignVerticalJustifyCenter
        : ShieldCheck;
  return (
    <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-md bg-accent/10 text-accent">
      <Icon className="size-4" />
    </span>
  );
}
