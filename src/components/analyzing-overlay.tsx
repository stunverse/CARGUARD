"use client";

import { useEffect, useState } from "react";
import { ScanLine } from "lucide-react";

const STEPS = [
  "Checking photo quality…",
  "Analyzing panel alignment…",
  "Comparing paint & gloss…",
  "Looking for repair signs…",
  "Cross-checking all angles…",
  "Scoring the result…",
  "Almost there…",
];

// Full-screen reassuring overlay shown while the AI analysis runs.
export function AnalyzingOverlay({ label = "Analyzing your inspection" }: { label?: string }) {
  const [step, setStep] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setStep((s) => (s + 1) % STEPS.length), 1600);
    return () => clearInterval(id);
  }, []);

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-0 z-[90] flex flex-col items-center justify-center gap-5 bg-white/95 px-8 text-center backdrop-blur-sm"
    >
      <div className="relative flex size-20 items-center justify-center">
        <span
          className="absolute inset-0 animate-spin rounded-full border-4 border-[#F2F3F5]"
          style={{ borderTopColor: "#E50914" }}
          aria-hidden
        />
        <ScanLine className="size-8 text-[#E50914]" aria-hidden />
      </div>
      <div>
        <p className="text-lg font-bold text-[#111827]">{label}</p>
        <p className="mt-1 text-sm text-[#6B7280]">{STEPS[step]}</p>
      </div>
      <p className="max-w-xs text-xs text-[#9AA3AF]">
        This can take up to a minute. Please keep the app open.
      </p>
    </div>
  );
}
