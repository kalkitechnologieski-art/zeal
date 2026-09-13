import { NextResponse } from "next/server";
import { getUserId } from "@/lib/auth";
import { prisma } from "@zeal/database";
import { withErrorHandler, AppError, ErrorCode } from "@/lib/errors";
import { getPaymentAdapter } from "@/lib/payments";
import { enforceRateLimit } from "@/lib/rate-limit";
import { TopupSchema } from "@/lib/validation";

export const POST = withErrorHandler(async (req: Request) => {
  const userId = await getUserId();
  if (!userId) throw new AppError("Unauthorized", 401, ErrorCode.AUTH_UNAUTHORIZED);

  const limited = await enforceRateLimit("topup:" + userId, 5, 60);
  if (limited) return limited;

  const body = await req.json();
  const { amount } = TopupSchema.parse(body);

  let wallet = await prisma.wallet.findUnique({ where: { userId } });
  if (!wallet) {
    wallet = await prisma.wallet.create({
      data: { userId, balance: 0, escrow: 0, pendingIn: 0, pendingOut: 0, blocked: 0 },
    });
  }

  let adapter;
  try {
    adapter = getPaymentAdapter();
  } catch {
    throw new AppError(
      "Payment service unavailable — Razorpay not configured",
      503,
      ErrorCode.CONFIG_ERROR,
    );
  }

  const order = await adapter.createOrder({
    amount,
    currency: "INR",
    receipt: "topup_" + Date.now() + "_" + userId.slice(0, 8),
    notes: { userId, purpose: "Wallet top-up" },
  });

  await prisma.transaction.create({
    data: {
      walletId: wallet.id,
      type: "TOPUP",
      amount: 0,
      balance: wallet.balance,
      description: "Pending topup (order " + order.orderId + ")",
      referenceId: order.orderId,
      metadata: { pending: true, expectedAmount: amount, orderId: order.orderId },
    },
  });

  return NextResponse.json({
    orderId: order.orderId,
    amount: order.amount,
    currency: order.currency,
    keyId: order.keyId,
    walletId: wallet.id,
  });
});

