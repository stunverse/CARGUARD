// =====================================================================
// CarGuard AI — Vehicle catalog (selectable options for the wizard)
// Covers BOTH markets (US + Europe/France). Makes are a curated popular
// list; models come from a curated map (Europe-friendly) merged with the
// free NHTSA vPIC API (US). Years/mileage/price are ranges.
// =====================================================================

export const POPULAR_MAKES = [
  // Shared / global
  "Audi", "BMW", "Ford", "Honda", "Hyundai", "Jaguar", "Kia", "Land Rover",
  "Lexus", "Mazda", "Mercedes-Benz", "Mini", "Mitsubishi", "Nissan",
  "Porsche", "Subaru", "Suzuki", "Tesla", "Toyota", "Volkswagen", "Volvo",
  "Alfa Romeo", "Fiat",
  // Europe / France
  "Peugeot", "Renault", "Citroën", "DS", "Dacia", "Opel", "Vauxhall",
  "Škoda", "SEAT", "Cupra", "Smart", "Lancia", "Polestar", "MG",
  // US
  "Acura", "Buick", "Cadillac", "Chevrolet", "Chrysler", "Dodge", "GMC",
  "Genesis", "Infiniti", "Jeep", "Lincoln", "Ram",
].sort((a, b) => a.localeCompare(b));

// Curated popular models per make (Europe + global). Keyed by lowercase make.
export const CURATED_MODELS: Record<string, string[]> = {
  peugeot: ["108", "208", "2008", "308", "3008", "5008", "408", "508", "Rifter", "Partner", "Expert", "Traveller", "e-208", "e-2008"],
  renault: ["Twingo", "Clio", "Captur", "Mégane", "Mégane E-Tech", "Scénic", "Kadjar", "Arkana", "Austral", "Espace", "Kangoo", "Trafic", "Zoe", "Talisman"],
  citroën: ["C1", "C3", "C3 Aircross", "C4", "C4 X", "C5 Aircross", "C5 X", "Berlingo", "SpaceTourer", "ë-C4", "Ami"],
  citroen: ["C1", "C3", "C3 Aircross", "C4", "C4 X", "C5 Aircross", "C5 X", "Berlingo", "SpaceTourer", "ë-C4", "Ami"],
  ds: ["DS 3", "DS 4", "DS 7", "DS 9"],
  dacia: ["Sandero", "Sandero Stepway", "Duster", "Jogger", "Spring", "Logan"],
  opel: ["Corsa", "Astra", "Mokka", "Crossland", "Grandland", "Insignia", "Combo", "Zafira", "Corsa-e"],
  vauxhall: ["Corsa", "Astra", "Mokka", "Crossland", "Grandland", "Insignia", "Combo"],
  "škoda": ["Fabia", "Scala", "Octavia", "Superb", "Kamiq", "Karoq", "Kodiaq", "Enyaq"],
  skoda: ["Fabia", "Scala", "Octavia", "Superb", "Kamiq", "Karoq", "Kodiaq", "Enyaq"],
  seat: ["Ibiza", "Leon", "Arona", "Ateca", "Tarraco"],
  cupra: ["Leon", "Formentor", "Born", "Ateca", "Tavascan"],
  volkswagen: ["Up", "Polo", "Golf", "T-Cross", "T-Roc", "Tiguan", "Passat", "Arteon", "Touran", "Touareg", "ID.3", "ID.4", "ID.5", "ID.7", "Caddy", "Transporter"],
  audi: ["A1", "A3", "A4", "A5", "A6", "A7", "A8", "Q2", "Q3", "Q4 e-tron", "Q5", "Q7", "Q8", "e-tron", "TT"],
  bmw: ["1 Series", "2 Series", "3 Series", "4 Series", "5 Series", "7 Series", "X1", "X2", "X3", "X4", "X5", "X6", "i3", "i4", "iX"],
  "mercedes-benz": ["A-Class", "B-Class", "C-Class", "E-Class", "S-Class", "CLA", "GLA", "GLB", "GLC", "GLE", "EQA", "EQB", "EQC", "Vito", "Sprinter"],
  fiat: ["500", "500e", "Panda", "Tipo", "500X", "500L", "Doblo", "Ducato"],
  lancia: ["Ypsilon", "Delta"],
  "alfa romeo": ["Giulietta", "Giulia", "Stelvio", "Tonale", "MiTo"],
  toyota: ["Aygo X", "Yaris", "Yaris Cross", "Corolla", "C-HR", "RAV4", "Camry", "Prius", "Proace", "Hilux", "Land Cruiser"],
  ford: ["Fiesta", "Focus", "Puma", "Kuga", "Mustang Mach-E", "Mondeo", "EcoSport", "Transit", "Transit Custom", "Ranger"],
  nissan: ["Micra", "Juke", "Qashqai", "X-Trail", "Leaf", "Ariya", "Navara"],
  hyundai: ["i10", "i20", "i30", "Bayon", "Kona", "Tucson", "Santa Fe", "Ioniq 5", "Ioniq 6"],
  kia: ["Picanto", "Rio", "Ceed", "Stonic", "XCeed", "Niro", "Sportage", "Sorento", "EV6", "EV9"],
  volvo: ["XC40", "XC60", "XC90", "S60", "S90", "V60", "V90", "EX30", "C40"],
  mini: ["Cooper", "Cooper SE", "Clubman", "Countryman"],
  smart: ["ForTwo", "ForFour", "#1", "#3"],
  suzuki: ["Swift", "Ignis", "Vitara", "S-Cross", "Jimny"],
  mazda: ["Mazda2", "Mazda3", "CX-30", "CX-5", "CX-60", "MX-30", "MX-5"],
  honda: ["Jazz", "Civic", "HR-V", "CR-V", "e:Ny1"],
  tesla: ["Model 3", "Model Y", "Model S", "Model X"],
  polestar: ["Polestar 2", "Polestar 3", "Polestar 4"],
  mg: ["MG3", "MG4", "MG5", "ZS", "HS", "Marvel R"],
  "land rover": ["Defender", "Discovery", "Discovery Sport", "Range Rover", "Range Rover Sport", "Range Rover Evoque", "Range Rover Velar"],
  jaguar: ["XE", "XF", "E-Pace", "F-Pace", "I-Pace", "F-Type"],
  porsche: ["911", "718 Cayman", "718 Boxster", "Panamera", "Macan", "Cayenne", "Taycan"],
  mitsubishi: ["Space Star", "ASX", "Eclipse Cross", "Outlander"],
};

export function catalogYears(): number[] {
  const now = new Date().getFullYear() + 1;
  const years: number[] = [];
  for (let y = now; y >= 1995; y--) years.push(y);
  return years;
}

export const MILEAGE_BRACKETS: { label: string; value: number }[] = [
  { label: "Under 30,000 mi / 50,000 km", value: 20000 },
  { label: "30,000–60,000 mi / 50–100k km", value: 45000 },
  { label: "60,000–100,000 mi / 100–160k km", value: 80000 },
  { label: "100,000–150,000 mi / 160–240k km", value: 125000 },
  { label: "Over 150,000 mi / 240,000 km", value: 175000 },
];

export const PRICE_BRACKETS: { label: string; value: number }[] = [
  { label: "Under 5,000", value: 4000 },
  { label: "5,000 – 10,000", value: 7500 },
  { label: "10,000 – 20,000", value: 15000 },
  { label: "20,000 – 35,000", value: 27500 },
  { label: "35,000 – 50,000", value: 42500 },
  { label: "Over 50,000", value: 60000 },
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

async function fetchNhtsaModels(make: string, year?: number): Promise<string[]> {
  const base = "https://vpic.nhtsa.dot.gov/api/vehicles";
  const url = year
    ? `${base}/GetModelsForMakeYear/make/${encodeURIComponent(make)}/modelyear/${year}?format=json`
    : `${base}/GetModelsForMake/${encodeURIComponent(make)}?format=json`;
  try {
    const res = await fetch(url, { headers: { Accept: "application/json" } });
    if (!res.ok) return [];
    const json = (await res.json()) as { Results?: { Model_Name?: string }[] };
    const out: string[] = [];
    for (const r of json.Results ?? []) if (r.Model_Name) out.push(r.Model_Name);
    return out;
  } catch (err) {
    console.error("fetchNhtsaModels failed:", err);
    return [];
  }
}

// Merge curated (Europe-friendly) models with NHTSA (US), de-duplicated.
export async function fetchModels(make: string, year?: number): Promise<string[]> {
  const curated = CURATED_MODELS[make.toLowerCase()] ?? [];
  const nhtsa = await fetchNhtsaModels(make, year);
  const seen = new Set<string>();
  const merged: string[] = [];
  for (const m of [...curated, ...nhtsa]) {
    const key = m.trim().toLowerCase();
    if (key && !seen.has(key)) {
      seen.add(key);
      merged.push(m.trim());
    }
  }
  return merged.sort((a, b) => a.localeCompare(b));
}
