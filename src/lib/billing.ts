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

// Pay-per-inspection: the buyer buys a pack of inspection credits; each new
// inspection consumes one credit. Three tiers (1 / 2 / 3 inspections).
export const INSPECTION_CURRENCY = (process.env.INSPECTION_CURRENCY || "eur").toLowerCase();

export interface InspectionPack {
  id: string;
  credits: number;
  price: number; // major units (e.g. euros)
}

export const INSPECTION_PACKS: InspectionPack[] = [
  { id: "single", credits: 1, price: Number(process.env.PACK_SINGLE_PRICE || 29) },
  { id: "duo", credits: 2, price: Number(process.env.PACK_DUO_PRICE || 49) },
  { id: "trio", credits: 3, price: Number(process.env.PACK_TRIO_PRICE || 69) },
];

export function packById(id: string | undefined | null): InspectionPack | undefined {
  return INSPECTION_PACKS.find((p) => p.id === id);
}

// Cheapest single-inspection price, shown on the landing.
export const INSPECTION_PRICE = INSPECTION_PACKS[0].price;
export const INSPECTION_PRICE_CENTS = Math.round(INSPECTION_PRICE * 100);

// Pay-per-report price for the paid per-VIN history (VinAudit/NMVTIS).
// Charged one-time via Stripe Checkout; margin over the provider cost.
export const VIN_HISTORY_PRICE_CENTS = Number(
  process.env.VIN_HISTORY_PRICE_CENTS || 1499,
);
export const VIN_HISTORY_CURRENCY = process.env.VIN_HISTORY_CURRENCY || "usd";
