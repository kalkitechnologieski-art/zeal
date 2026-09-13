import { NextResponse } from "next/server";
import { rateLimit } from "@/lib/security";

/**
 * Enforce a sliding-window rate limit. Returns null on success, a 429
 * NextResponse on failure — caller should return it directly.
 *
 *   const limited = await enforceRateLimit(`topup:${userId}`, 5, 60);
 *   if (limited) return limited;
 */
export async function enforceRateLimit(
  key: string,
  limit: number,
  windowSeconds: number,
): Promise<NextResponse | null> {
  const { success, remaining, reset } = await rateLimit(key, limit, windowSeconds);
  if (success) return null;
  return NextResponse.json(
    { error: "Too many requests", code: "RATE_LIMIT" },
    {
      status: 429,
      headers: {
        "X-RateLimit-Limit": String(limit),
        "X-RateLimit-Remaining": String(remaining),
        "X-RateLimit-Reset": String(reset),
        "Retry-After": String(Math.max(1, Math.ceil((reset - Date.now()) / 1000))),
      },
    },
  );
}
