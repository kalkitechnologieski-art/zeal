import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@zeal/database";
import { withErrorHandler, AppError, HTTP_STATUS } from "@/lib/errors";
import { Ledger } from "@/lib/wallet/ledger";
import { AIEndSchema } from "@/lib/validation";

export const POST = withErrorHandler(async (req: Request) => {
  const supabase = createServerClientFromCookies();
  const { data: { session } } = await supabase.auth.getSession();
  const userId = session?.user?.id;
  if (!userId) throw new AppError("Unauthorized", HTTP_STATUS.UNAUTHORIZED);

  const { sessionId } = AIEndSchema.parse(await req.json());

  const session = await prisma.callSession.findUnique({
    where: { id: sessionId },
    include: { aiConsultant: true, user: { include: { wallet: true } } },
  });
  if (!session) throw new AppError("Session not found", HTTP_STATUS.NOT_FOUND);
  if (session.userId !== userId) {
    throw new AppError("Not authorized", HTTP_STATUS.FORBIDDEN);
  }

  const durationSeconds = Math.floor(
    (Date.now() - session.startTime.getTime()) / 1000,
  );
  const minutes = durationSeconds / 60;
  const amount = minutes * (session.aiConsultant?.perMinuteRate || 0);

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
      where: { userId: session.userId },
    });
    if (!wallet) throw new AppError("Wallet not found", HTTP_STATUS.NOT_FOUND);
    await Ledger.createTransaction({
      walletId: wallet.id,
      type: "PAYMENT",
      amount: -amount,
      description: `AI Chat with ${session.aiConsultant?.name || "AI"}`,
      referenceId: sessionId,
    });
  }

  return NextResponse.json({ session: updated, charged: amount });
});
