import { NextResponse } from "next/server";
import { getUserId } from "@/lib/auth";
import { withErrorHandler, AppError, ErrorCode } from "@/lib/errors";
import { getPaymentAdapter } from "@/lib/payments";
import { z } from "zod";

const VerifySchema = z.object({
  orderId: z.string(),
  paymentId: z.string(),
  signature: z.string(),
});

export const POST = withErrorHandler(async (req: Request) => {
  const userId = await getUserId();
  if (!userId) {
    throw new AppError("Unauthorized", 401, ErrorCode.AUTH_UNAUTHORIZED);
  }

  const body = await req.json();
  const { orderId, paymentId, signature } = VerifySchema.parse(body);

  const adapter = getPaymentAdapter();
  const valid = adapter.verifyPayment({ orderId, paymentId, signature });

  if (!valid) {
    throw new AppError("Invalid payment signature", 400, ErrorCode.WEBHOOK_INVALID);
  }

  // Actual credit happens in the webhook handler for idempotency
  return NextResponse.json({ success: true, verified: true });
});

// BATCH2_APPLIED
