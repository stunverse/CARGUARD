import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { logActivity } from "@/lib/activity";

// POST /api/reports/[id]/share — toggle public sharing for a report.
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { is_public } = await request.json();

  const { data, error } = await supabase
    .from("inspection_reports")
    .update({ is_public: Boolean(is_public) })
    .eq("id", id)
    .eq("user_id", user.id) // RLS also enforces this.
    .select("id, inspection_session_id, is_public, share_token")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  if (is_public) {
    await logActivity(supabase, {
      userId: user.id,
      sessionId: data.inspection_session_id,
      action: "report_shared",
      description: `Report ${data.id} shared`,
    });
  }

  return NextResponse.json({ report: data });
}
