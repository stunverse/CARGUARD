"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Info, X, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { dismissToast, subscribeToasts, type ToastItem } from "@/lib/toast";

export function Toaster() {
  const [items, setItems] = useState<ToastItem[]>([]);
  useEffect(() => subscribeToasts(setItems), []);

  if (items.length === 0) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 top-3 z-[100] mx-auto flex w-full max-w-[430px] flex-col items-center gap-2 px-4">
      {items.map((t) => {
        const Icon = t.type === "success" ? CheckCircle2 : t.type === "error" ? XCircle : Info;
        const color =
          t.type === "success" ? "text-risk-low" : t.type === "error" ? "text-destructive" : "text-accent";
        return (
          <div
            key={t.id}
            role="status"
            className={cn(
              "pointer-events-auto flex w-full items-start gap-3 rounded-xl border border-[#E5E7EB] bg-white p-3 shadow-lg",
              "animate-in fade-in slide-in-from-top-2",
            )}
          >
            <Icon className={cn("mt-0.5 size-5 shrink-0", color)} aria-hidden />
            <p className="flex-1 text-sm text-[#111827]">{t.message}</p>
            <button
              onClick={() => dismissToast(t.id)}
              aria-label="Dismiss"
              className="text-[#9AA3AF] hover:text-[#111827]"
            >
              <X className="size-4" aria-hidden />
            </button>
          </div>
        );
      })}
    </div>
  );
}
