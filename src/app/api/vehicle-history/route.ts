import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getVehicleHistory } from "@/lib/vehicle-history";
import { rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

// GET /api/vehicle-history?vin=...  or  ?make=&model=&year=
// Free US NHTSA recalls + complaints. Auth + rate-limited.
export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const rl = rateLimit(`history:${user.id}`, { limit: 20, windowMs: 60_000 });
  if (!rl.allowed) {
    return NextResponse.json(
      { error: `Too many lookups. Try again in ${rl.retryAfterSeconds}s.` },
      { status: 429 },
    );
  }

  const { searchParams } = new URL(request.url);
  const vin = searchParams.get("vin");
  const make = searchParams.get("make");
  const model = searchParams.get("model");
  const yearStr = searchParams.get("year");

  const history = await getVehicleHistory({
    vin,
    make,
    model,
    year: yearStr ? Number(yearStr) : null,
  });

  if (!history) {
    return NextResponse.json(
      { error: "Provide a VIN, or make + model + year." },
      { status: 400 },
    );
  }
  return NextResponse.json({ history });
}
