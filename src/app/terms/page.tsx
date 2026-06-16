import { MobileShell } from "@/components/mobile/mobile-shell";
import { LegalDoc } from "@/components/legal-doc";
import { TERMS } from "@/lib/legal-content";
import { getServerLocale } from "@/lib/i18n-server";

export const metadata = { title: "Terms of Service — CarGuard AI" };

export default async function TermsPage() {
  const locale = await getServerLocale();
  return (
    <MobileShell>
      <LegalDoc doc={TERMS[locale]} locale={locale} />
    </MobileShell>
  );
}
