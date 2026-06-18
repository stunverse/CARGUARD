import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { logActivity } from "@/lib/activity";
import { getServerLocale } from "@/lib/i18n-server";
import { localeCurrency } from "@/lib/i18n";
import { INSPECTION_PACKS, packById, isStripeConfigured } from "@/lib/billing";
import { getStripe } from "@/lib/stripe";

export const runtime = "nodejs";

// POST /api/inspections/checkout — start an inspection.
//   • demo mode (no Stripe): create the draft paid (free) so the flow is testable.
//   • { useCredit: true }: spend one inspection credit, create the draft paid.
//   • { pack }: buy a pack via Stripe; the draft is created and marked paid by
//     the webhook, which also grants the remaining credits (pack credits − 1).
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const { goal, useCredit, pack, waiver, ...vehicleInput } = body ?? {};

  // NOTE: the vehicle is now entered AFTER payment (the plate/VIN lookup is
  // billable, so it must run only on a paid inspection). We create the draft
  // with a placeholder vehicle and fill it in during the vehicle questions.
  // Consumer must accept the sales terms + waive withdrawal (immediate execution).
  if (waiver !== true) {
    return NextResponse.json(
      { error: "You must accept the sales terms to continue.", code: "waiver_required" },
      { status: 400 },
    );
  }
  // Record the consent (best-effort audit trail).
  try {
    await supabase.from("user_consents").insert({
      user_id: user.id,
      consent_type: "terms",
      consent_text:
        "Accepted CGV/CGU and requested immediate execution, waiving the 14-day right of withdrawal once the inspection analysis begins.",
    });
  } catch {
    // never block checkout on consent logging
  }

  const locale = await getServerLocale();
  const currency = (vehicleInput.currency || localeCurrency(locale)).toLowerCase();
  const num = (v: unknown) => (v === "" || v == null ? null : Number(v));
  const stripeOn = isStripeConfigured();

  async function createSession(paid: boolean, amountCents: number | null) {
    const { data: vehicle, error: vErr } = await supabase
      .from("vehicles")
      .insert({
        user_id: user!.id,
        make: vehicleInput.make || "",
        model: vehicleInput.model || "",
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
    if (vErr) throw new Error(vErr.message);

    const { data: session, error: sErr } = await supabase
      .from("inspection_sessions")
      .insert({
        user_id: user!.id,
        vehicle_id: vehicle.id,
        goal: goal || null,
        status: "waiting_for_photos",
        payment_status: paid ? "paid" : "unpaid",
        payment_amount_cents: amountCents,
        payment_currency: currency,
      })
      .select()
      .single();
    if (sErr) throw new Error(sErr.message);

    await logActivity(supabase, {
      userId: user!.id,
      sessionId: session.id,
      action: "inspection_created",
      description:
        `${vehicle.year ?? ""} ${vehicle.make} ${vehicle.model}`.trim() || "New inspection",
    });
    return { vehicle, session };
  }

  try {
    // 1) Demo mode — no payments configured: free, immediate.
    if (!stripeOn) {
      const { session } = await createSession(true, null);
      return NextResponse.json({ sessionId: session.id, paid: true });
    }

    // 2) Spend an existing credit.
    if (useCredit) {
      const admin = createAdminClient();
      const { data: remaining, error } = await admin.rpc("consume_inspection_credit", {
        p_user: user.id,
      });
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      if (typeof remaining !== "number" || remaining < 0) {
        return NextResponse.json({ needPack: true, credits: 0 });
      }
      const { session } = await createSession(true, null);
      return NextResponse.json({ sessionId: session.id, paid: true, creditsLeft: remaining });
    }

    // 3) Buy a pack via Stripe; webhook marks paid + grants remaining credits.
    const chosen = packById(pack) ?? INSPECTION_PACKS[0];
    const { vehicle, session } = await createSession(false, Math.round(chosen.price * 100));

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
            unit_amount: Math.round(chosen.price * 100),
            product_data: {
              name: `CarGuard AI — ${chosen.credits} inspection${chosen.credits > 1 ? "s" : ""}`,
              description: `Hidden-damage + engine analysis. ${chosen.credits} inspection credit(s).`,
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
        credits: String(chosen.credits),
        pack: chosen.id,
      },
      payment_intent_data: {
        metadata: {
          type: "inspection",
          user_id: user.id,
          session_id: session.id,
          credits: String(chosen.credits),
          pack: chosen.id,
        },
      },
    });

    await supabase
      .from("inspection_sessions")
      .update({ stripe_checkout_session_id: checkout.id })
      .eq("id", session.id);

    void vehicle;
    return NextResponse.json({ url: checkout.url });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Checkout failed.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
