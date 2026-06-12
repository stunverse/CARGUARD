import type { CapacitorConfig } from "@capacitor/cli";

// =====================================================================
// CarGuard AI — Capacitor (iOS + Android) configuration
//
// Hybrid strategy: the native shell loads the deployed Next.js app
// (server-side rendering + API routes stay on the server). This reuses
// the entire web codebase and ships to both stores.
//
// Set MOBILE_SERVER_URL (or NEXT_PUBLIC_APP_URL) to your HTTPS deploy
// before running `npx cap sync`.
// =====================================================================

const serverUrl =
  process.env.MOBILE_SERVER_URL ||
  process.env.NEXT_PUBLIC_APP_URL ||
  "https://carguard.vercel.app";

const config: CapacitorConfig = {
  appId: "ai.carguard.app",
  appName: "CarGuard AI",
  // Offline fallback bundle copied into the native projects.
  webDir: "capacitor/www",
  server: {
    // Load the live app. Must be HTTPS for camera/microphone permissions.
    url: serverUrl,
    cleartext: false,
  },
  backgroundColor: "#ffffff",
  ios: {
    contentInset: "always",
  },
  android: {
    allowMixedContent: false,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 1200,
      backgroundColor: "#b91c1c",
      showSpinner: false,
    },
  },
};

export default config;
