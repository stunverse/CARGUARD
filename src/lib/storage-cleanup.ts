// =====================================================================
// CarGuard AI — Storage cleanup (GDPR erasure)
// Removes all of a user's (or one inspection's) media across every private
// bucket: photos, engine audio, mechanical media, documents.
// Path convention: {user_id}/{session_id}/{file}. SERVER ONLY.
// =====================================================================

import type { SupabaseClient } from "@supabase/supabase-js";
import { STORAGE_BUCKETS } from "@/lib/constants";

const BUCKETS = Object.values(STORAGE_BUCKETS);

// Recursively collect every file path under a prefix (handles pagination and
// the user/{session}/file nesting).
async function collectFiles(
  admin: SupabaseClient,
  bucket: string,
  prefix: string,
  depth = 0,
): Promise<string[]> {
  if (depth > 4) return [];
  const out: string[] = [];
  let offset = 0;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const { data, error } = await admin.storage
      .from(bucket)
      .list(prefix, { limit: 100, offset });
    if (error || !data || data.length === 0) break;
    for (const entry of data) {
      const path = prefix ? `${prefix}/${entry.name}` : entry.name;
      // Folders come back with a null id; recurse into them.
      if (entry.id === null) {
        out.push(...(await collectFiles(admin, bucket, path, depth + 1)));
      } else {
        out.push(path);
      }
    }
    if (data.length < 100) break;
    offset += 100;
  }
  return out;
}

async function removeAll(admin: SupabaseClient, bucket: string, prefix: string) {
  const paths = await collectFiles(admin, bucket, prefix);
  for (let i = 0; i < paths.length; i += 100) {
    await admin.storage.from(bucket).remove(paths.slice(i, i + 100));
  }
  return paths.length;
}

// Delete ALL media owned by a user (across every bucket). Best-effort.
export async function purgeUserStorage(admin: SupabaseClient, userId: string) {
  for (const bucket of BUCKETS) {
    try {
      await removeAll(admin, bucket, userId);
    } catch (e) {
      console.error(`purgeUserStorage failed for bucket ${bucket}:`, e);
    }
  }
}

// Delete the media of a single inspection (across every bucket). Best-effort.
export async function purgeSessionStorage(
  admin: SupabaseClient,
  userId: string,
  sessionId: string,
) {
  for (const bucket of BUCKETS) {
    try {
      await removeAll(admin, bucket, `${userId}/${sessionId}`);
    } catch (e) {
      console.error(`purgeSessionStorage failed for bucket ${bucket}:`, e);
    }
  }
}
