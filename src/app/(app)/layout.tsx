import { redirect } from "next/navigation";
import { BottomNavigation } from "@/components/mobile/bottom-navigation";
import { SideNav } from "@/components/desktop/side-nav";
import { DesktopTopbar } from "@/components/desktop/desktop-topbar";
import { createClient } from "@/lib/supabase/server";

// Responsive app shell.
//  • Phones / small tablets (< lg): a centered app column with a fixed bottom
//    navigation — the product reads as a mobile app.
//  • Desktop / large tablets (lg+): a left sidebar + a fluid content area, with
//    the content centered to a comfortable max width.
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

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .maybeSingle();

  return (
    <div className="min-h-screen w-full bg-[#EEF0F3] lg:flex">
      <SideNav isAdmin={Boolean(profile?.is_admin)} />

      {/* App canvas: phone column on small screens, fluid panel on desktop. */}
      <div
        className={
          "relative mx-auto min-h-screen w-full max-w-[480px] overflow-hidden bg-white " +
          "shadow-[0_0_80px_rgba(0,0,0,0.08)] md:max-w-2xl md:border-x md:border-[#E5E7EB] " +
          "lg:max-w-none lg:flex-1 lg:overflow-visible lg:border-0 lg:shadow-none"
        }
      >
        {/* Decorative phone gradient + glow — small screens only. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 lg:hidden"
          style={{
            backgroundImage:
              "linear-gradient(135deg,#FFFFFF 0%,#FAFAFA 45%,#FFF5F5 100%)",
          }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute right-[-100px] top-[-60px] h-64 w-64 rounded-full blur-3xl lg:hidden"
          style={{ background: "rgba(229,9,20,0.10)" }}
        />

        <DesktopTopbar />

        <div className="relative min-h-screen pb-28 lg:pb-12">
          <div className="lg:mx-auto lg:max-w-5xl">{children}</div>
        </div>
      </div>

      <BottomNavigation />
    </div>
  );
}
