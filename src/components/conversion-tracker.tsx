"use client";

import { useEffect, useRef } from "react";
import { fbqTrack } from "@/lib/fbq";

// Fires a Meta Pixel conversion event once on mount. Rendered by server pages
// (e.g. the post-payment page) when a conversion actually happened.
export function ConversionTracker({
  event,
  value,
  currency,
}: {
  event: string;
  value?: number;
  currency?: string;
}) {
  const fired = useRef(false);
  useEffect(() => {
    if (fired.current) return;
    fired.current = true;
    const params: Record<string, unknown> = {};
    if (value != null) params.value = value;
    if (currency) params.currency = currency.toUpperCase();
    fbqTrack(event, params);
  }, [event, value, currency]);
  return null;
}
