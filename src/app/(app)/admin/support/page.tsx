import { createClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/empty-state";
import { LifeBuoy } from "lucide-react";
import { formatDate } from "@/lib/utils";

export const metadata = { title: "Admin · Support — CarGuard AI" };

export default async function AdminSupportPage() {
  const supabase = await createClient();
  const { data: tickets } = await supabase
    .from("support_tickets")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200);

  if (!tickets || tickets.length === 0) {
    return <EmptyState icon={LifeBuoy} title="No support tickets" />;
  }

  return (
    <Card>
      <CardContent className="p-0">
        <table className="w-full text-sm">
          <thead className="border-b text-left text-muted-foreground">
            <tr>
              <th className="p-3">Subject</th>
              <th className="p-3">Priority</th>
              <th className="p-3">Status</th>
              <th className="p-3">Created</th>
            </tr>
          </thead>
          <tbody>
            {tickets.map((t) => (
              <tr key={t.id} className="border-b last:border-0">
                <td className="p-3">{t.subject}</td>
                <td className="p-3">{t.priority}</td>
                <td className="p-3"><Badge variant="outline">{t.status.replaceAll("_", " ")}</Badge></td>
                <td className="p-3">{formatDate(t.created_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}
