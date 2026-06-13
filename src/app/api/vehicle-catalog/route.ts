import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { fetchModels } from "@/lib/vehicle-catalog";
import { rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

// GET /api/vehicle-catalog?make=Toyota&year=2018 -> { models: string[] }
export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const rl = rateLimit(`catalog:${user.id}`, { limit: 40, windowMs: 60_000 });
  if (!rl.allowed) {
    return NextResponse.json({ error: "Too many requests." }, { status: 429 });
  }

  const { searchParams } = new URL(request.url);
  const make = searchParams.get("make");
  const yearStr = searchParams.get("year");
  if (!make) return NextResponse.json({ error: "make is required." }, { status: 400 });

  const models = await fetchModels(make, yearStr ? Number(yearStr) : undefined);
  return NextResponse.json({ models });
}
