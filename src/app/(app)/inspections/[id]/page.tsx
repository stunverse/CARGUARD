import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import {
  RiskLevelBadge,
  RecommendationBadge,
} from "@/components/risk-indicators";
import { InspectionTabs } from "@/components/inspection-tabs";
import { vehicleLabel } from "@/lib/utils";
import type {
  EngineAudioCheck,
  FinalReport,
  InspectionPhoto,
  InspectionSession,
  Vehicle,
} from "@/types";

export const metadata = { title: "Inspection — CarGuard AI" };

export default async function InspectionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: s } = await supabase
    .from("inspection_sessions")
    .select("*, vehicles(*)")
    .eq("id", id)
    .single();
  if (!s) notFound();
  const session = s as InspectionSession & { vehicles: Vehicle | null };
  const vehicle = session.vehicles;

  const [
    { data: photos },
    { data: followUps },
    { data: logs },
    { data: reportRow },
    { data: audioRow },
  ] = await Promise.all([
    supabase.from("inspection_photos").select("*").eq("inspection_session_id", id),
    supabase.from("follow_up_photo_requests").select("*").eq("inspection_session_id", id),
    supabase
      .from("activity_logs")
      .select("*")
      .eq("inspection_session_id", id)
      .order("created_at", { ascending: false })
      .limit(50),
    supabase
      .from("inspection_reports")
      .select("report_content")
      .eq("inspection_session_id", id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("engine_audio_checks")
      .select("*")
      .eq("inspection_session_id", id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  const report =
    (reportRow?.report_content as FinalReport | null) ??
    (session.final_report as FinalReport | null);

  return (
    <div className="container max-w-5xl py-8">
      <div className="mb-4">
        <h1 className="text-2xl font-bold">{vehicleLabel(vehicle ?? {})}</h1>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <RiskLevelBadge level={session.risk_level} />
          <RecommendationBadge recommendation={session.recommendation} />
          <Badge variant="outline">{session.status.replaceAll("_", " ")}</Badge>
        </div>
      </div>

      <InspectionTabs
        session={session}
        vehicle={vehicle}
        photos={(photos ?? []) as InspectionPhoto[]}
        followUps={(followUps ?? []) as never}
        logs={(logs ?? []) as never}
        report={report}
        engineAudio={(audioRow ?? null) as EngineAudioCheck | null}
      />
    </div>
  );
}
