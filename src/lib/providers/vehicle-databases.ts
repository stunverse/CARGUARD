// =====================================================================
// CarGuard AI — Vehicle Databases provider (vehicledatabases.com)
// Self-serve REST API. Auth via the `x-authkey` header. Used for UK plate
// lookup (and later: market value, EU VIN specs). SERVER ONLY.
// =====================================================================

import type { VehicleLookupResult } from "@/lib/vehicle-lookup";
import type {
  MarketValueSection,
  MarketValueVerdict,
  Vehicle,
  VehicleSpecGroup,
  VehicleSpecsSection,
} from "@/types";

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

function money(s?: string | null): number | null {
  if (!s) return null;
  const n = Number(String(s).replace(/[^\d.]/g, ""));
  return Number.isFinite(n) && n > 0 ? Math.round(n) : null;
}

// Market Value (US, KBB-style). GET /market-value/v2/{vin}?mileage=&state=
// Uses the "Private Party" band (Average → Clean) as the fair range and
// compares the asking price to it. Returns USD. Null for non-US / no data.
export async function vdbMarketValue(input: {
  vin: string;
  mileage?: number | null;
  askingPrice?: number | null;
}): Promise<MarketValueSection | null> {
  const key = process.env.VEHICLE_DB_API_KEY;
  if (!key) return null;
  try {
    const q = input.mileage ? `?mileage=${encodeURIComponent(input.mileage)}` : "";
    const res = await fetch(
      `${VDB_BASE}/market-value/v2/${encodeURIComponent(input.vin)}${q}`,
      { headers: { "x-authkey": key, Accept: "application/json" } },
    );
    if (!res.ok) return null;
    const json = (await res.json()) as {
      status?: string;
      data?: {
        market_value?: { market_value_data?: Array<{ "market value"?: Array<Record<string, string>> }> };
      };
    };
    if (json?.status !== "success") return null;
    const rows = json.data?.market_value?.market_value_data?.[0]?.["market value"] ?? [];
    if (!Array.isArray(rows) || rows.length === 0) return null;

    const pp: Record<string, number> = {};
    for (const r of rows) {
      const cond = String(r.Condition ?? "").toLowerCase();
      const v = money(r["Private Party"]);
      if (v != null) pp[cond] = v;
    }
    const vals = Object.values(pp);
    if (vals.length === 0) return null;

    const lowRaw = pp["average"] ?? Math.min(...vals);
    const highRaw = pp["clean"] ?? pp["outstanding"] ?? Math.max(...vals);
    const low = Math.min(lowRaw, highRaw);
    const high = Math.max(lowRaw, highRaw);

    const asking = input.askingPrice && input.askingPrice > 0 ? input.askingPrice : null;
    let verdict: MarketValueVerdict = "unknown";
    if (asking != null) {
      if (asking > high) verdict = "overpriced";
      else if (asking < low) verdict = "underpriced";
      else verdict = "fair";
    }

    return {
      currency: "USD",
      asking_price: asking,
      estimated_low: low,
      estimated_high: high,
      verdict,
      expected_mileage: null,
      actual_mileage: input.mileage ?? null,
      unit: "mi",
      source: "Vehicle Databases",
      disclaimer: "",
    };
  } catch (err) {
    console.error("Vehicle Databases market value failed:", err);
    return null;
  }
}

// Europe VIN Decode (V2). GET /europe-vin-decode/v2/{vin}  (header x-authkey)
// Builds a specifications section for EU-market vehicles (where free NHTSA
// vPIC is weak). Returns null on failure / no data.
export async function vdbEuropeSpecs(
  vin: string,
  vehicle: Partial<Vehicle>,
): Promise<VehicleSpecsSection | null> {
  const key = process.env.VEHICLE_DB_API_KEY;
  if (!key) return null;
  try {
    const res = await fetch(
      `${VDB_BASE}/europe-vin-decode/v2/${encodeURIComponent(vin)}`,
      { headers: { "x-authkey": key, Accept: "application/json" } },
    );
    if (!res.ok) return null;
    const json = (await res.json()) as { status?: string; data?: Record<string, Record<string, string>> };
    if (json?.status !== "success" || !json.data) return null;

    const gi = json.data["General Information"] ?? {};
    const mf = json.data["Manufacturer"] ?? {};
    const sp = json.data["Vehicle Specification"] ?? {};
    const clean = (v?: string) => {
      const s = (v ?? "").toString().trim();
      return s && s.toLowerCase() !== "n/a" ? s : undefined;
    };

    const groups: VehicleSpecGroup[] = [];
    const push = (group: VehicleSpecGroup["group"], items: [string, string | undefined][]) => {
      const f = items.filter(([, v]) => Boolean(v)).map(([k, v]) => ({ key: k, value: v as string }));
      if (f.length) groups.push({ group, items: f });
    };

    push("identity", [
      ["make", clean(gi.Make) ?? (vehicle.make ?? undefined)],
      ["model", clean(gi.Model) ?? (vehicle.model ?? undefined)],
      ["year", vehicle.year ? String(vehicle.year) : undefined],
      ["trim", clean(gi["Trim level"]) ?? (vehicle.trim ?? undefined)],
      ["body_class", clean(sp["Body type"]) ?? clean(gi["Body style"])],
      ["vehicle_type", clean(gi["Vehicle type"]) ?? clean(gi["Vehicle class"])],
      ["doors", clean(sp["Number of doors"])],
    ]);
    push("engine", [
      ["displacement_l", clean(sp["Displacement nominal"])],
      ["cylinders", clean(sp["Engine cylinders"])],
      ["engine_hp", clean(sp["Engine horsepower"])],
      ["engine_config", clean(gi["Engine type"])],
      ["fuel_type", clean(gi["Fuel type"]) ?? (vehicle.fuel_type ?? undefined)],
    ]);
    push("drivetrain", [
      ["drive_type", clean(sp.Driveline)],
      ["transmission", clean(gi.Transmission) ?? (vehicle.transmission ?? undefined)],
    ]);
    push("manufacture", [
      ["manufacturer", clean(mf.Manufacturer)],
      ["plant_country", clean(mf.Country) ?? clean(gi["Manufactured in"])],
      ["plant_city", clean(mf.City)],
    ]);
    push("safety", [["abs", clean(sp["Anti-lock braking system"])]]);

    if (groups.length === 0) return null;
    return { source: "Vehicle Databases (EU)", vin_decoded: true, groups };
  } catch (err) {
    console.error("Vehicle Databases EU VIN decode failed:", err);
    return null;
  }
}
