// =====================================================================
// CarGuard AI — Lightweight rate limiter (security spec §39)
// In-memory sliding window, keyed by user + action. Sufficient for a
// single-instance MVP and to curb AI abuse.
//
// TODO: for multi-instance / serverless scale, back this with Upstash
// Redis or a Postgres counter table so limits are shared across workers.
// =====================================================================

interface Hit {
  count: number;
  resetAt: number;
}

const store = new Map<string, Hit>();

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
}

export function rateLimit(
  key: string,
  { limit, windowMs }: { limit: number; windowMs: number },
): RateLimitResult {
  const now = Date.now();
  const hit = store.get(key);

  if (!hit || hit.resetAt <= now) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: limit - 1, retryAfterSeconds: 0 };
  }

  if (hit.count >= limit) {
    return {
      allowed: false,
      remaining: 0,
      retryAfterSeconds: Math.ceil((hit.resetAt - now) / 1000),
    };
  }

  hit.count += 1;
  return { allowed: true, remaining: limit - hit.count, retryAfterSeconds: 0 };
}

// Opportunistic cleanup so the map doesn't grow unbounded.
export function pruneRateLimits() {
  const now = Date.now();
  for (const [k, v] of store) if (v.resetAt <= now) store.delete(k);
}
