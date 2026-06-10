import { SiteHeader } from "@/components/site-header";

export const metadata = { title: "Terms of Service — CarGuard AI" };

export default function TermsPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="container max-w-2xl py-16">
        <h1 className="text-3xl font-bold">Terms of Service</h1>
        <p className="mt-6 text-muted-foreground">
          By using CarGuard AI you agree that the service provides photo-based
          informational assistance only and does not replace a professional
          vehicle inspection. {/* TODO: replace with finalized legal copy. */}
        </p>
        <ul className="mt-6 list-disc space-y-2 pl-6 text-muted-foreground">
          <li>You are responsible for the photos and information you upload.</li>
          <li>Results are estimates and must not be treated as guarantees.</li>
          <li>You will not use the service to harass or falsely accuse sellers.</li>
          <li>Subscription and billing terms are described on the Pricing page.</li>
        </ul>
      </main>
    </div>
  );
}
