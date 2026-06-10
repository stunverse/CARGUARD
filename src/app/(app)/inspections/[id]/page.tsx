import { notFound } from "next/navigation";
import Link from "next/link";
import {
  Camera,
  FileText,
  ScanSearch,
  Car,
  Clock,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  RiskLevelBadge,
  RecommendationBadge,
  RiskScoreCircle,
} from "@/components/risk-indicators";
import { formatDate, formatPrice, vehicleLabel } from "@/lib/utils";
import { PHOTO_POINTS } from "@/lib/constants";
import type {
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

  const { data: photos } = await supabase
    .from("inspection_photos")
    .select("*")
    .eq("inspection_session_id", id);
  const photoList = (photos ?? []) as InspectionPhoto[];
  const completed = photoList.filter((p) =>
    ["passed", "skipped"].includes(p.quality_status),
  ).length;

  const { data: followUps } = await supabase
    .from("follow_up_photo_requests")
    .select("*")
    .eq("inspection_session_id", id);

  const { data: logs } = await supabase
    .from("activity_logs")
    .select("*")
    .eq("inspection_session_id", id)
    .order("created_at", { ascending: false })
    .limit(20);

  const analyzed = session.global_score != null;

  return (
    <div className="container max-w-4xl py-8">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{vehicleLabel(vehicle ?? {})}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <RiskLevelBadge level={session.risk_level} />
            <RecommendationBadge recommendation={session.recommendation} />
            <Badge variant="outline">{session.status.replaceAll("_", " ")}</Badge>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline">
            <Link href={`/inspections/${id}/photos`}>
              <Camera className="size-4" /> Photos ({completed}/8)
            </Link>
          </Button>
          {analyzed && (
            <Button asChild variant="outline">
              <Link href={`/inspections/${id}/analysis`}>
                <ScanSearch className="size-4" /> Analysis
              </Link>
            </Button>
          )}
          {session.status === "report_generated" && (
            <Button asChild>
              <Link href={`/inspections/${id}/report`}>
                <FileText className="size-4" /> Open report
              </Link>
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          {/* Vehicle info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Car className="size-5 text-primary" /> Vehicle information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid grid-cols-2 gap-3 text-sm">
                <Info label="Make" value={vehicle?.make} />
                <Info label="Model" value={vehicle?.model} />
                <Info label="Year" value={vehicle?.year} />
                <Info label="Mileage" value={vehicle?.mileage} />
                <Info
                  label="Asking price"
                  value={formatPrice(vehicle?.asking_price, vehicle?.currency ?? "USD")}
                />
                <Info label="Seller" value={vehicle?.seller_type} />
                <Info label="VIN" value={vehicle?.vin} />
                <Info label="Country" value={vehicle?.country} />
              </dl>
              {vehicle?.listing_url && (
                <a
                  href={vehicle.listing_url}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 inline-block text-sm text-accent hover:underline"
                >
                  View listing →
                </a>
              )}
            </CardContent>
          </Card>

          {/* Next step / summary */}
          {analyzed ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">AI summary</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{session.ai_summary}</p>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-accent/30 bg-accent/5">
              <CardContent className="flex items-center justify-between gap-4 p-6">
                <div>
                  <h3 className="font-semibold">Continue your inspection</h3>
                  <p className="text-sm text-muted-foreground">
                    {completed}/8 photos completed. Take all photos and run the analysis.
                  </p>
                </div>
                <Button asChild>
                  <Link href={`/inspections/${id}/photos`}>Continue</Link>
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Follow-up requests */}
          {followUps && followUps.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Suggested follow-up photos</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {followUps.map((f) => (
                  <div key={f.id} className="rounded-md border p-3 text-sm">
                    <div className="font-medium">{f.title}</div>
                    <p className="text-muted-foreground">{f.reason}</p>
                    <p className="mt-1 text-xs">{f.instruction}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          {analyzed && (
            <Card>
              <CardContent className="flex justify-center p-6">
                <RiskScoreCircle score={session.global_score} label="Global score" />
              </CardContent>
            </Card>
          )}

          {/* Photos checklist */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Photos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1.5 text-sm">
              {PHOTO_POINTS.map((p) => {
                const ph = photoList.find((x) => x.photo_point_code === p.code);
                return (
                  <div key={p.code} className="flex items-center justify-between">
                    <span className="truncate">{p.title}</span>
                    <Badge
                      variant={
                        ph?.quality_status === "passed"
                          ? "low"
                          : ph?.quality_status === "needs_retake"
                            ? "moderate"
                            : ph?.quality_status === "skipped"
                              ? "secondary"
                              : "outline"
                      }
                    >
                      {ph?.quality_status ?? "pending"}
                    </Badge>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Activity log */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Clock className="size-4" /> Activity
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-xs text-muted-foreground">
              {(logs ?? []).length === 0 && <p>No activity yet.</p>}
              {(logs ?? []).map((l) => (
                <div key={l.id} className="flex justify-between gap-2">
                  <span>{l.action_description || l.action_type.replaceAll("_", " ")}</span>
                  <span className="shrink-0">{formatDate(l.created_at)}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: unknown }) {
  return (
    <div>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="font-medium">{value ? String(value) : "—"}</dd>
    </div>
  );
}
