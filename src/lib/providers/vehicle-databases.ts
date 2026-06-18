// =====================================================================
// CarGuard AI — Vehicle Databases provider (vehicledatabases.com)
// Self-serve REST API. Auth via the `x-authkey` header. Used for UK plate
// lookup (and later: market value, EU VIN specs). SERVER ONLY.
// =====================================================================

import type { VehicleLookupResult } from "@/lib/vehicle-lookup";

const VDB_BASE = process.env.VEHICLE_DB_API_URL || "https://api.vehicledatabases.com";

export function isVehicleDbConfigured(): boolean {
  return Boolean(process.env.VEHICLE_DB_API_KEY);
}

function normFuel(v?: string | null): string | undefined {
  if (!v) return undefined;
  const s = v.toLowerCase();
  if (s.includes("diesel")) return "diesel";
  if (s.includes("electric")) return "electric";
  if (s.includes("hybrid")) return "hybrid";
  if (s.includes("lpg") || s.includes("gpl") || s.includes("cng")) return "lpg";
  if (s.includes("petrol") || s.includes("gasoline") || s.includes("essence")) return "gasoline";
  return undefined;
}

function normTransmission(v?: string | null): string | undefined {
  if (!v) return undefined;
  const s = v.toLowerCase();
  if (s.includes("manual")) return "manual";
  if (s.includes("auto") || s.includes("cvt") || s.includes("dct") || s.includes("dual")) return "automatic";
  return undefined;
}

// UK Registration Decode → vehicle details from a UK plate.
// GET /uk-registration-decode/{reg_num}  (header x-authkey)
export async function vdbUkPlate(plate: string): Promise<VehicleLookupResult | null> {
  const key = process.env.VEHICLE_DB_API_KEY;
  if (!key) return null;
  try {
    const reg = encodeURIComponent(plate.replace(/\s/g, "").toUpperCase());
    const res = await fetch(`${VDB_BASE}/uk-registration-decode/${reg}`, {
      headers: { "x-authkey": key, Accept: "application/json" },
    });
    if (!res.ok) return null;
    const json = (await res.json()) as {
      status?: string;
      data?: { vehicle_description?: Record<string, string> };
    };
    if (json?.status !== "success") return null;
    const d = json.data?.vehicle_description ?? {};
    if (!d.make && !d.model) return null;
    return {
      make: d.make || undefined,
      model: d.model || undefined,
      year: d.year ? Number(d.year) : undefined,
      engine: d.engine || undefined,
      fuel_type: normFuel(d.fuel_type),
      transmission: normTransmission(d.gears),
      source: "Vehicle Databases (UK)",
    };
  } catch (err) {
    console.error("Vehicle Databases UK plate lookup failed:", err);
    return null;
  }
}
