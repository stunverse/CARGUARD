"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import { toast } from "@/lib/toast";
import { useI18n } from "@/components/i18n-provider";
import type { Profile } from "@/types";

const FIELD_LABEL: Record<string, string> = {
  first_name: "set.firstName",
  last_name: "set.lastName",
  phone: "set.phone",
  country: "set.country",
};

export function SettingsForm({ profile }: { profile: Partial<Profile> }) {
  const { t } = useI18n();
  const router = useRouter();
  const [form, setForm] = useState({
    first_name: profile.first_name ?? "",
    last_name: profile.last_name ?? "",
    phone: profile.phone ?? "",
    country: profile.country ?? "",
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    const res = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSaving(false);
    if (res.ok) {
      setSaved(true);
      toast.success(t("set.profileSaved"));
    } else {
      toast.error(t("set.saveError"));
    }
  }

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  async function deleteAccount() {
    const res = await fetch("/api/account", { method: "DELETE" });
    if (res.ok) {
      router.push("/");
      router.refresh();
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t("set.profile")}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={save} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              {(["first_name", "last_name", "phone", "country"] as const).map((k) => (
                <div key={k} className="space-y-2">
                  <Label htmlFor={k}>
                    {t(FIELD_LABEL[k])}
                  </Label>
                  <Input
                    id={k}
                    value={form[k]}
                    onChange={(e) => setForm({ ...form, [k]: e.target.value })}
                  />
                </div>
              ))}
            </div>
            <div className="flex items-center gap-3">
              <Button type="submit" disabled={saving}>
                {saving ? t("set.saving") : t("set.saveChanges")}
              </Button>
              {saved && <span className="text-sm text-risk-low">{t("set.saved")}</span>}
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t("set.account")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Button variant="outline" onClick={signOut}>
              {t("set.signOut")}
            </Button>
          </div>
          <div className="rounded-lg border border-destructive/30 p-4">
            <h3 className="font-medium text-destructive">{t("set.deleteAccount")}</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {t("set.deleteDesc")}
            </p>
            {confirmDelete ? (
              <div className="mt-3 flex gap-2">
                <Button variant="destructive" onClick={deleteAccount}>
                  {t("set.confirmDelete")}
                </Button>
                <Button variant="ghost" onClick={() => setConfirmDelete(false)}>
                  {t("set.cancel")}
                </Button>
              </div>
            ) : (
              <Button
                variant="destructive"
                className="mt-3"
                onClick={() => setConfirmDelete(true)}
              >
                {t("set.deleteMyAccount")}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
