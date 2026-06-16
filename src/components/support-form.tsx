"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/lib/toast";
import { useI18n } from "@/components/i18n-provider";

export function SupportForm() {
  const { t } = useI18n();
  const router = useRouter();
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await fetch("/api/support/tickets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subject, message }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error ?? t("sf.couldNotSubmit"));
      toast.error(data.error ?? t("sf.couldNotSubmitTicket"));
      return;
    }
    toast.success(t("sf.ticketSubmitted"));
    setDone(true);
    setSubject("");
    setMessage("");
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="subject">{t("sf.subject")}</Label>
        <Input id="subject" value={subject} required onChange={(e) => setSubject(e.target.value)} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="message">{t("sf.message")}</Label>
        <Textarea id="message" rows={5} value={message} required onChange={(e) => setMessage(e.target.value)} />
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      {done && <p className="text-sm text-risk-low">{t("sf.ticketSubmittedMsg")}</p>}
      <Button type="submit" disabled={loading}>
        {loading ? t("sf.sending") : t("sf.submitTicket")}
      </Button>
    </form>
  );
}
