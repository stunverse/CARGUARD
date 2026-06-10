import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SupportForm } from "@/components/support-form";
import { formatDate } from "@/lib/utils";

export const metadata = { title: "Support — CarGuard AI" };

const FAQ = [
  {
    q: "How many photos do I need?",
    a: "8 mandatory exterior photos: front, rear, both sides, and the 4 diagonals. No interior or engine photos are required.",
  },
  {
    q: "Does CarGuard AI replace a mechanic?",
    a: "No. It is a preliminary, photo-based screening tool. Always consider a professional inspection before purchase.",
  },
  {
    q: "Can it guarantee the car was never in an accident?",
    a: "No. It highlights possible visual signs only and speaks in probabilities, never certainties.",
  },
];

export default async function SupportPage() {
  const supabase = await createClient();
  const { data: tickets } = await supabase
    .from("support_tickets")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="container max-w-3xl py-8">
      <h1 className="mb-6 text-2xl font-bold">Support</h1>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-base">FAQ</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {FAQ.map((f) => (
            <div key={f.q}>
              <p className="font-medium">{f.q}</p>
              <p className="text-sm text-muted-foreground">{f.a}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-base">Contact support</CardTitle>
        </CardHeader>
        <CardContent>
          <SupportForm />
        </CardContent>
      </Card>

      {tickets && tickets.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Your tickets</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {tickets.map((t) => (
              <div key={t.id} className="flex items-center justify-between border-b pb-2 last:border-0">
                <div>
                  <p className="text-sm font-medium">{t.subject}</p>
                  <p className="text-xs text-muted-foreground">{formatDate(t.created_at)}</p>
                </div>
                <Badge variant="outline">{t.status.replaceAll("_", " ")}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
