import { MobileShell } from "@/components/mobile/mobile-shell";

export const metadata = { title: "Terms of Service — CarGuard AI" };

export default function TermsPage() {
  return (
    <MobileShell>
      <h1 className="text-2xl font-extrabold text-[#111827]">Terms of Service</h1>
      <p className="mt-4 text-sm leading-relaxed text-[#6B7280]">
        By using CarGuard AI you agree that the service provides photo- and
        sound-based informational assistance only and does not replace a
        professional vehicle inspection. {/* TODO: finalized legal copy. */}
      </p>
      <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-[#6B7280]">
        <li>You are responsible for the photos and information you upload.</li>
        <li>Results are estimates and must not be treated as guarantees.</li>
        <li>You will not use the service to harass or falsely accuse sellers.</li>
        <li>Subscription and billing terms are described on the Pricing page.</li>
      </ul>
    </MobileShell>
  );
}
