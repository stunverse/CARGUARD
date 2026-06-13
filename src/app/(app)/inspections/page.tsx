import Link from "next/link";
import { Car, Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { InspectionCard } from "@/components/inspection-card";
import { EmptyState } from "@/components/empty-state";
import type { InspectionSession, Vehicle } from "@/types";

export const metadata = { title: "Inspections — CarGuard AI" };

export default async function InspectionsListPage() {
  const supabase = await createClient();

  const { data: sessions } = await supabase
    .from("inspection_sessions")
    .select("*, vehicles(*)")
    .order("created_at", { ascending: false });

  const list = (sessions ?? []) as (InspectionSession & { vehicles: Vehicle | null })[];

  return (
    <div className="px-5 py-6">
      <div className="mb-5 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#111827]">Inspections</h1>
        <Button asChild size="sm">
          <Link href="/inspections/new">
            <Plus className="size-4" /> New
          </Link>
        </Button>
      </div>

      {list.length === 0 ? (
        <EmptyState
          icon={Car}
          title="No inspections yet"
          description="Create your first inspection and take 8 guided exterior photos."
          actionLabel="Start an inspection"
          actionHref="/inspections/new"
        />
      ) : (
        <div className="space-y-3">
          {list.map((s) => (
            <InspectionCard key={s.id} session={s} vehicle={s.vehicles} />
          ))}
        </div>
      )}
    </div>
  );
}
