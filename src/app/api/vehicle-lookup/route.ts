import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { decodeVin, lookupPlate, isLikelyVin } from "@/lib/vehicle-lookup";
import { isStripeConfigured } from "@/lib/billing";
import { rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

// GET /api/vehicle-lookup?vin=...&sessionId=...  or  ?plate=...&country=GB&sessionId=...
// Auth + rate-limited. The plate/VIN lookup is BILLABLE (aggregators charge
// per call), so it is gated to a PAID inspection: a valid sessionId owned by
// the user whose payment_status is "paid". Returns normalized fields to
// pre-fill the form.
export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const rl = rateLimit(`lookup:${user.id}`, { limit: 20, windowMs: 60_000 });
  if (!rl.allowed) {
    return NextResponse.json(
      { error: `Too many lookups. Try again in ${rl.retryAfterSeconds}s.` },
      { status: 429 },
    );
  }

  // Gate on a paid inspection so unpaid users can't trigger billable lookups.
  const sessionId = new URL(request.url).searchParams.get("sessionId")?.trim();
  if (!sessionId) {
    return NextResponse.json({ error: "A paid inspection is required." }, { status: 402 });
  }
  const { data: session } = await supabase
    .from("inspection_sessions")
    .select("id, user_id, payment_status")
    .eq("id", sessionId)
    .single();
  if (!session || session.user_id !== user.id) {
    return NextResponse.json({ error: "Inspection not found." }, { status: 404 });
  }
  if (isStripeConfigured() && session.payment_status !== "paid") {
    return NextResponse.json(
      { error: "This inspection isn't paid yet.", code: "payment_required" },
      { status: 402 },
    );
  }

  const { searchParams } = new URL(request.url);
  const vin = searchParams.get("vin")?.trim();
  const plate = searchParams.get("plate")?.trim();
  const country = searchParams.get("country")?.trim() || undefined;
  const query = searchParams.get("q")?.trim();

  // Smart single-field: decide VIN vs plate from the value.
  if (query) {
    return NextResponse.json(
      isLikelyVin(query) ? await decodeVin(query) : await lookupPlate(query, country),
    );
  }
  if (vin) return NextResponse.json(await decodeVin(vin));
  if (plate) return NextResponse.json(await lookupPlate(plate, country));

  return NextResponse.json({ error: "Provide vin, plate or q." }, { status: 400 });
}
