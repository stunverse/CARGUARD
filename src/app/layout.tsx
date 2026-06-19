import type { Metadata, Viewport } from "next";
import "./globals.css";
import { BRAND, SITE_URL } from "@/lib/constants";
import { Toaster } from "@/components/ui/toaster";
import { I18nProvider } from "@/components/i18n-provider";
import { getServerLocale } from "@/lib/i18n-server";

const TITLE = `${BRAND.name} — ${BRAND.tagline}`;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: TITLE,
  description: BRAND.promise,
  manifest: "/manifest.webmanifest",
  applicationName: BRAND.name,
  keywords: [
    "used car inspection",
    "AI car inspection",
    "hidden damage detection",
    "accident car check",
    "repainted car detection",
    "VIN check",
    "vehicle history report",
    "inspection voiture occasion",
    "détecter voiture accidentée",
    "vérifier un VIN",
    "voiture accidentée",
  ],
  authors: [{ name: BRAND.name }],
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: BRAND.name,
  },
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  openGraph: {
    type: "website",
    siteName: BRAND.name,
    title: TITLE,
    description: BRAND.promise,
    url: SITE_URL,
    locale: "en_US",
    alternateLocale: "fr_FR",
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: BRAND.promise,
  },
};

export const viewport: Viewport = {
  themeColor: "#b91c1c",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover", // respect device safe areas (notch / home indicator)
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getServerLocale();
  return (
    <html lang={locale} suppressHydrationWarning>
      <body>
        <I18nProvider locale={locale}>
          {children}
          <Toaster />
        </I18nProvider>
      </body>
    </html>
  );
}
