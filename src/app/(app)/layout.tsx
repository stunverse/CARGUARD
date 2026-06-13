import { redirect } from "next/navigation";
import { BottomNavigation } from "@/components/mobile/bottom-navigation";
import { createClient } from "@/lib/supabase/server";

// Mobile-first app shell: a centered phone-width canvas with a fixed
// bottom navigation. The premium white/red look lives in the pages.
export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  return (
    <div
      className="relative min-h-screen w-full"
      style={{
        backgroundImage:
          "linear-gradient(135deg,#FFFFFF 0%,#FAFAFA 45%,#FFF5F5 100%)",
      }}
    >
      {/* Subtle red glow (decorative, non-interactive). */}
      <div
        aria-hidden
        className="pointer-events-none fixed right-[-120px] top-[-80px] h-72 w-72 rounded-full blur-3xl"
        style={{ background: "rgba(229,9,20,0.10)" }}
      />
      <div className="relative mx-auto min-h-screen w-full max-w-md pb-28">
        {children}
      </div>
      <BottomNavigation />
    </div>
  );
}
