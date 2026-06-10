import { SiteHeader } from "@/components/site-header";

export const metadata = { title: "Privacy Policy — CarGuard AI" };

export default function PrivacyPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="container max-w-2xl py-16">
        <h1 className="text-3xl font-bold">Privacy Policy</h1>
        <p className="mt-6 text-muted-foreground">
          We store your account information, vehicle details and inspection
          photos to provide the service. Photos are kept in secure, private
          storage and accessed via signed URLs. {/* TODO: finalize legal copy. */}
        </p>
        <ul className="mt-6 list-disc space-y-2 pl-6 text-muted-foreground">
          <li>You can delete your photos and your account at any time.</li>
          <li>Photos are processed by our AI provider solely to produce your analysis.</li>
          <li>We never sell your personal data.</li>
        </ul>
      </main>
    </div>
  );
}
