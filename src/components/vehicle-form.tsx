"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    <form onSubmit={onSubmit} className="space-y-8">
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
