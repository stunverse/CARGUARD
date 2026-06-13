// =====================================================================
// CarGuard AI — Vehicle lookup (auto-fill the inspection form)
//
//  * VIN decode  → NHTSA vPIC (free, no key, works worldwide-ish for
//    VIN-standard vehicles). Primary path.
//  * Plate lookup → region-specific and usually PAID/regulated. Modelled
//    as a provider interface with a concrete UK (DVLA) adapter; other
//    countries return `configured: false` until a provider key is added.
//
// SERVER ONLY.
// =====================================================================

export interface VehicleLookupResult {
  make?: string;
  model?: string;
  year?: number;
  trim?: string;
  engine?: string;
  fuel_type?: string;
  transmission?: string;
  vin?: string;
  source: string;
}

export interface LookupResponse {
  ok: boolean;
  configured: boolean;
  data?: VehicleLookupResult;
  message?: string;
}

const FUEL_MAP: [RegExp, string][] = [
  [/diesel/i, "diesel"],
  [/electric/i, "electric"],
  [/hybrid|ffv|flex/i, "hybrid"],
  [/lpg|propane|cng|natural gas/i, "lpg"],
  [/gas|petrol/i, "gasoline"],
];

function normalizeFuel(v?: string | null): string | undefined {
  if (!v) return undefined;
  for (const [re, val] of FUEL_MAP) if (re.test(v)) return val;
  return undefined;
}

function normalizeTransmission(v?: string | null): string | undefined {
  if (!v) return undefined;
  if (/manual/i.test(v)) return "manual";
  if (/auto|cvt|dual|dct/i.test(v)) return "automatic";
  return undefined;
}

function isLikelyVin(value: string): boolean {
  // VIN = 17 chars, no I/O/Q.
  return /^[A-HJ-NPR-Z0-9]{17}$/i.test(value.trim());
}

// ---------------------------------------------------------------------
// VIN decode via NHTSA vPIC (free).
// ---------------------------------------------------------------------
export async function decodeVin(vin: string): Promise<LookupResponse> {
  const clean = vin.trim().toUpperCase();
  if (!isLikelyVin(clean)) {
    return { ok: false, configured: true, message: "That doesn't look like a valid 17-character VIN." };
  }
  try {
    const res = await fetch(
      `https://vpic.nhtsa.dot.gov/api/vehicles/decodevinvalues/${encodeURIComponent(clean)}?format=json`,
      { headers: { Accept: "application/json" } },
    );
    if (!res.ok) throw new Error(`vPIC ${res.status}`);
    const json = (await res.json()) as { Results?: Record<string, string>[] };
    const r = json.Results?.[0];
    if (!r || (!r.Make && !r.Model)) {
      return { ok: false, configured: true, message: "No vehicle data found for this VIN." };
    }
    const titleCase = (s?: string) =>
      s ? s.replace(/\w\S*/g, (t) => t[0].toUpperCase() + t.slice(1).toLowerCase()) : undefined;

    const data: VehicleLookupResult = {
      make: titleCase(r.Make) || undefined,
      model: r.Model || undefined,
      year: r.ModelYear ? Number(r.ModelYear) : undefined,
      trim: r.Trim || r.Series || undefined,
      engine: r.DisplacementL ? `${r.DisplacementL}L${r.EngineCylinders ? ` ${r.EngineCylinders}cyl` : ""}` : undefined,
      fuel_type: normalizeFuel(r.FuelTypePrimary),
      transmission: normalizeTransmission(r.TransmissionStyle),
      vin: clean,
      source: "NHTSA vPIC",
    };
    return { ok: true, configured: true, data };
  } catch (err) {
    console.error("decodeVin failed:", err);
    return { ok: false, configured: true, message: "VIN lookup service is temporarily unavailable." };
  }
}

// ---------------------------------------------------------------------
// Plate lookup — provider dispatch by country.
// ---------------------------------------------------------------------
export async function lookupPlate(
  plate: string,
  country: string | undefined,
): Promise<LookupResponse> {
  const cc = (country || "").trim().toUpperCase();

  // UK — DVLA Vehicle Enquiry Service (real adapter, needs DVLA_API_KEY).
  if (cc === "GB" || cc === "UK" || cc === "UNITED KINGDOM") {
    return lookupPlateDvla(plate);
  }

  // TODO: add regional providers (FR/SIV, DE, ES, IT…). These are paid and
  // require a contract; wire them here behind PLATE_LOOKUP_* env vars.
  return {
    ok: false,
    configured: false,
    message:
      "Plate lookup isn't configured for this country yet. Enter the VIN to auto-fill, or fill the fields manually.",
  };
}

async function lookupPlateDvla(plate: string): Promise<LookupResponse> {
  const key = process.env.DVLA_API_KEY;
  if (!key) {
    return {
      ok: false,
      configured: false,
      message: "UK plate lookup needs a DVLA_API_KEY. Use the VIN for now.",
    };
  }
  try {
    const res = await fetch(
      "https://driver-vehicle-licensing.api.gov.uk/vehicle-enquiry/v1/vehicles",
      {
        method: "POST",
        headers: { "x-api-key": key, "Content-Type": "application/json" },
        body: JSON.stringify({ registrationNumber: plate.replace(/\s/g, "").toUpperCase() }),
      },
    );
    if (!res.ok) {
      return { ok: false, configured: true, message: "No vehicle found for that plate." };
    }
    const v = (await res.json()) as {
      make?: string;
      yearOfManufacture?: number;
      fuelType?: string;
    };
    // DVLA returns make/year/fuel but not model.
    return {
      ok: true,
      configured: true,
      data: {
        make: v.make,
        year: v.yearOfManufacture,
        fuel_type: normalizeFuel(v.fuelType),
        source: "DVLA",
      },
    };
  } catch (err) {
    console.error("DVLA lookup failed:", err);
    return { ok: false, configured: true, message: "UK plate lookup is temporarily unavailable." };
  }
}

export { isLikelyVin };
