import { NextResponse } from "next/server";
import { getUserId } from "@/lib/auth";
import { prisma } from "@zeal/database";
import { withErrorHandler, AppError, HTTP_STATUS } from "@/lib/errors";
import { Ledger } from "@/lib/wallet/ledger";
import { AIEndSchema } from "@/lib/validation";

export const POST = withErrorHandler(async (req: Request) => {
  const userId = await getUserId();
  if (!userId) throw new AppError("Unauthorized", HTTP_STATUS.UNAUTHORIZED);

  const { sessionId } = AIEndSchema.parse(await req.json());

  const callSession = await prisma.callSession.findUnique({
    where: { id: sessionId },
    include: { aiConsultant: true, user: { include: { wallet: true } } },
  });
  if (!callSession) throw new AppError("Session not found", HTTP_STATUS.NOT_FOUND);
  if (callSession.userId !== userId) {
    throw new AppError("Not authorized", HTTP_STATUS.FORBIDDEN);
  }

  const durationSeconds = Math.floor(
    (Date.now() - callSession.startTime.getTime()) / 1000,
  );
  const minutes = durationSeconds / 60;
  const amount = minutes * (callSession.aiConsultant?.perMinuteRate || 0);

  const updated = await prisma.callSession.update({
    where: { id: sessionId },
    data: {
      endTime: new Date(),
      durationSeconds,
      status: "ENDED",
      amount,
    },
  });

  if (amount > 0) {
    const wallet = await prisma.wallet.findUnique({
      where: { userId: callSession.userId },
    });
    if (!wallet) throw new AppError("Wallet not found", HTTP_STATUS.NOT_FOUND);
    await Ledger.createTransaction({
      walletId: wallet.id,
      type: "PAYMENT",
      amount: -amount,
      description: `AI Chat with ${callSession.aiConsultant?.name || "AI"}`,
      referenceId: sessionId,
    });
  }

  return NextResponse.json({ session: updated, charged: amount });
});
