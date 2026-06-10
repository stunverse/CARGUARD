import { Users, Car, FileText, Camera, AlertTriangle } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { AdminMetricCard } from "@/components/admin-metric-card";
import type { InspectionSession } from "@/types";

export const metadata = { title: "Admin — CarGuard AI" };

export default async function AdminOverviewPage() {
  const supabase = await createClient();

  const [{ count: users }, { count: photos }, { data: sessions }] =
    await Promise.all([
      supabase.from("profiles").select("id", { count: "exact", head: true }),
      supabase.from("inspection_photos").select("id", { count: "exact", head: true }),
      supabase.from("inspection_sessions").select("*"),
    ]);

  const list = (sessions ?? []) as InspectionSession[];
  const reports = list.filter((s) => s.status === "report_generated").length;
  const highRisk = list.filter((s) =>
    ["high", "very_high"].includes(s.risk_level ?? ""),
  ).length;
  const scored = list.filter((s) => s.global_score != null);
  const avgScore = scored.length
    ? Math.round(
        scored.reduce((a, s) => a + (s.global_score ?? 0), 0) / scored.length,
      )
    : 0;

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
      <AdminMetricCard label="Total users" value={users ?? 0} icon={Users} />
      <AdminMetricCard label="Inspections" value={list.length} icon={Car} />
      <AdminMetricCard label="Photos uploaded" value={photos ?? 0} icon={Camera} />
      <AdminMetricCard label="Reports generated" value={reports} icon={FileText} />
      <AdminMetricCard label="Avg risk score" value={avgScore} icon={AlertTriangle} />
      <AdminMetricCard label="High-risk inspections" value={highRisk} icon={AlertTriangle} />
    </div>
  );
}
