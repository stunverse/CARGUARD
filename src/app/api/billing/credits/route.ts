import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isStripeConfigured } from "@/lib/billing";

export const runtime = "nodejs";

// GET /api/billing/credits — the current user's inspection credit balance.
export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data } = await supabase
    .from("profiles")
    .select("inspection_credits")
    .eq("id", user.id)
    .maybeSingle();

  return NextResponse.json({
    credits: data?.inspection_credits ?? 0,
    stripe: isStripeConfigured(),
  });
}
