import { createClient } from "@/lib/supabase/server";
import { SettingsForm } from "@/components/settings-form";
import { LanguageSwitcher } from "@/components/language-switcher";
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
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Settings</h1>
        <LanguageSwitcher />
      </div>
      <SettingsForm profile={(profile ?? { email: user!.email }) as Partial<Profile>} />
    </div>
  );
}
