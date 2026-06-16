import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { logActivity } from "@/lib/activity";
import { getServerLocale } from "@/lib/i18n-server";
import { localeCurrency } from "@/lib/i18n";
import {
  INSPECTION_PRICE_CENTS,
  isStripeConfigured,
} from "@/lib/billing";
import { getStripe } from "@/lib/stripe";

export const runtime = "nodejs";

// POST /api/inspections/checkout — pay-per-inspection (€29).
// Creates the draft inspection at payment time (after the vehicle questions,
// before the 8 photos). With Stripe configured it returns a Checkout URL and
// the draft is marked paid by the webhook on success; in demo mode (no Stripe)
// the draft is created and marked paid immediately so the flow stays testable.
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const { goal, ...vehicleInput } = body ?? {};

  if (!vehicleInput.make || !vehicleInput.model) {
    return NextResponse.json({ error: "Make and model are required." }, { status: 400 });
  }

  const locale = await getServerLocale();
  const currency = (vehicleInput.currency || localeCurrency(locale)).toLowerCase();
  const num = (v: unknown) => (v === "" || v == null ? null : Number(v));
  const stripeOn = isStripeConfigured();

  // Create the vehicle.
  const { data: vehicle, error: vErr } = await supabase
    .from("vehicles")
    .insert({
      user_id: user.id,
      make: vehicleInput.make,
      model: vehicleInput.model,
      year: num(vehicleInput.year),
      generation: vehicleInput.generation || null,
      trim: vehicleInput.trim || null,
      engine: vehicleInput.engine || null,
      fuel_type: vehicleInput.fuel_type || null,
      transmission: vehicleInput.transmission || null,
      mileage: num(vehicleInput.mileage),
      asking_price: num(vehicleInput.asking_price),
      currency: currency.toUpperCase(),
      seller_type: vehicleInput.seller_type || "unknown",
      listing_url: vehicleInput.listing_url || null,
      vin: vehicleInput.vin || null,
      country: vehicleInput.country || null,
      city: vehicleInput.city || null,
      notes: vehicleInput.notes || null,
    })
    .select()
    .single();
  if (vErr) return NextResponse.json({ error: vErr.message }, { status: 500 });

  // Create the draft inspection. Demo mode marks it paid right away.
  const { data: session, error: sErr } = await supabase
    .from("inspection_sessions")
    .insert({
      user_id: user.id,
      vehicle_id: vehicle.id,
      goal: goal || null,
      status: "waiting_for_photos",
      payment_status: stripeOn ? "unpaid" : "paid",
      payment_amount_cents: INSPECTION_PRICE_CENTS,
      payment_currency: currency,
    })
    .select()
    .single();
  if (sErr) return NextResponse.json({ error: sErr.message }, { status: 500 });

  await logActivity(supabase, {
    userId: user.id,
    sessionId: session.id,
    action: "inspection_created",
    description: `${vehicle.year ?? ""} ${vehicle.make} ${vehicle.model}`.trim(),
  });

  // Demo mode (no Stripe): proceed straight to the photos.
  if (!stripeOn) {
    return NextResponse.json({ sessionId: session.id, paid: true });
  }

  // Stripe Checkout (one-time payment).
  const stripe = getStripe();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || new URL(request.url).origin;
  const checkout = await stripe.checkout.sessions.create({
    mode: "payment",
    customer_email: user.email ?? undefined,
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency,
          unit_amount: INSPECTION_PRICE_CENTS,
          product_data: {
            name: "CarGuard AI — Vehicle inspection",
            description: `Hidden-damage + engine analysis for ${vehicle.make} ${vehicle.model}`.trim(),
          },
        },
      },
    ],
    success_url: `${appUrl}/inspections/${session.id}/continue?paid=success`,
    cancel_url: `${appUrl}/inspections/new?paid=cancelled`,
    metadata: {
      type: "inspection",
      user_id: user.id,
      session_id: session.id,
    },
    payment_intent_data: {
      metadata: { type: "inspection", user_id: user.id, session_id: session.id },
    },
  });

  await supabase
    .from("inspection_sessions")
    .update({ stripe_checkout_session_id: checkout.id })
    .eq("id", session.id);

  return NextResponse.json({ url: checkout.url });
}
