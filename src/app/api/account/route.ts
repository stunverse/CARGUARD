import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { purgeUserStorage } from "@/lib/storage-cleanup";

// DELETE /api/account — permanently delete the current user's account (GDPR
// erasure). Removes all media across every bucket, then deletes the auth user
// (DB rows cascade via on-delete-cascade FKs).
export async function DELETE() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const admin = createAdminClient();

    // 1) Remove every stored file owned by the user (photos, audio, mechanical
    //    media, documents). Best-effort — does not block deletion.
    await purgeUserStorage(admin, user.id);

    // 2) Delete the auth user — cascades all public.* rows.
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
