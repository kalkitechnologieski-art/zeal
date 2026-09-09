import { NextResponse } from "next/server";
import { getUserId } from "@/lib/auth";
import { prisma, withTransaction } from "@zeal/database";
import { withErrorHandler, AppError, ErrorCode } from "@/lib/errors";
import { Ledger } from "@/lib/wallet/ledger";
import { z } from "zod";

const AIEndSchema = z.object({
  sessionId: z.string().cuid(),
});

export const POST = withErrorHandler(async (req: Request) => {
  const userId = await getUserId();
  if (!userId) throw new AppError("Unauthorized", 401, ErrorCode.AUTH_UNAUTHORIZED);

  const body = await req.json();
  const { sessionId } = AIEndSchema.parse(body);

  const session = await prisma.callSession.findUnique({
    where: { id: sessionId },
    include: {
      aiConsultant: true,
      user: { include: { wallet: true } },
    },
  });

  if (!session) {
    throw new AppError("Session not found", 404, ErrorCode.SESSION_NOT_FOUND);
  }

  if (session.userId !== userId) {
    throw new AppError("Not authorized", 403, ErrorCode.AUTH_FORBIDDEN);
  }

  if (session.status === "ENDED") {
    return NextResponse.json({ success: true, alreadyEnded: true });
  }

  const now = new Date();
  const durationSeconds = Math.floor((now.getTime() - session.startTime.getTime()) / 1000);
  if (durationSeconds < 1) {
    throw new AppError("Session too short", 400, ErrorCode.VALIDATION_INPUT);
  }

  const rate = session.aiConsultant?.isPaid ? session.aiConsultant.perMinuteRate : 0;
  const amount = (durationSeconds / 60) * rate;

  const result = await withTransaction(async (tx) => {
    // Update session
    const updated = await tx.callSession.update({
      where: { id: sessionId },
      data: {
        endTime: now,
        durationSeconds,
        amount,
        status: "ENDED",
      },
    });

    // Charge user if paid
    if (amount > 0 && session.userId) {
      const wallet = await tx.wallet.findUnique({
        where: { userId: session.userId },
      });
      if (!wallet) {
        throw new AppError("Wallet not found", 404, ErrorCode.WALLET_NOT_FOUND);
      }
      if (wallet.balance < amount) {
        throw new AppError("Insufficient balance", 402, ErrorCode.WALLET_INSUFFICIENT_BALANCE);
      }

      await Ledger.createTransaction({
        walletId: wallet.id,
        type: "PAYMENT",
        amount: -amount,
        description: `AI chat with ${session.aiConsultant?.name || "AI"}`,
        referenceId: sessionId,
      });
    }

    return updated;
  });

  return NextResponse.json({
    success: true,
    session: result,
    durationSeconds,
    amount,
  });
});

// BATCH2_APPLIED
