import { SiteHeader } from "@/components/site-header";
import { SIGNUP_DISCLAIMER, REPORT_DISCLAIMER } from "@/lib/constants";

export const metadata = { title: "Disclaimer — CarGuard AI" };

export default function DisclaimerPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="container max-w-2xl py-16 prose">
        <h1 className="text-3xl font-bold">Disclaimer</h1>
        <p className="mt-6 text-muted-foreground">{SIGNUP_DISCLAIMER}</p>
        <h2 className="mt-8 text-xl font-semibold">About reports</h2>
        <p className="mt-2 text-muted-foreground">{REPORT_DISCLAIMER}</p>
      </main>
    </div>
  );
}
