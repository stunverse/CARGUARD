import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { decodeVin, lookupPlate, isLikelyVin } from "@/lib/vehicle-lookup";
import { rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

// GET /api/vehicle-lookup?vin=...  or  ?plate=...&country=GB
// Auth + rate-limited. Returns normalized fields to pre-fill the form.
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
