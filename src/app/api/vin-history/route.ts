import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { fetchVinAuditReport, isVinAuditConfigured } from "@/lib/vinaudit";
import { VIN_HISTORY_CURRENCY, VIN_HISTORY_PRICE_CENTS, isStripeConfigured } from "@/lib/billing";

export const runtime = "nodejs";

// GET /api/vin-history?vin=... — returns the owned report, or purchase info.
export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const vin = (new URL(request.url).searchParams.get("vin") ?? "").trim().toUpperCase();
  if (!vin) return NextResponse.json({ error: "vin is required." }, { status: 400 });

  const available = isStripeConfigured() && isVinAuditConfigured();

  // Entitlement check (RLS-scoped to this user).
  const { data: purchase } = await supabase
    .from("vin_report_purchases")
    .select("status")
    .eq("user_id", user.id)
    .eq("vin", vin)
    .eq("status", "paid")
    .maybeSingle();

  if (!purchase) {
    return NextResponse.json({
      owned: false,
      available,
      price_cents: VIN_HISTORY_PRICE_CENTS,
      currency: VIN_HISTORY_CURRENCY,
    });
  }

  // Owned → read the cached provider data via the service role.
  const admin = createAdminClient();
  const { data: cached } = await admin
    .from("vin_reports")
    .select("data")
    .eq("vin", vin)
    .maybeSingle();

  if (cached?.data) {
    return NextResponse.json({ owned: true, available, report: cached.data });
  }

  // Cache miss (e.g. the webhook fetch failed) — fetch lazily and store.
  try {
    const report = await fetchVinAuditReport(vin);
    await admin.from("vin_reports").upsert(
      { vin, provider: "vinaudit", data: report, fetched_at: new Date().toISOString() },
      { onConflict: "vin" },
    );
    return NextResponse.json({ owned: true, available, report });
  } catch (err) {
    console.error("Lazy VinAudit fetch failed:", err);
    return NextResponse.json({
      owned: true,
      available,
      report: null,
      error: "The report could not be retrieved yet. Please try again shortly.",
    });
  }
}
