import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  isStripeConfigured,
  VIN_HISTORY_CURRENCY,
  VIN_HISTORY_PRICE_CENTS,
} from "@/lib/billing";
import { getStripe } from "@/lib/stripe";
import { isVinAuditConfigured } from "@/lib/vinaudit";
import { isLikelyVin } from "@/lib/vehicle-lookup";

export const runtime = "nodejs";

// POST /api/vin-history/checkout — buy a paid per-VIN history report.
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Never charge if we can't deliver.
  if (!isStripeConfigured()) {
    return NextResponse.json({ error: "Payments are not enabled yet." }, { status: 503 });
  }
  if (!isVinAuditConfigured()) {
    return NextResponse.json(
      { error: "The paid history provider is not configured yet." },
      { status: 503 },
    );
  }

  const { vin, sessionId } = (await request.json()) as { vin?: string; sessionId?: string };
  const cleanVin = (vin ?? "").trim().toUpperCase();
  if (!isLikelyVin(cleanVin)) {
    return NextResponse.json({ error: "A valid 17-character VIN is required." }, { status: 400 });
  }

  // Already owned? Don't charge twice.
  const { data: existing } = await supabase
    .from("vin_report_purchases")
    .select("id, status")
    .eq("user_id", user.id)
    .eq("vin", cleanVin)
    .eq("status", "paid")
    .maybeSingle();
  if (existing) {
    return NextResponse.json({ alreadyOwned: true });
  }

  const { data: purchase, error: insErr } = await supabase
    .from("vin_report_purchases")
    .insert({
      user_id: user.id,
      vin: cleanVin,
      inspection_session_id: sessionId ?? null,
      amount_cents: VIN_HISTORY_PRICE_CENTS,
      currency: VIN_HISTORY_CURRENCY,
      status: "pending",
    })
    .select()
    .single();
  if (insErr) return NextResponse.json({ error: insErr.message }, { status: 500 });

  const stripe = getStripe();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || new URL(request.url).origin;
  const back = sessionId ? `/inspections/${sessionId}` : "/dashboard";

  const checkout = await stripe.checkout.sessions.create({
    mode: "payment",
    customer_email: user.email ?? undefined,
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: VIN_HISTORY_CURRENCY,
          unit_amount: VIN_HISTORY_PRICE_CENTS,
          product_data: {
            name: "Vehicle History Report (NMVTIS)",
            description: `Full title & salvage history for VIN ${cleanVin}`,
          },
        },
      },
    ],
    success_url: `${appUrl}${back}?vinhistory=success`,
    cancel_url: `${appUrl}${back}?vinhistory=cancelled`,
    metadata: {
      type: "vin_history",
      user_id: user.id,
      vin: cleanVin,
      purchase_id: purchase.id,
    },
    payment_intent_data: {
      metadata: { type: "vin_history", user_id: user.id, vin: cleanVin, purchase_id: purchase.id },
    },
  });

  await supabase
    .from("vin_report_purchases")
    .update({ stripe_checkout_session_id: checkout.id })
    .eq("id", purchase.id);

  return NextResponse.json({ url: checkout.url });
}
