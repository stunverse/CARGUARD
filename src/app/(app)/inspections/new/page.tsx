import { Camera } from "lucide-react";
import { VehicleForm } from "@/components/vehicle-form";
import { Card, CardContent } from "@/components/ui/card";

export const metadata = { title: "New inspection — CarGuard AI" };

export default function NewInspectionPage() {
  return (
    <div className="container max-w-2xl py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">New inspection</h1>
        <p className="text-muted-foreground">
          Tell us about the vehicle. Next, you&apos;ll take 8 guided exterior
          photos.
        </p>
      </div>

      <Card className="mb-6 border-accent/30 bg-accent/5">
        <CardContent className="flex gap-3 p-4 text-sm">
          <Camera className="mt-0.5 size-5 shrink-0 text-accent" />
          <p>
            You&apos;ll need to take <strong>8 mandatory exterior photos</strong>{" "}
            (front, rear, both sides, and the 4 diagonals). No interior or engine
            photos are required.
          </p>
        </CardContent>
      </Card>

      <VehicleForm />
    </div>
  );
}
