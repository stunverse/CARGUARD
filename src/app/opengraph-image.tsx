import { ImageResponse } from "next/og";

// Default social-share image for every page that doesn't define its own.
export const alt =
  "CarGuard AI — Spot hidden accident & repair damage before you buy a used car";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#7a0008",
          backgroundImage:
            "linear-gradient(135deg,#1a0000 0%,#7a0008 55%,#e50914 100%)",
          color: "white",
          padding: "80px",
          textAlign: "center",
        }}
      >
        <div style={{ display: "flex", fontSize: 100, fontWeight: 800, letterSpacing: "-2px" }}>
          <span>CarGuard&nbsp;</span>
          <span style={{ color: "#FF6B6B" }}>AI</span>
        </div>
        <div style={{ display: "flex", fontSize: 42, marginTop: 28, maxWidth: 940, lineHeight: 1.3 }}>
          Spot hidden accident &amp; repair damage before you buy a used car
        </div>
        <div style={{ display: "flex", fontSize: 26, marginTop: 48, opacity: 0.85 }}>
          carguard-ai.com
        </div>
      </div>
    ),
    { ...size },
  );
}
