// Lightweight, safe wrapper around the Meta Pixel (window.fbq).
// No-ops if the pixel isn't loaded (e.g. dev, blockers, before consent).

export function fbqTrack(event: string, params?: Record<string, unknown>): void {
  if (typeof window !== "undefined" && typeof window.fbq === "function") {
    window.fbq("track", event, params);
  }
}
