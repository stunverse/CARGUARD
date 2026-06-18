// =====================================================================
// CarGuard AI — RegCheck provider (regcheck.org.uk)
//
// Self-serve, multi-country license-plate lookup. We use its dedicated
// France endpoint (`CheckFrance`) to resolve a French immatriculation (SIV)
// into make / model / year / VIN / fuel. There is no free French source
// (the SIV is regulated; Histovec/SIV have no public API), so this sits
// behind env vars and degrades to `configured: false` when no key is set.
//
// Auth: a `username` query parameter (your RegCheck account login).
// Response: an XML envelope that embeds a JSON blob in <vehicleJson>.
// SERVER ONLY.
// =====================================================================

import type { VehicleLookupResult } from "@/lib/vehicle-lookup";

const REGCHECK_BASE =
  process.env.REGCHECK_API_URL || "https://www.regcheck.org.uk/api/reg.asmx";

export function isRegCheckConfigured(): boolean {
  return Boolean(process.env.REGCHECK_USERNAME);
}

// RegCheck fields come as either a plain string or { CurrentTextValue }.
function field(v: unknown): string | undefined {
  if (v == null) return undefined;
  if (typeof v === "string") {
    const s = v.trim();
    return s || undefined;
  }
  if (typeof v === "object" && "CurrentTextValue" in (v as Record<string, unknown>)) {
    const s = String((v as Record<string, unknown>).CurrentTextValue ?? "").trim();
    return s || undefined;
  }
  return undefined;
}

function normFuel(v?: string): string | undefined {
  if (!v) return undefined;
  const s = v.toLowerCase();
  if (s.includes("diesel") || s.includes("gazole") || s.includes("gasoil")) return "diesel";
  if (s.includes("electric") || s.includes("électri")) return "electric";
  if (s.includes("hybrid")) return "hybrid";
  if (s.includes("lpg") || s.includes("gpl") || s.includes("cng")) return "lpg";
  if (s.includes("petrol") || s.includes("essence") || s.includes("gasoline")) return "gasoline";
  return undefined;
}

// FR gearbox codes (ExtendedData.boiteDeVitesse): "M 6" / "BVM" → manual,
// "A 6" / "BVA" / "DCT" → automatic.
function normTransmission(v?: string): string | undefined {
  if (!v) return undefined;
  const s = v.toLowerCase().trim();
  if (s.startsWith("a") || s.includes("bva") || s.includes("auto") || s.includes("dct") || s.includes("cvt"))
    return "automatic";
  if (s.startsWith("m") || s.includes("bvm") || s.includes("manu")) return "manual";
  return undefined;
}

// Build a human engine descriptor from FR ExtendedData.
// Prefer cylindrée (EngineCC → litres) + cylinders; fall back to the
// commercial version string. NB: top-level EngineSize is the French tax
// horsepower (puissance fiscale), NOT the displacement — don't use it here.
function buildEngine(ext: Record<string, string>): string | undefined {
  const cc = Number(ext.EngineCC);
  const parts: string[] = [];
  if (Number.isFinite(cc) && cc > 0) parts.push(`${(cc / 1000).toFixed(1)}L`);
  const cyl = ext.Cylinders?.trim();
  if (cyl && cyl !== "0") parts.push(`${cyl}cyl`);
  if (parts.length) return parts.join(" ");
  const version = (ext.version || ext.libVersion || "").trim();
  return version || undefined;
}

// Extract the embedded JSON blob from the RegCheck XML envelope.
function extractVehicleJson(xml: string): Record<string, unknown> | null {
  const m = xml.match(/<vehicleJson>([\s\S]*?)<\/vehicleJson>/i);
  if (!m) return null;
  try {
    // RegCheck escapes a few XML entities inside the JSON payload.
    const raw = m[1]
      .replace(/&quot;/g, '"')
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">");
    return JSON.parse(raw) as Record<string, unknown>;
  } catch {
    return null;
  }
}

// France plate lookup. GET /CheckFrance?RegistrationNumber=&username=
export async function regcheckFrancePlate(
  plate: string,
): Promise<VehicleLookupResult | null> {
  const username = process.env.REGCHECK_USERNAME;
  if (!username) return null;
  try {
    const reg = encodeURIComponent(plate.replace(/\s/g, "").toUpperCase());
    const url = `${REGCHECK_BASE}/CheckFrance?RegistrationNumber=${reg}&username=${encodeURIComponent(username)}`;
    const res = await fetch(url, { headers: { Accept: "application/xml,text/xml" } });
    if (!res.ok) return null;
    const xml = await res.text();
    const v = extractVehicleJson(xml);
    if (!v) return null;

    const ext = (v.ExtendedData && typeof v.ExtendedData === "object"
      ? (v.ExtendedData as Record<string, string>)
      : {}) as Record<string, string>;

    const make = field(v.CarMake) ?? field(v.MakeDescription);
    const model = field(v.CarModel) ?? field(v.ModelDescription) ?? (ext.libelleModele || undefined);
    if (!make && !model) return null;

    const yearStr = field(v.RegistrationYear) ?? (ext.anneeSortie || undefined);
    const year = yearStr ? Number(yearStr.replace(/[^\d]/g, "")) : undefined;

    // FR VIN lives in ExtendedData.numSerieMoteur (the SIV serial). Only keep
    // it if it looks like a 17-char VIN so it can feed the EU specs decode.
    const vinRaw = (ext.numSerieMoteur || "").trim().toUpperCase();
    const vin = /^[A-HJ-NPR-Z0-9]{17}$/.test(vinRaw) ? vinRaw : undefined;

    return {
      make: make || undefined,
      model: model || undefined,
      year: year && Number.isFinite(year) ? year : undefined,
      engine: buildEngine(ext),
      fuel_type: normFuel(field(v.FuelType) ?? ext.carburantVersion),
      transmission: normTransmission(ext.boiteDeVitesse),
      vin,
      source: "RegCheck (FR)",
    };
  } catch (err) {
    console.error("RegCheck France plate lookup failed:", err);
    return null;
  }
}
