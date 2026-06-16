import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { logActivity } from "@/lib/activity";
import { checkInspectionQuota } from "@/lib/quota";
import { getServerLocale } from "@/lib/i18n-server";
import { localeCurrency } from "@/lib/i18n";

// POST /api/inspections — create a vehicle + draft inspection session.
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Enforce the monthly inspection quota for the user's plan.
  const quota = await checkInspectionQuota(supabase, user.id);
  if (!quota.allowed) {
    return NextResponse.json(
      {
        error: `You have reached your monthly inspection limit (${quota.used}/${quota.limit}) on the ${quota.plan} plan. Upgrade to continue.`,
        code: "quota_exceeded",
      },
      { status: 402 },
    );
  }

  const body = await request.json();
  const { goal, ...vehicleInput } = body ?? {};

  // A draft can be created before make/model are filled in (the wizard
  // saves progress from the first question). Required fields are enforced
  // later, when the analysis is run. make/model are NOT NULL in the DB, so
  // we default to empty strings for an early draft.

  // Coerce numeric fields.
  const num = (v: unknown) =>
    v === "" || v == null ? null : Number(v);

  const { data: vehicle, error: vErr } = await supabase
    .from("vehicles")
    .insert({
      user_id: user.id,
      make: vehicleInput.make || "",
      model: vehicleInput.model || "",
      year: num(vehicleInput.year),
      generation: vehicleInput.generation || null,
      trim: vehicleInput.trim || null,
      engine: vehicleInput.engine || null,
      fuel_type: vehicleInput.fuel_type || null,
      transmission: vehicleInput.transmission || null,
      mileage: num(vehicleInput.mileage),
      asking_price: num(vehicleInput.asking_price),
      currency: vehicleInput.currency || localeCurrency(await getServerLocale()),
      seller_type: vehicleInput.seller_type || "unknown",
      listing_url: vehicleInput.listing_url || null,
      vin: vehicleInput.vin || null,
      country: vehicleInput.country || null,
      city: vehicleInput.city || null,
      notes: vehicleInput.notes || null,
    })
    .select()
    .single();

  if (vErr) return NextResponse.json({ error: vErr.message }, { status: 500 });

  const { data: session, error: sErr } = await supabase
    .from("inspection_sessions")
    .insert({
      user_id: user.id,
      vehicle_id: vehicle.id,
      goal: goal || null,
      status: "waiting_for_photos",
    })
    .select()
    .single();

  if (sErr) return NextResponse.json({ error: sErr.message }, { status: 500 });

  await logActivity(supabase, {
    userId: user.id,
    sessionId: session.id,
    action: "inspection_created",
    description: `${vehicle.year ?? ""} ${vehicle.make} ${vehicle.model}`.trim(),
  });

  return NextResponse.json({ sessionId: session.id });
}
