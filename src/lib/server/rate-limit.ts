import "server-only";

/**
 * In-memory rate limiter for server-side use.
 * Keyed by identifier (e.g., IP address).
 */

const store = new Map<string, { count: number; resetTime: number }>();

const CLEANUP_INTERVAL_MS = 5 * 60_000;

function cleanup() {
  const now = Date.now();
  for (const [key, entry] of store) {
    if (now > entry.resetTime) {
      store.delete(key);
    }
  }
}

// Auto-cleanup to prevent memory leaks in long-running processes.
if (typeof globalThis !== "undefined") {
  const existing = (globalThis as Record<string, unknown>)
    .__loginRateLimitCleanup as ReturnType<typeof setInterval> | undefined;

  if (!existing) {
    (globalThis as Record<string, unknown>).__loginRateLimitCleanup =
      setInterval(cleanup, CLEANUP_INTERVAL_MS);
  }
}

export function checkRateLimit(
  key: string,
  maxAttempts: number,
  windowMs: number
) {
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || now > entry.resetTime) {
    store.set(key, { count: 1, resetTime: now + windowMs });
    return true;
  }

  entry.count += 1;
  return entry.count <= maxAttempts;
}
