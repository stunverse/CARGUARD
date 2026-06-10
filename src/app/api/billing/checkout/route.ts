import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isStripeConfigured, PLANS } from "@/lib/billing";

// POST /api/billing/checkout — create a Stripe Checkout session.
// Scaffolding: when Stripe is not configured, returns a clear message so the
// UI can show a "coming soon" state instead of failing.
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!isStripeConfigured()) {
    return NextResponse.json(
      { error: "Billing is not configured yet. Add STRIPE_SECRET_KEY to enable checkout." },
      { status: 503 },
    );
  }

  const { plan } = await request.json();
  const planDef = PLANS.find((p) => p.name === plan);
  if (!planDef?.stripePriceId) {
    return NextResponse.json({ error: "Unknown or unpriced plan." }, { status: 400 });
  }

  // TODO: instantiate Stripe and create a Checkout Session:
  //   const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
  //   const session = await stripe.checkout.sessions.create({ ... });
  //   return NextResponse.json({ url: session.url });
  // Persist stripe_customer_id / subscription via the webhook handler.
  return NextResponse.json(
    { error: "Stripe checkout wiring is pending (see TODO in route)." },
    { status: 501 },
  );
}
