# CarGuard AI — Mobile (App Store & Google Play)

CarGuard AI ships to the stores as a **native app built with [Capacitor](https://capacitorjs.com/)**
that loads the deployed Next.js app inside a native shell. This reuses the
entire web codebase while giving access to the device **camera** (8-photo
scanner) and **microphone** (engine-start audio) and a real store listing.

> Strategy: *hybrid*. SSR + API routes stay on your server (Vercel); the native
> shell points at `server.url` (see `capacitor.config.ts`). A future full React
> Native rewrite would give the most native feel, but is not required to ship.

## Prerequisites

- **Android**: Android Studio + JDK 17.
- **iOS**: a **Mac** with Xcode + CocoaPods, and an Apple Developer account.
- Your web app deployed over **HTTPS** (camera/mic require it).

## One-time setup

```bash
npm install

# Point the shell at your deployed app (HTTPS).
export MOBILE_SERVER_URL=https://your-app.vercel.app   # or set NEXT_PUBLIC_APP_URL

# Generate the native projects.
npm run cap:add:ios
npm run cap:add:android
```

## App icons & splash

A source icon lives at `resources/icon.svg`. Export it to PNGs, then generate
every store size automatically:

```bash
# Export resources/icon.svg -> resources/icon.png (1024x1024)
#        and a 2732x2732 resources/splash.png (any tool / Figma / rsvg-convert)
npm run cap:assets
```

## Permissions (required for store review)

**iOS** — `ios/App/App/Info.plist`:

```xml
<key>NSCameraUsageDescription</key>
<string>CarGuard AI uses the camera to take the 8 guided exterior photos.</string>
<key>NSMicrophoneUsageDescription</key>
<string>CarGuard AI uses the microphone to record the engine starting.</string>
<key>NSPhotoLibraryUsageDescription</key>
<string>CarGuard AI lets you upload existing photos for analysis.</string>
```

**Android** — `android/app/src/main/AndroidManifest.xml`:

```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.CAMERA" />
<uses-permission android:name="android.permission.RECORD_AUDIO" />
```

The existing web capture (`<input capture>` and `MediaRecorder`) works inside
the WebView once these permissions are present — no component rewrite needed.

## Build, run, ship

```bash
npm run cap:sync          # after any web change or config change
npm run cap:open:ios      # opens Xcode  -> Archive -> App Store Connect
npm run cap:open:android  # opens Android Studio -> Generate Signed Bundle (.aab) -> Play Console
```

When you redeploy the web app, mobile users get the update instantly (the shell
loads the live site) — you only resubmit a native build when you change native
config, icons, permissions, or plugins.

## App identity

- Bundle / application id: `ai.carguard.app` (change in `capacitor.config.ts`).
- App name: **CarGuard AI**.

## Store-review notes (honest)

- Apple can reject apps that are "just a website". CarGuard is acceptable
  because it provides substantial app-like functionality (guided multi-photo
  capture, audio recording, generated reports) using native camera/mic. Keep
  the listing screenshots focused on those flows.
- For the strongest native experience later, the camera/audio steps can be
  swapped to `@capacitor/camera` and a native recorder plugin, or the app can be
  rebuilt in React Native/Expo. The data model, AI endpoints, RLS and billing
  already live server-side and would be reused as-is.
