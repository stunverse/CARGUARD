import { redirect } from "next/navigation";
import { BottomNavigation } from "@/components/mobile/bottom-navigation";
import { createClient } from "@/lib/supabase/server";

// Mobile-first app shell. On phones the white column fills the screen; on
// larger screens it sits as a centered phone-width canvas on a neutral
// backdrop, so the app always reads as a mobile app. A fixed bottom
// navigation (also centered to the column) is the primary menu.
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
    <div className="min-h-screen w-full bg-[#EEF0F3]">
      {/* Phone-width canvas */}
      <div
        className="relative mx-auto min-h-screen w-full max-w-[430px] overflow-hidden bg-white shadow-[0_0_80px_rgba(0,0,0,0.08)] md:border-x md:border-[#E5E7EB]"
        style={{
          backgroundImage:
            "linear-gradient(135deg,#FFFFFF 0%,#FAFAFA 45%,#FFF5F5 100%)",
        }}
      >
        {/* Subtle red glow (decorative). */}
        <div
          aria-hidden
          className="pointer-events-none absolute right-[-100px] top-[-60px] h-64 w-64 rounded-full blur-3xl"
          style={{ background: "rgba(229,9,20,0.10)" }}
        />
        <div className="relative min-h-screen pb-28">{children}</div>
      </div>
      <BottomNavigation />
    </div>
  );
}
