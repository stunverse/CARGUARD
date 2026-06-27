"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DisclaimerBanner } from "@/components/disclaimer-banner";
import { createClient } from "@/lib/supabase/client";
import { fbqTrack } from "@/lib/fbq";
import { SIGNUP_DISCLAIMER } from "@/lib/constants";

export default function SignupPage() {
  const router = useRouter();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [accepted, setAccepted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!accepted) {
      setError("Please accept the Terms and the Disclaimer to continue.");
      return;
    }
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { first_name: firstName, last_name: lastName },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    // Record consent + profile names (best-effort; RLS-scoped to the user).
    if (data.user) {
      const now = new Date().toISOString();
      await supabase
        .from("profiles")
        .update({
          first_name: firstName,
          last_name: lastName,
          terms_accepted_at: now,
          disclaimer_accepted_at: now,
        })
        .eq("id", data.user.id);
      await supabase.from("user_consents").insert([
        { user_id: data.user.id, consent_type: "terms", consent_text: "Accepted Terms of Service at signup." },
        { user_id: data.user.id, consent_type: "disclaimer", consent_text: SIGNUP_DISCLAIMER },
      ]);
    }

    // Conversion: a new account was created.
    fbqTrack("CompleteRegistration");

    if (data.session) {
      router.push("/dashboard");
      router.refresh();
    } else {
      setMessage("Check your email to confirm your account, then log in.");
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <Link href="/" className="mx-auto mb-2 inline-flex items-center gap-2 font-bold">
            <ShieldCheck className="size-6 text-primary" />
            CarGuard <span className="text-accent">AI</span>
          </Link>
          <CardTitle>Create your account</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="first">First name</Label>
                <Input id="first" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="last">Last name</Label>
                <Input id="last" value={lastName} onChange={(e) => setLastName(e.target.value)} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} required onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" value={password} required minLength={8} onChange={(e) => setPassword(e.target.value)} />
            </div>

            <DisclaimerBanner text={SIGNUP_DISCLAIMER} />

            <label className="flex items-start gap-2 text-sm">
              <input
                type="checkbox"
                className="mt-1"
                checked={accepted}
                onChange={(e) => setAccepted(e.target.checked)}
              />
              <span>
                I accept the{" "}
                <Link href="/terms" className="text-primary hover:underline" target="_blank">
                  Terms
                </Link>{" "}
                and the{" "}
                <Link href="/disclaimer" className="text-primary hover:underline" target="_blank">
                  Disclaimer
                </Link>
                .
              </span>
            </label>

            {error && <p className="text-sm text-destructive">{error}</p>}
            {message && <p className="text-sm text-accent">{message}</p>}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Creating account…" : "Create account"}
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-primary hover:underline">
              Log in
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
