// =====================================================================
// CarGuard AI — Plan & quota enforcement (spec §37)
// Reads the user's plan from subscriptions and the matching usage_limits,
// then checks monthly usage. Free plan applies when no subscription row.
// =====================================================================

import type { SupabaseClient } from "@supabase/supabase-js";
import type { PlanName } from "@/types";

export interface PlanLimits {
  plan: PlanName;
  inspections_per_month: number | null;
  reports_per_month: number | null;
  pdf_exports_limit: number | null;
}

export interface QuotaCheck {
  allowed: boolean;
  used: number;
  limit: number | null;
  plan: PlanName;
}

function startOfMonthISO(): string {
  const d = new Date();
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

// Quotas are OFF during development. Set ENFORCE_QUOTAS=true before launch
// to re-enable plan limits on inspections and reports.
export function quotasEnforced(): boolean {
  return process.env.ENFORCE_QUOTAS === "true";
}

export async function getPlanLimits(
  supabase: SupabaseClient,
  userId: string,
): Promise<PlanLimits> {
  const { data: sub } = await supabase
    .from("subscriptions")
    .select("plan_name, status")
    .eq("user_id", userId)
    .maybeSingle();

  const plan: PlanName =
    sub && ["active", "trialing"].includes(sub.status)
      ? (sub.plan_name as PlanName)
      : "free";

  const { data: limits } = await supabase
    .from("usage_limits")
    .select("*")
    .eq("plan_name", plan)
    .maybeSingle();

  return {
    plan,
    inspections_per_month: limits?.inspections_per_month ?? null,
    reports_per_month: limits?.reports_per_month ?? null,
    pdf_exports_limit: limits?.pdf_exports_limit ?? null,
  };
}

export async function checkInspectionQuota(
  supabase: SupabaseClient,
  userId: string,
): Promise<QuotaCheck> {
  if (!quotasEnforced()) return { allowed: true, used: 0, limit: null, plan: "free" };
  const limits = await getPlanLimits(supabase, userId);
  const limit = limits.inspections_per_month;
  if (limit == null) return { allowed: true, used: 0, limit, plan: limits.plan };

  const { count } = await supabase
    .from("inspection_sessions")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .gte("created_at", startOfMonthISO());

  const used = count ?? 0;
  return { allowed: used < limit, used, limit, plan: limits.plan };
}

export async function checkReportQuota(
  supabase: SupabaseClient,
  userId: string,
): Promise<QuotaCheck> {
  if (!quotasEnforced()) return { allowed: true, used: 0, limit: null, plan: "free" };
  const limits = await getPlanLimits(supabase, userId);
  const limit = limits.reports_per_month;
  if (limit == null) return { allowed: true, used: 0, limit, plan: limits.plan };

  const { count } = await supabase
    .from("inspection_reports")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .gte("created_at", startOfMonthISO());

  const used = count ?? 0;
  return { allowed: used < limit, used, limit, plan: limits.plan };
}
