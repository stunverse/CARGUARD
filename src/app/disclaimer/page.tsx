import { MobileShell } from "@/components/mobile/mobile-shell";
import { getServerLocale } from "@/lib/i18n-server";
import { t } from "@/lib/i18n";

export const metadata = { title: "Disclaimer — CarGuard AI" };

export default async function DisclaimerPage() {
  const locale = await getServerLocale();
  return (
    <MobileShell>
      <h1 className="text-2xl font-extrabold text-[#111827]">{t(locale, "legal.disclaimerTitle")}</h1>
      <p className="mt-4 text-sm leading-relaxed text-[#6B7280]">{t(locale, "legal.signupDisclaimer")}</p>
      <h2 className="mt-6 text-lg font-bold text-[#111827]">{t(locale, "legal.disclaimerAbout")}</h2>
      <p className="mt-2 text-sm leading-relaxed text-[#6B7280]">{t(locale, "legal.reportDisclaimer")}</p>
    </MobileShell>
  );
}
