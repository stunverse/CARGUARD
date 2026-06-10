import { ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";
import { SIGNUP_DISCLAIMER } from "@/lib/constants";

export function DisclaimerBanner({
  text = SIGNUP_DISCLAIMER,
  className,
}: {
  text?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex gap-3 rounded-lg border border-muted bg-muted/40 p-4 text-sm text-muted-foreground",
        className,
      )}
      role="note"
    >
      <ShieldAlert className="mt-0.5 size-5 shrink-0 text-primary" />
      <p>{text}</p>
    </div>
  );
}
