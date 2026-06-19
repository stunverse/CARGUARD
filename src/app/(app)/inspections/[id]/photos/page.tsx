import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { HiddenDamageScanner } from "@/components/hidden-damage-scanner";
import { vehicleLabel } from "@/lib/utils";
import type { InspectionPhoto } from "@/types";

export const metadata = { title: "Hidden Damage Scanner — CarGuard AI" };

export default async function PhotosPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: session } = await supabase
    .from("inspection_sessions")
    .select("*, vehicles(*)")
    .eq("id", id)
    .single();
  if (!session) notFound();
  // Once the report is generated the inspection is read-only — no edits here.
  if (session.status === "report_generated") redirect(`/inspections/${id}`);

  const { data: photos } = await supabase
    .from("inspection_photos")
    .select("*")
    .eq("inspection_session_id", id);

  const vehicle = (session as { vehicles?: never }).vehicles ?? {};

  return (
    <div className="px-5 py-6">
      <Link
        href={`/inspections/${id}`}
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> Back to inspection
      </Link>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Hidden Damage Scanner</h1>
        <p className="text-muted-foreground">
          {vehicleLabel(vehicle)} — take the 8 guided exterior photos.
        </p>
      </div>

      <HiddenDamageScanner
        sessionId={id}
        initialPhotos={(photos ?? []) as InspectionPhoto[]}
      />
    </div>
  );
}
