import { MobileShell } from "@/components/mobile/mobile-shell";
import { getServerLocale } from "@/lib/i18n-server";
import { t } from "@/lib/i18n";

export const metadata = { title: "Privacy Policy — CarGuard AI" };

export default async function PrivacyPage() {
  const locale = await getServerLocale();
  return (
    <MobileShell>
      <h1 className="text-2xl font-extrabold text-[#111827]">{t(locale, "legal.privacyTitle")}</h1>
      <p className="mt-4 text-sm leading-relaxed text-[#6B7280]">
        {t(locale, "legal.privacyIntro")}
      </p>
      <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-[#6B7280]">
        <li>{t(locale, "legal.privacyLi1")}</li>
        <li>{t(locale, "legal.privacyLi2")}</li>
        <li>{t(locale, "legal.privacyLi3")}</li>
      </ul>
    </MobileShell>
  );
}
