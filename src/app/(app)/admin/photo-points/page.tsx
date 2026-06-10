import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PHOTO_POINTS } from "@/lib/constants";
import type { PhotoPoint } from "@/types";

export const metadata = { title: "Admin · Photo points — CarGuard AI" };

export default async function AdminPhotoPointsPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("inspection_photo_points")
    .select("*")
    .order("order_index");

  // Fall back to the in-app seed if the DB hasn't been migrated yet.
  const points = (data && data.length ? data : PHOTO_POINTS) as Partial<PhotoPoint>[];

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        The 8 mandatory exterior photo points used by the Hidden Damage Scanner.
        {/* TODO: admin editing of instructions / example images. */}
      </p>
      {points.map((p) => (
        <Card key={p.code}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              {p.order_index}. {p.title}
              {p.required && <Badge variant="accent">required</Badge>}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>{p.instruction}</p>
            <p className="text-muted-foreground">{p.why_it_matters}</p>
            <div className="flex flex-wrap gap-1">
              {(p.ai_detection_targets ?? []).map((t) => (
                <Badge key={t} variant="outline" className="text-xs">
                  {t}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
