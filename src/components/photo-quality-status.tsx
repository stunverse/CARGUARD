"use client";

import { AlertTriangle, CheckCircle2, Circle, MinusCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useI18n } from "@/components/i18n-provider";
import type { QualityStatus } from "@/types";

export function PhotoQualityStatus({ status }: { status: QualityStatus }) {
  const { t } = useI18n();
  const map = {
    passed: { icon: CheckCircle2, label: t("pqs.qualityOK"), cls: "text-risk-low" },
    failed: { icon: AlertTriangle, label: t("pqs.failed"), cls: "text-risk-critical" },
    needs_retake: { icon: AlertTriangle, label: t("pqs.retakeNeeded"), cls: "text-risk-moderate" },
    skipped: { icon: MinusCircle, label: t("pqs.skipped"), cls: "text-muted-foreground" },
    pending: { icon: Circle, label: t("pqs.pending"), cls: "text-muted-foreground" },
  } as const;
  const { icon: Icon, label, cls } = map[status];
  return (
    <span className={cn("inline-flex items-center gap-1.5 text-sm font-medium", cls)}>
      <Icon className="size-4" />
      {label}
    </span>
  );
}
