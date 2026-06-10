// =====================================================================
// CarGuard AI — Billing plans (spec §37)
// Plan metadata is defined here; Stripe price IDs are wired via env when
// Stripe is enabled. Quotas mirror public.usage_limits seed.
// =====================================================================

import type { PlanName } from "@/types";

export interface Plan {
  name: PlanName;
  label: string;
  priceMonthly: number; // USD
  description: string;
  features: string[];
  // TODO: set Stripe price IDs once products are created.
  stripePriceId?: string;
}

export const PLANS: Plan[] = [
  {
    name: "free",
    label: "Free",
    priceMonthly: 0,
    description: "Try one inspection.",
    features: [
      "1 test inspection",
      "Partial risk score",
      "Report preview (no export)",
    ],
  },
  {
    name: "starter",
    label: "Starter",
    priceMonthly: 9.99,
    description: "For occasional buyers.",
    features: [
      "3 inspections / month",
      "3 PDF reports",
      "Standard AI analysis",
    ],
    stripePriceId: process.env.STRIPE_PRICE_STARTER,
  },
  {
    name: "plus",
    label: "Plus",
    priceMonthly: 19.99,
    description: "For active buyers.",
    features: [
      "10 inspections / month",
      "Unlimited reports within quota",
      "Follow-up photos",
      "Negotiation arguments",
    ],
    stripePriceId: process.env.STRIPE_PRICE_PLUS,
  },
  {
    name: "pro",
    label: "Pro",
    priceMonthly: 49.99,
    description: "For dealers & brokers.",
    features: [
      "High / unlimited inspection quota",
      "Advanced model knowledge",
      "Premium reports",
      "Secure sharing",
    ],
    stripePriceId: process.env.STRIPE_PRICE_PRO,
  },
];

// Pay-per-report packs (alternative to subscription).
export const REPORT_PACKS = [
  { id: "single", label: "1 report", price: 9.99, reports: 1 },
  { id: "pack3", label: "Pack of 3", price: 19.99, reports: 3 },
  { id: "pack10", label: "Pack of 10", price: 49.99, reports: 10 },
];

export function isStripeConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}
