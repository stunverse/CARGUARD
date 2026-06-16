import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { InspectionWizard, type WizardResume } from "@/components/inspection-wizard";
import type { InspectionPhoto, MechanicalCheckItem, Vehicle } from "@/types";

export const metadata = { title: "Resume inspection — CarGuard AI" };

export default async function ContinueInspectionPage({
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

  // Already finished → show the full report/detail, not the wizard.
  const { data: report } = await supabase
    .from("inspection_reports")
    .select("id")
    .eq("inspection_session_id", id)
    .maybeSingle();
  if (report || s.status === "report_generated") {
    redirect(`/inspections/${id}`);
  }

  const [{ data: photos }, { data: mech }] = await Promise.all([
    supabase.from("inspection_photos").select("photo_point_code, quality_status, image_url").eq("inspection_session_id", id),
    supabase.from("mechanical_checks").select("point_code").eq("inspection_session_id", id),
  ]);

  const v = (s.vehicles ?? {}) as Partial<Vehicle>;
  const str = (x: unknown) => (x == null ? "" : String(x));
  const vehicle: Record<string, string> = {
    vin: str(v.vin),
    make: str(v.make),
    model: str(v.model),
    year: str(v.year),
    mileage: str(v.mileage),
    asking_price: str(v.asking_price),
    fuel_type: str(v.fuel_type),
    transmission: str(v.transmission),
    seller_type: str(v.seller_type),
    goal: str(s.goal),
  };

  const photoStatuses: Record<string, string> = {};
  const photoUrls: Record<string, string | null> = {};
  for (const p of (photos ?? []) as Pick<InspectionPhoto, "photo_point_code" | "quality_status" | "image_url">[]) {
    if (p.photo_point_code) {
      photoStatuses[p.photo_point_code] = p.quality_status;
      photoUrls[p.photo_point_code] = p.image_url;
    }
  }

  const mechDoneCodes = ((mech ?? []) as Pick<MechanicalCheckItem, "point_code">[]).map(
    (m) => m.point_code,
  );

  const resume: WizardResume = {
    sessionId: id,
    vehicle,
    photoStatuses,
    photoUrls,
    mechDoneCodes,
  };

  return <InspectionWizard resume={resume} />;
}
