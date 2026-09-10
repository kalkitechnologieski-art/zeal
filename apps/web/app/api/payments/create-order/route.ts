import { NextResponse } from "next/server";
import { getUserId } from "@/lib/auth";
import { withErrorHandler, AppError, ErrorCode } from "@/lib/errors";
import { getPaymentAdapter } from "@/lib/payments";
import { z } from "zod";

const CreateOrderSchema = z.object({
  amount: z.number().positive().max(100000),
  currency: z.string().default("INR"),
  purpose: z.string().max(200).optional(),
});

export const POST = withErrorHandler(async (req: Request) => {
  const userId = await getUserId();
  if (!userId) {
    throw new AppError("Unauthorized", 401, ErrorCode.AUTH_UNAUTHORIZED);
  }

  const body = await req.json();
  const { amount, currency, purpose } = CreateOrderSchema.parse(body);

  const adapter = getPaymentAdapter();
  const order = await adapter.createOrder({
    amount,
    currency,
    receipt: `order_${Date.now()}_${userId.slice(0, 8)}`,
    notes: {
      userId,
      purpose: purpose || "Zeal payment",
    },
  });

  return NextResponse.json({
    orderId: order.orderId,
    amount: order.amount,
    currency: order.currency,
    keyId: order.keyId,
  });
});

// BATCH2_APPLIED
