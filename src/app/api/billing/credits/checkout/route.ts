import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getServerLocale } from "@/lib/i18n-server";
import { localeCurrency } from "@/lib/i18n";
import { INSPECTION_PACKS, packById, isStripeConfigured } from "@/lib/billing";
import { getStripe } from "@/lib/stripe";

export const runtime = "nodejs";

// POST /api/billing/credits/checkout — buy an inspection pack standalone
// (from the billing page). Demo mode grants the credits immediately.
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { pack } = (await request.json().catch(() => ({}))) as { pack?: string };
  const chosen = packById(pack) ?? INSPECTION_PACKS[0];

  // Demo mode: grant credits right away.
  if (!isStripeConfigured()) {
    const admin = createAdminClient();
    await admin.rpc("grant_inspection_credits", { p_user: user.id, p_amount: chosen.credits });
    return NextResponse.json({ ok: true, granted: chosen.credits });
  }

  const locale = await getServerLocale();
  const currency = localeCurrency(locale).toLowerCase();
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
            description: `${chosen.credits} inspection credit(s).`,
          },
        },
      },
    ],
    success_url: `${appUrl}/billing?credits=success`,
    cancel_url: `${appUrl}/billing?credits=cancelled`,
    metadata: { type: "credits", user_id: user.id, credits: String(chosen.credits), pack: chosen.id },
    payment_intent_data: {
      metadata: { type: "credits", user_id: user.id, credits: String(chosen.credits), pack: chosen.id },
    },
  });

  return NextResponse.json({ url: checkout.url });
}
