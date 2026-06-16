import type { Metadata, Viewport } from "next";
import "./globals.css";
import { BRAND } from "@/lib/constants";
import { Toaster } from "@/components/ui/toaster";
import { I18nProvider } from "@/components/i18n-provider";
import { getServerLocale } from "@/lib/i18n-server";

export const metadata: Metadata = {
  title: `${BRAND.name} — ${BRAND.tagline}`,
  description: BRAND.promise,
  manifest: "/manifest.webmanifest",
  applicationName: BRAND.name,
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: BRAND.name,
  },
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
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
