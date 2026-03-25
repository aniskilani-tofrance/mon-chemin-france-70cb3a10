import { useRef, useCallback } from "react";

/**
 * Simple client-side rate limiter.
 * Returns `true` if the action is allowed, `false` if rate-limited.
 */
export function useRateLimit(maxAttempts: number = 3, windowMs: number = 60_000) {
  const attempts = useRef<number[]>([]);

  const check = useCallback(() => {
    const now = Date.now();
    // Remove expired entries
    attempts.current = attempts.current.filter((t) => now - t < windowMs);

    if (attempts.current.length >= maxAttempts) {
      return false;
    }
    attempts.current.push(now);
    return true;
  }, [maxAttempts, windowMs]);

  const remaining = useCallback(() => {
    const now = Date.now();
    attempts.current = attempts.current.filter((t) => now - t < windowMs);
    return Math.max(0, maxAttempts - attempts.current.length);
  }, [maxAttempts, windowMs]);

  return { check, remaining };
}
