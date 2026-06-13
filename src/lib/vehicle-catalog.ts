// =====================================================================
// CarGuard AI — Vehicle catalog (selectable options for the wizard)
// Makes are a curated popular list; models are fetched live from the
// free NHTSA vPIC API by make + year. Years/mileage/price are ranges.
// =====================================================================

export const POPULAR_MAKES = [
  "Acura", "Alfa Romeo", "Audi", "BMW", "Buick", "Cadillac", "Chevrolet",
  "Chrysler", "Dodge", "Fiat", "Ford", "Genesis", "GMC", "Honda", "Hyundai",
  "Infiniti", "Jaguar", "Jeep", "Kia", "Land Rover", "Lexus", "Lincoln",
  "Mazda", "Mercedes-Benz", "Mini", "Mitsubishi", "Nissan", "Porsche", "Ram",
  "Subaru", "Tesla", "Toyota", "Volkswagen", "Volvo",
];

export function catalogYears(): number[] {
  const now = new Date().getFullYear() + 1;
  const years: number[] = [];
  for (let y = now; y >= 1995; y--) years.push(y);
  return years;
}

// Stored value is a representative number so downstream scoring/report work.
export const MILEAGE_BRACKETS: { label: string; value: number }[] = [
  { label: "Under 30,000 mi", value: 20000 },
  { label: "30,000 – 60,000 mi", value: 45000 },
  { label: "60,000 – 100,000 mi", value: 80000 },
  { label: "100,000 – 150,000 mi", value: 125000 },
  { label: "Over 150,000 mi", value: 175000 },
];

export const PRICE_BRACKETS: { label: string; value: number }[] = [
  { label: "Under $5,000", value: 4000 },
  { label: "$5,000 – $10,000", value: 7500 },
  { label: "$10,000 – $20,000", value: 15000 },
  { label: "$20,000 – $35,000", value: 27500 },
  { label: "$35,000 – $50,000", value: 42500 },
  { label: "Over $50,000", value: 60000 },
];

export const FUEL_OPTIONS = [
  { value: "gasoline", label: "Gasoline / petrol" },
  { value: "diesel", label: "Diesel" },
  { value: "hybrid", label: "Hybrid" },
  { value: "electric", label: "Electric" },
  { value: "lpg", label: "LPG / other" },
];

export const TRANSMISSION_OPTIONS = [
  { value: "automatic", label: "Automatic" },
  { value: "manual", label: "Manual" },
];

// Fetch models for a make (+ optional year) from NHTSA vPIC (free, no key).
export async function fetchModels(make: string, year?: number): Promise<string[]> {
  const base = "https://vpic.nhtsa.dot.gov/api/vehicles";
  const url = year
    ? `${base}/GetModelsForMakeYear/make/${encodeURIComponent(make)}/modelyear/${year}?format=json`
    : `${base}/GetModelsForMake/${encodeURIComponent(make)}?format=json`;
  try {
    const res = await fetch(url, { headers: { Accept: "application/json" } });
    if (!res.ok) return [];
    const json = (await res.json()) as { Results?: { Model_Name?: string }[] };
    const set = new Set<string>();
    for (const r of json.Results ?? []) if (r.Model_Name) set.add(r.Model_Name);
    return [...set].sort((a, b) => a.localeCompare(b));
  } catch (err) {
    console.error("fetchModels failed:", err);
    return [];
  }
}
