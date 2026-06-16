import { MobileShell } from "@/components/mobile/mobile-shell";
import { getServerLocale } from "@/lib/i18n-server";
import { t } from "@/lib/i18n";

export const metadata = { title: "Terms of Service — CarGuard AI" };

export default async function TermsPage() {
  const locale = await getServerLocale();
  return (
    <MobileShell>
      <h1 className="text-2xl font-extrabold text-[#111827]">{t(locale, "legal.termsTitle")}</h1>
      <p className="mt-4 text-sm leading-relaxed text-[#6B7280]">
        {t(locale, "legal.termsIntro")}
      </p>
      <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-[#6B7280]">
        <li>{t(locale, "legal.termsLi1")}</li>
        <li>{t(locale, "legal.termsLi2")}</li>
        <li>{t(locale, "legal.termsLi3")}</li>
        <li>{t(locale, "legal.termsLi4")}</li>
      </ul>
    </MobileShell>
  );
}
