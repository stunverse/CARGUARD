import { AlertTriangle, CheckCircle2, Circle, MinusCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { QualityStatus } from "@/types";

export function PhotoQualityStatus({ status }: { status: QualityStatus }) {
  const map = {
    passed: { icon: CheckCircle2, label: "Quality OK", cls: "text-risk-low" },
    failed: { icon: AlertTriangle, label: "Failed", cls: "text-risk-critical" },
    needs_retake: { icon: AlertTriangle, label: "Retake needed", cls: "text-risk-moderate" },
    skipped: { icon: MinusCircle, label: "Skipped", cls: "text-muted-foreground" },
    pending: { icon: Circle, label: "Pending", cls: "text-muted-foreground" },
  } as const;
  const { icon: Icon, label, cls } = map[status];
  return (
    <span className={cn("inline-flex items-center gap-1.5 text-sm font-medium", cls)}>
      <Icon className="size-4" />
      {label}
    </span>
  );
}
