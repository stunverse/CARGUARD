import { MobileShell } from "@/components/mobile/mobile-shell";

export const metadata = { title: "Privacy Policy — CarGuard AI" };

export default function PrivacyPage() {
  return (
    <MobileShell>
      <h1 className="text-2xl font-extrabold text-[#111827]">Privacy Policy</h1>
      <p className="mt-4 text-sm leading-relaxed text-[#6B7280]">
        We store your account information, vehicle details, photos and audio to
        provide the service. Media is kept in secure, private storage and
        accessed via signed URLs. {/* TODO: finalize legal copy. */}
      </p>
      <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-[#6B7280]">
        <li>You can delete your media and your account at any time.</li>
        <li>Media is processed by our AI providers solely to produce your analysis.</li>
        <li>We never sell your personal data.</li>
      </ul>
    </MobileShell>
  );
}
