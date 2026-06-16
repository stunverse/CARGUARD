// =====================================================================
// CarGuard AI — Specifications & equipment (US + EU)
//
// Builds a rich spec/equipment section from the free NHTSA vPIC VIN decode
// (DecodeVinValues) and merges it with the data the buyer entered. Works
// worldwide: a US VIN decodes fully; many EU VINs decode partially; with no
// decodable VIN we still present the provided make/model/year/fuel/box.
// SERVER ONLY.
// =====================================================================

import { isLikelyVin } from "@/lib/vehicle-lookup";
import type { Vehicle, VehicleSpecGroup, VehicleSpecsSection } from "@/types";

// vPIC junk values to ignore.
const JUNK = new Set(["", "not applicable", "not available", "0", "null", "none"]);
function clean(v?: string | null): string | undefined {
  if (v == null) return undefined;
  const s = String(v).trim();
  if (!s || JUNK.has(s.toLowerCase())) return undefined;
  return s;
}

async function decodeFull(vin: string): Promise<Record<string, string> | null> {
  try {
    const res = await fetch(
      `https://vpic.nhtsa.dot.gov/api/vehicles/decodevinvalues/${encodeURIComponent(vin)}?format=json`,
      { headers: { Accept: "application/json" } },
    );
    if (!res.ok) return null;
    const json = (await res.json()) as { Results?: Record<string, string>[] };
    return json.Results?.[0] ?? null;
  } catch (err) {
    console.error("vehicle-specs decode failed:", err);
    return null;
  }
}

export async function buildVehicleSpecs(
  vehicle: Partial<Vehicle>,
  vin?: string | null,
): Promise<VehicleSpecsSection | null> {
  const v = (vin || vehicle.vin || "").trim().toUpperCase();
  let d: Record<string, string> | null = null;
  let vinDecoded = false;
  if (v && isLikelyVin(v)) {
    d = await decodeFull(v);
    vinDecoded = Boolean(d && (clean(d.Make) || clean(d.Model)));
  }

  // Prefer decoded value, fall back to the field the buyer provided.
  const dv = (k: string) => (d ? clean(d[k]) : undefined);
  const yr = vehicle.year ? String(vehicle.year) : undefined;

  const groups: VehicleSpecGroup[] = [];
  const push = (group: VehicleSpecGroup["group"], items: [string, string | undefined][]) => {
    const filtered = items
      .filter(([, value]) => Boolean(value))
      .map(([key, value]) => ({ key, value: value as string }));
    if (filtered.length) groups.push({ group, items: filtered });
  };

  push("identity", [
    ["make", dv("Make") || (vehicle.make ?? undefined)],
    ["model", dv("Model") || (vehicle.model ?? undefined)],
    ["year", dv("ModelYear") || yr],
    ["trim", dv("Trim") || dv("Series") || (vehicle.trim ?? undefined)],
    ["body_class", dv("BodyClass")],
    ["vehicle_type", dv("VehicleType")],
    ["doors", dv("Doors")],
  ]);

  push("engine", [
    ["displacement_l", dv("DisplacementL")],
    ["cylinders", dv("EngineCylinders")],
    ["engine_hp", dv("EngineHP")],
    ["engine_config", dv("EngineConfiguration")],
    ["fuel_type", dv("FuelTypePrimary") || (vehicle.fuel_type ?? undefined)],
    ["engine", vehicle.engine ?? undefined],
  ]);

  push("drivetrain", [
    ["drive_type", dv("DriveType")],
    ["transmission", dv("TransmissionStyle") || (vehicle.transmission ?? undefined)],
    ["transmission_speeds", dv("TransmissionSpeeds")],
  ]);

  push("manufacture", [
    ["manufacturer", dv("Manufacturer")],
    ["plant_country", dv("PlantCountry")],
    ["plant_city", dv("PlantCity")],
  ]);

  push("safety", [
    ["abs", dv("ABS")],
    ["esc", dv("ESC")],
    ["traction_control", dv("TractionControl")],
    ["airbags_front", dv("AirBagLocFront")],
    ["airbags_side", dv("AirBagLocSide")],
    ["airbags_curtain", dv("AirBagLocCurtain")],
    ["airbags_knee", dv("AirBagLocKnee")],
    ["backup_camera", dv("BackupCamera")],
    ["blind_spot", dv("BlindSpotMon")],
    ["forward_collision", dv("ForwardCollisionWarning")],
    ["lane_departure", dv("LaneDepartureWarning")],
    ["tpms", dv("TPMS")],
    ["seat_belts", dv("SeatBeltsAll")],
  ]);

  if (groups.length === 0) return null;

  return {
    source: vinDecoded ? "NHTSA vPIC" : "Provided",
    vin_decoded: vinDecoded,
    groups,
  };
}
