// =====================================================================
// CarGuard AI — Stripe client + plan mapping (server only)
// Billing is optional: when STRIPE_SECRET_KEY is absent, getStripe()
// throws and callers degrade gracefully (handled in the API routes).
// =====================================================================

import Stripe from "stripe";
import type { PlanName } from "@/types";
import { PLANS } from "@/lib/billing";

let _stripe: Stripe | null = null;
export function getStripe(): Stripe {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error("STRIPE_SECRET_KEY is not configured.");
  }
  if (!_stripe) {
    // Use the SDK's pinned API version (omit to avoid literal-type drift).
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  }
  return _stripe;
}

// Map a Stripe price id back to our plan name (via the env-configured ids).
export function planFromPriceId(priceId: string | null | undefined): PlanName {
  if (!priceId) return "free";
  const plan = PLANS.find((p) => p.stripePriceId && p.stripePriceId === priceId);
  return plan?.name ?? "free";
}

export function priceIdForPlan(plan: PlanName): string | undefined {
  return PLANS.find((p) => p.name === plan)?.stripePriceId;
}
