import { MobileShell } from "@/components/mobile/mobile-shell";
import { SIGNUP_DISCLAIMER, REPORT_DISCLAIMER } from "@/lib/constants";

export const metadata = { title: "Disclaimer — CarGuard AI" };

export default function DisclaimerPage() {
  return (
    <MobileShell>
      <h1 className="text-2xl font-extrabold text-[#111827]">Disclaimer</h1>
      <p className="mt-4 text-sm leading-relaxed text-[#6B7280]">{SIGNUP_DISCLAIMER}</p>
      <h2 className="mt-6 text-lg font-bold text-[#111827]">About reports</h2>
      <p className="mt-2 text-sm leading-relaxed text-[#6B7280]">{REPORT_DISCLAIMER}</p>
    </MobileShell>
  );
}
