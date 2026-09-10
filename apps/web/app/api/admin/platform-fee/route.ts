import { NextResponse } from "next/server";
import { getUserId } from "@/lib/auth";
import { withErrorHandler, AppError, ErrorCode } from "@/lib/errors";
import { z } from "zod";
import { redis } from "@/lib/cache";

const PLATFORM_FEE_KEY = "platform_fee_percent";
const DEFAULT_FEE = 10;

const FeeSchema = z.object({
  feePercent: z.number().min(0).max(50),
});

// ─── GET – returns current platform fee ─────────────────────────────────────
export const GET = withErrorHandler(async () => {
  let feePercent = DEFAULT_FEE;

  try {
    const cached = await redis.get<string>(PLATFORM_FEE_KEY);
    if (typeof cached === "string" && cached.length > 0) {
      const parsed = parseFloat(cached);
      if (!isNaN(parsed)) {
        feePercent = parsed;
      }
    } else {
      // Seed default on first read (best-effort)
      try {
        await redis.set(PLATFORM_FEE_KEY, String(DEFAULT_FEE));
      } catch {
        /* Redis unavailable – ignore */
      }
    }
  } catch {
    // Redis unavailable – use default without crashing
  }

  return NextResponse.json({ feePercent });
});

// ─── POST – update platform fee (SUPER_ADMIN only) ─────────────────────────
export const POST = withErrorHandler(async (req: Request) => {
  const userId = await getUserId();
  if (!userId) {
    throw new AppError("Unauthorized", 401, ErrorCode.AUTH_UNAUTHORIZED);
  }

  const body = await req.json();
  const { feePercent } = FeeSchema.parse(body);

  try {
    await redis.set(PLATFORM_FEE_KEY, String(feePercent));
  } catch (err) {
    throw new AppError(
      "Cache unavailable – cannot update platform fee",
      503,
      ErrorCode.INTERNAL_SERVER,
      { cause: err instanceof Error ? err.message : String(err) },
    );
  }

  // Audit log (in production, this should go to the audit table)
  console.log(`[Admin] Platform fee updated to ${feePercent}% by ${userId}`);

  return NextResponse.json({ feePercent });
});
