"use client";

import {
  AlertTriangle,
  CheckCircle2,
  HandCoins,
  MessageCircleQuestion,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useI18n } from "@/components/i18n-provider";

function BulletCard({
  title,
  icon: Icon,
  items,
  tone = "default",
  empty = "Nothing to show.",
}: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  items: string[];
  tone?: "default" | "good" | "warn";
  empty?: string;
}) {
  const color =
    tone === "good"
      ? "text-risk-low"
      : tone === "warn"
        ? "text-risk-moderate"
        : "text-accent";
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Icon className={`size-5 ${color}`} />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground">{empty}</p>
        ) : (
          <ul className="space-y-2">
            {items.map((it, i) => (
              <li key={i} className="flex gap-2 text-sm">
                <span className={`mt-1.5 size-1.5 shrink-0 rounded-full ${color.replace("text-", "bg-")}`} />
                {it}
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

export function PositivePointsList({ items }: { items: string[] }) {
  const { t } = useI18n();
  return (
    <BulletCard
      title={t("rep.positive")}
      icon={CheckCircle2}
      items={items}
      tone="good"
      empty="—"
    />
  );
}

export function SuspiciousPointsList({ items }: { items: string[] }) {
  const { t } = useI18n();
  return (
    <BulletCard
      title={t("rep.suspicious")}
      icon={AlertTriangle}
      items={items}
      tone="warn"
      empty="—"
    />
  );
}

export function SellerQuestionsList({ items }: { items: string[] }) {
  const { t } = useI18n();
  return (
    <BulletCard
      title={t("rep.sellerQuestions")}
      icon={MessageCircleQuestion}
      items={items}
    />
  );
}

export function NegotiationArgumentsList({ items }: { items: string[] }) {
  const { t } = useI18n();
  return (
    <BulletCard
      title={t("rep.negotiation")}
      icon={HandCoins}
      items={items}
      empty="—"
    />
  );
}
