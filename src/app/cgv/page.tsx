import { MobileShell } from "@/components/mobile/mobile-shell";
import { LegalDoc } from "@/components/legal-doc";
import { CGV } from "@/lib/legal-content";
import { getServerLocale } from "@/lib/i18n-server";

export const metadata = { title: "Sales Terms — CarGuard AI" };

export default async function CgvPage() {
  const locale = await getServerLocale();
  return (
    <MobileShell>
      <LegalDoc doc={CGV[locale]} locale={locale} />
    </MobileShell>
  );
}
