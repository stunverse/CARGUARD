import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isInspectionLocked, lockedResponse } from "@/lib/inspection-lock";
import { createAdminClient } from "@/lib/supabase/admin";
import { purgeSessionStorage } from "@/lib/storage-cleanup";

// PATCH /api/inspections/[id] — update a draft inspection's vehicle details
// and goal as the buyer answers the guided questions. Only the fields that
// are present in the body are updated, so partial progress is saved safely.
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: session } = await supabase
    .from("inspection_sessions")
    .select("id, vehicle_id, user_id")
    .eq("id", id)
    .single();
  if (!session) return NextResponse.json({ error: "Inspection not found." }, { status: 404 });
  if (session.user_id !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  if (await isInspectionLocked(supabase, id)) return lockedResponse();

  const body = await request.json().catch(() => ({}));
  const { goal, ...vehicleInput } = body ?? {};

  const num = (v: unknown) => (v === "" || v == null ? null : Number(v));

  // Build the vehicle patch from provided keys only.
  const textKeys = [
    "make",
    "model",
    "generation",
    "trim",
    "engine",
    "fuel_type",
    "transmission",
    "currency",
    "seller_type",
    "listing_url",
    "vin",
    "country",
    "city",
    "notes",
  ] as const;
  const numKeys = ["year", "mileage", "asking_price"] as const;

  const vehiclePatch: Record<string, unknown> = {};
  for (const k of textKeys) {
    if (k in vehicleInput) {
      // make/model are NOT NULL in the DB — keep empty string, never null.
      vehiclePatch[k] =
        k === "make" || k === "model" ? vehicleInput[k] || "" : vehicleInput[k] || null;
    }
  }
  for (const k of numKeys) {
    if (k in vehicleInput) vehiclePatch[k] = num(vehicleInput[k]);
  }

  if (Object.keys(vehiclePatch).length > 0 && session.vehicle_id) {
    const { error: vErr } = await supabase
      .from("vehicles")
      .update(vehiclePatch)
      .eq("id", session.vehicle_id);
    if (vErr) return NextResponse.json({ error: vErr.message }, { status: 500 });
  }

  if (goal !== undefined) {
    const { error: sErr } = await supabase
      .from("inspection_sessions")
      .update({ goal: goal || null })
      .eq("id", id);
    if (sErr) return NextResponse.json({ error: sErr.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

// DELETE /api/inspections/[id] — remove an inspection and all its media (GDPR).
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // RLS scopes this to the owner's own session.
  const { data: session } = await supabase
    .from("inspection_sessions")
    .select("id, user_id")
    .eq("id", id)
    .single();
  if (!session) return NextResponse.json({ error: "Inspection not found." }, { status: 404 });
  if (session.user_id !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Remove stored media for this inspection (best-effort), then the DB rows
  // (photos/mechanical/documents/reports cascade off the session FK).
  try {
    await purgeSessionStorage(createAdminClient(), user.id, id);
  } catch (e) {
    console.error("inspection storage purge failed:", e);
  }
  const { error } = await supabase.from("inspection_sessions").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
