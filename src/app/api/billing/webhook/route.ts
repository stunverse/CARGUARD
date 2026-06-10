import { NextResponse, type NextRequest } from "next/server";
import type Stripe from "stripe";
import { isStripeConfigured } from "@/lib/billing";
import { getStripe, planFromPriceId } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/admin";
import type { PlanName } from "@/types";

export const runtime = "nodejs";

// POST /api/billing/webhook — Stripe webhook receiver.
// Verifies the signature, then keeps public.subscriptions in sync.
export async function POST(request: NextRequest) {
  if (!isStripeConfigured() || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ received: false, reason: "stripe_disabled" });
  }

  const stripe = getStripe();
  const sig = request.headers.get("stripe-signature");
  const body = await request.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig!,
      process.env.STRIPE_WEBHOOK_SECRET,
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const admin = createAdminClient();

  // Resolve our user from the Stripe customer id (mapping stored at checkout)
  // or from event metadata as a fallback.
  async function resolveUserId(
    customerId: string | null,
    metaUserId?: string | null,
  ): Promise<string | null> {
    if (metaUserId) return metaUserId;
    if (!customerId) return null;
    const { data } = await admin
      .from("subscriptions")
      .select("user_id")
      .eq("stripe_customer_id", customerId)
      .maybeSingle();
    return data?.user_id ?? null;
  }

  async function upsertFromSubscription(sub: Stripe.Subscription) {
    const customerId =
      typeof sub.customer === "string" ? sub.customer : sub.customer.id;
    const userId = await resolveUserId(
      customerId,
      (sub.metadata?.user_id as string) ?? null,
    );
    if (!userId) {
      console.error("Webhook: could not resolve user for customer", customerId);
      return;
    }

    const priceId = sub.items.data[0]?.price?.id;
    const plan: PlanName =
      (sub.metadata?.plan as PlanName) || planFromPriceId(priceId);

    await admin.from("subscriptions").upsert(
      {
        user_id: userId,
        stripe_customer_id: customerId,
        stripe_subscription_id: sub.id,
        plan_name: plan,
        status: sub.status,
        current_period_start: new Date(sub.current_period_start * 1000).toISOString(),
        current_period_end: new Date(sub.current_period_end * 1000).toISOString(),
        cancel_at_period_end: sub.cancel_at_period_end,
      },
      { onConflict: "user_id" },
    );
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      if (session.subscription) {
        const sub = await stripe.subscriptions.retrieve(
          session.subscription as string,
        );
        // Carry over checkout metadata if the subscription lacks it.
        sub.metadata = {
          ...sub.metadata,
          user_id:
            (sub.metadata?.user_id as string) ||
            (session.metadata?.user_id as string) ||
            session.client_reference_id ||
            "",
          plan: (sub.metadata?.plan as string) || (session.metadata?.plan as string) || "",
        };
        await upsertFromSubscription(sub);
      }
      break;
    }
    case "customer.subscription.created":
    case "customer.subscription.updated": {
      await upsertFromSubscription(event.data.object as Stripe.Subscription);
      break;
    }
    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription;
      const customerId =
        typeof sub.customer === "string" ? sub.customer : sub.customer.id;
      const userId = await resolveUserId(customerId, sub.metadata?.user_id as string);
      if (userId) {
        await admin
          .from("subscriptions")
          .update({
            plan_name: "free",
            status: "canceled",
            stripe_subscription_id: null,
            cancel_at_period_end: false,
          })
          .eq("user_id", userId);
      }
      break;
    }
    case "invoice.payment_failed": {
      const invoice = event.data.object as Stripe.Invoice;
      const customerId =
        typeof invoice.customer === "string" ? invoice.customer : invoice.customer?.id ?? null;
      const userId = await resolveUserId(customerId);
      if (userId) {
        await admin
          .from("subscriptions")
          .update({ status: "past_due" })
          .eq("user_id", userId);
      }
      break;
    }
    default:
      // Unhandled event types are acknowledged without action.
      break;
  }

  return NextResponse.json({ received: true });
}
