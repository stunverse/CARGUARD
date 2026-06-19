import { NextResponse } from "next/server";
import type { createClient } from "@/lib/supabase/server";

type DB = Awaited<ReturnType<typeof createClient>>;

// An inspection is locked (read-only) once its report has been generated.
// After that, no media or check can be added/changed — only the PDF report
// can be downloaded (and the report can still be shared).
export async function isInspectionLocked(db: DB, sessionId: string): Promise<boolean> {
  const { data } = await db
    .from("inspection_sessions")
    .select("status")
    .eq("id", sessionId)
    .maybeSingle();
  return (data as { status?: string } | null)?.status === "report_generated";
}

export function lockedResponse() {
  return NextResponse.json(
    {
      error:
        "This inspection is finalized — its report has been generated and can no longer be modified.",
      code: "report_locked",
    },
    { status: 403 },
  );
}
