"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  INSPECTION_GOAL_OPTIONS,
  SELLER_TYPE_OPTIONS,
} from "@/lib/constants";

export function VehicleForm() {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // --- Auto-fill from VIN / plate -------------------------------------
  const [lookupValue, setLookupValue] = useState("");
  const [lookupCountry, setLookupCountry] = useState("");
  const [looking, setLooking] = useState(false);
  const [lookupMsg, setLookupMsg] = useState<{ kind: "ok" | "info" | "error"; text: string } | null>(null);

  function setField(name: string, value: string | number | undefined) {
    if (value == null || value === "") return;
    const el = formRef.current?.elements.namedItem(name) as
      | HTMLInputElement
      | HTMLSelectElement
      | null;
    if (el) el.value = String(value);
  }

  async function runLookup() {
    if (!lookupValue.trim()) return;
    setLooking(true);
    setLookupMsg(null);
    try {
      const params = new URLSearchParams({ q: lookupValue.trim() });
      if (lookupCountry) params.set("country", lookupCountry);
      const res = await fetch(`/api/vehicle-lookup?${params.toString()}`);
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setLookupMsg({ kind: data.configured === false ? "info" : "error", text: data.message ?? data.error ?? "No result." });
        return;
      }
      const d = data.data;
      setField("make", d.make);
      setField("model", d.model);
      setField("year", d.year);
      setField("trim", d.trim);
      setField("engine", d.engine);
      setField("fuel_type", d.fuel_type);
      setField("transmission", d.transmission);
      setField("vin", d.vin);
      setLookupMsg({ kind: "ok", text: `Pre-filled from ${d.source}. Please review and complete the fields.` });
    } catch {
      setLookupMsg({ kind: "error", text: "Lookup failed. Fill the fields manually." });
    } finally {
      setLooking(false);
    }
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const fd = new FormData(e.currentTarget);
    const payload = Object.fromEntries(fd.entries());

    const res = await fetch("/api/inspections", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Something went wrong.");
      setLoading(false);
      return;
    }
    router.push(`/inspections/${data.sessionId}/photos`);
  }

  return (
    <form ref={formRef} onSubmit={onSubmit} className="space-y-8">
      {/* Auto-fill */}
      <section className="rounded-lg border border-accent/30 bg-accent/5 p-4">
        <div className="mb-2 flex items-center gap-2 text-sm font-semibold">
          <Sparkles className="size-4 text-accent" /> Auto-fill from VIN or plate
        </div>
        <p className="mb-3 text-xs text-muted-foreground">
          Enter the 17-character VIN to auto-fill the vehicle details. Plate
          lookup is available in supported countries. You can always edit the
          fields afterwards.
        </p>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Input
            placeholder="VIN or license plate"
            value={lookupValue}
            onChange={(e) => setLookupValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                runLookup();
              }
            }}
          />
          <Select
            aria-label="Country (for plate)"
            className="sm:w-40"
            value={lookupCountry}
            onChange={(e) => setLookupCountry(e.target.value)}
          >
            <option value="">Country (plate)</option>
            <option value="GB">United Kingdom</option>
            <option value="FR">France</option>
            <option value="US">United States</option>
            <option value="DE">Germany</option>
          </Select>
          <Button type="button" variant="accent" onClick={runLookup} disabled={looking}>
            {looking ? "Looking…" : "Auto-fill"}
          </Button>
        </div>
        {lookupMsg && (
          <p
            className={
              "mt-2 text-xs " +
              (lookupMsg.kind === "ok"
                ? "text-risk-low"
                : lookupMsg.kind === "info"
                  ? "text-muted-foreground"
                  : "text-destructive")
            }
          >
            {lookupMsg.text}
          </p>
        )}
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Vehicle information</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field name="make" label="Make" required />
          <Field name="model" label="Model" required />
          <Field name="year" label="Year" type="number" />
          <Field name="generation" label="Generation" />
          <Field name="trim" label="Trim" />
          <Field name="engine" label="Engine" />
          <div className="space-y-2">
            <Label htmlFor="fuel_type">Fuel type</Label>
            <Select id="fuel_type" name="fuel_type" defaultValue="">
              <option value="">—</option>
              <option value="gasoline">Gasoline</option>
              <option value="diesel">Diesel</option>
              <option value="hybrid">Hybrid</option>
              <option value="electric">Electric</option>
              <option value="lpg">LPG</option>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="transmission">Transmission</Label>
            <Select id="transmission" name="transmission" defaultValue="">
              <option value="">—</option>
              <option value="manual">Manual</option>
              <option value="automatic">Automatic</option>
            </Select>
          </div>
          <Field name="mileage" label="Mileage" type="number" />
          <Field name="asking_price" label="Asking price" type="number" />
          <div className="space-y-2">
            <Label htmlFor="currency">Currency</Label>
            <Select id="currency" name="currency" defaultValue="USD">
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="GBP">GBP</option>
              <option value="CAD">CAD</option>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="seller_type">Seller type</Label>
            <Select id="seller_type" name="seller_type" defaultValue="unknown">
              {SELLER_TYPE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </Select>
          </div>
          <Field name="vin" label="VIN (optional)" />
          <Field name="country" label="Country" />
          <Field name="city" label="City (optional)" />
        </div>
        <Field name="listing_url" label="Listing URL (optional)" />
        <div className="space-y-2">
          <Label htmlFor="notes">Notes (optional)</Label>
          <Textarea id="notes" name="notes" rows={3} />
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">What do you want to check?</h2>
        <div className="space-y-2">
          {INSPECTION_GOAL_OPTIONS.map((o, i) => (
            <label
              key={o.value}
              className="flex cursor-pointer items-center gap-3 rounded-md border p-3 text-sm hover:bg-secondary"
            >
              <input
                type="radio"
                name="goal"
                value={o.value}
                defaultChecked={i === 0}
              />
              {o.label}
            </label>
          ))}
        </div>
      </section>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Button type="submit" size="lg" disabled={loading}>
        {loading ? "Creating…" : "Continue to photos"}
      </Button>
    </form>
  );
}

function Field({
  name,
  label,
  type = "text",
  required = false,
}: {
  name: string;
  label: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={name}>
        {label}
        {required && <span className="text-destructive"> *</span>}
      </Label>
      <Input id={name} name={name} type={type} required={required} />
    </div>
  );
}
