import { NextResponse, type NextRequest } from "next/server";
import { isStripeConfigured } from "@/lib/billing";

// POST /api/billing/webhook — Stripe webhook receiver (scaffolding).
// TODO: verify signature with STRIPE_WEBHOOK_SECRET and handle:
//   checkout.session.completed, customer.subscription.updated/deleted,
//   invoice.payment_failed — then upsert public.subscriptions.
export async function POST(request: NextRequest) {
  if (!isStripeConfigured()) {
    return NextResponse.json({ received: false, reason: "stripe_disabled" });
  }

  const sig = request.headers.get("stripe-signature");
  const body = await request.text();

  // TODO: const event = stripe.webhooks.constructEvent(body, sig, secret);
  void sig;
  void body;

  return NextResponse.json({ received: true });
}
