import { CreditsPanel } from "@/components/credits-panel";
import { getServerLocale } from "@/lib/i18n-server";
import { t } from "@/lib/i18n";

export const metadata = { title: "Billing — CarGuard AI" };

export default async function BillingPage() {
  const locale = await getServerLocale();
  return (
    <div className="px-5 py-6">
      <h1 className="mb-2 text-2xl font-bold">{t(locale, "bill.title")}</h1>
      <p className="mb-6 text-sm text-muted-foreground">{t(locale, "bill.subtitle")}</p>
      <CreditsPanel />
    </div>
  );
}
