import { createClient } from "@/lib/supabase/server";
import { SettingsForm } from "@/components/settings-form";
import type { Profile } from "@/types";

export const metadata = { title: "Settings — CarGuard AI" };

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user!.id)
    .single();

  return (
    <div className="px-5 py-6">
      <h1 className="mb-6 text-2xl font-bold">Settings</h1>
      <SettingsForm profile={(profile ?? { email: user!.email }) as Partial<Profile>} />
    </div>
  );
}
