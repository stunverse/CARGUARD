import { NextResponse, type NextRequest } from "next/server";
import type Stripe from "stripe";
import { isStripeConfigured } from "@/lib/billing";
import { getStripe, planFromPriceId } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/admin";
import { fetchVinAuditReport } from "@/lib/vinaudit";
import type { PlanName } from "@/types";

const VIN_CACHE_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

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

      // Inspection pack: mark this inspection paid + grant the remaining credits.
      if (session.metadata?.type === "inspection") {
        const inspectionId = session.metadata.session_id;
        const userId = session.metadata.user_id;
        const credits = Number(session.metadata.credits ?? "1");
        if (inspectionId) {
          await admin
            .from("inspection_sessions")
            .update({ payment_status: "paid" })
            .eq("id", inspectionId);
        }
        // One credit is consumed by this inspection; bank the rest.
        if (userId && credits > 1) {
          await admin.rpc("grant_inspection_credits", { p_user: userId, p_amount: credits - 1 });
        }
        break;
      }

      // Standalone pack purchase (from the billing page): grant all credits.
      if (session.metadata?.type === "credits") {
        const userId = session.metadata.user_id;
        const credits = Number(session.metadata.credits ?? "0");
        if (userId && credits > 0) {
          await admin.rpc("grant_inspection_credits", { p_user: userId, p_amount: credits });
        }
        break;
      }

      // One-time purchase: paid per-VIN history report.
      if (session.metadata?.type === "vin_history") {
        const vin = (session.metadata.vin ?? "").toUpperCase();
        const purchaseId = session.metadata.purchase_id;
        if (vin && purchaseId) {
          await admin
            .from("vin_report_purchases")
            .update({ status: "paid" })
            .eq("id", purchaseId);

          // Fetch from provider unless a fresh cache exists (saves cost).
          try {
            const { data: cached } = await admin
              .from("vin_reports")
              .select("fetched_at")
              .eq("vin", vin)
              .maybeSingle();
            const fresh =
              cached &&
              Date.now() - new Date(cached.fetched_at).getTime() < VIN_CACHE_MAX_AGE_MS;
            if (!fresh) {
              const report = await fetchVinAuditReport(vin);
              await admin.from("vin_reports").upsert(
                { vin, provider: "vinaudit", data: report, fetched_at: new Date().toISOString() },
                { onConflict: "vin" },
              );
            }
          } catch (err) {
            console.error("VinAudit fetch failed after payment:", err);
            // Payment stays 'paid'; the GET endpoint will retry-fetch lazily.
          }
        }
        break;
      }

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
