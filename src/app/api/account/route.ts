import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

// DELETE /api/account — permanently delete the current user's account.
// Cascades remove all user-owned rows (FKs on delete cascade). Storage
// objects under {user_id}/ are also removed.
export async function DELETE() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const admin = createAdminClient();
    const bucket =
      process.env.STORAGE_BUCKET_INSPECTION_PHOTOS || "inspection-photos";

    // Best-effort storage cleanup.
    const { data: files } = await admin.storage.from(bucket).list(user.id, {
      limit: 1000,
    });
    if (files?.length) {
      // list() is shallow; for the MVP we remove top-level + per-session dirs.
      const { data: sessions } = await admin.storage
        .from(bucket)
        .list(user.id);
      for (const dir of sessions ?? []) {
        const { data: inner } = await admin.storage
          .from(bucket)
          .list(`${user.id}/${dir.name}`);
        const paths = (inner ?? []).map(
          (f) => `${user.id}/${dir.name}/${f.name}`,
        );
        if (paths.length) await admin.storage.from(bucket).remove(paths);
      }
    }

    // Deleting the auth user cascades all public.* rows.
    const { error } = await admin.auth.admin.deleteUser(user.id);
    if (error) throw error;
  } catch (e) {
    return NextResponse.json(
      {
        error:
          e instanceof Error
            ? e.message
            : "Account deletion requires SUPABASE_SERVICE_ROLE_KEY.",
      },
      { status: 500 },
    );
  }

  await supabase.auth.signOut();
  return NextResponse.json({ ok: true });
}
