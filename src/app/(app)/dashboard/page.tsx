import Link from "next/link";
import { AlertTriangle, Car, FileText, Plus, Clock } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InspectionCard } from "@/components/inspection-card";
import { EmptyState } from "@/components/empty-state";
import type { InspectionSession, Vehicle } from "@/types";

export const metadata = { title: "Dashboard — CarGuard AI" };

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: sessions } = await supabase
    .from("inspection_sessions")
    .select("*")
    .order("created_at", { ascending: false });

  const { data: vehicles } = await supabase.from("vehicles").select("*");
  const vehicleById = new Map(
    (vehicles ?? []).map((v: Vehicle) => [v.id, v]),
  );

  const list = (sessions ?? []) as InspectionSession[];
  const reportsCount = list.filter((s) => s.status === "report_generated").length;
  const pendingCount = list.filter((s) =>
    ["draft", "waiting_for_photos", "photos_uploaded", "ready_for_analysis"].includes(s.status),
  ).length;
  const highRiskCount = list.filter((s) =>
    ["high", "very_high"].includes(s.risk_level ?? ""),
  ).length;

  const stats = [
    { label: "Inspections", value: list.length, icon: Car },
    { label: "Reports", value: reportsCount, icon: FileText },
    { label: "Pending", value: pendingCount, icon: Clock },
    { label: "High risk", value: highRiskCount, icon: AlertTriangle },
  ];

  return (
    <div className="container max-w-5xl py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            Welcome{user?.email ? `, ${user.email.split("@")[0]}` : ""}
          </h1>
          <p className="text-muted-foreground">Your vehicle inspections</p>
        </div>
        <Button asChild>
          <Link href="/inspections/new">
            <Plus className="size-4" /> New inspection
          </Link>
        </Button>
      </div>

      <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardContent className="flex items-center gap-3 p-4">
              <div className="inline-flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <s.icon className="size-5" />
              </div>
              <div>
                <div className="text-2xl font-bold">{s.value}</div>
                <div className="text-xs text-muted-foreground">{s.label}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent inspections</CardTitle>
        </CardHeader>
        <CardContent>
          {list.length === 0 ? (
            <EmptyState
              icon={Car}
              title="No inspections yet"
              description="Create your first inspection and take 8 guided exterior photos to get a risk report."
              actionLabel="Start an inspection"
              actionHref="/inspections/new"
            />
          ) : (
            <div className="space-y-3">
              {list.map((s) => (
                <InspectionCard
                  key={s.id}
                  session={s}
                  vehicle={s.vehicle_id ? vehicleById.get(s.vehicle_id) ?? null : null}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
