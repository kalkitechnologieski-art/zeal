import { NextResponse } from "next/server";
import { prisma, withTransaction } from "@zeal/database";
import { getUserId } from "@/lib/auth";
import { withErrorHandler, AppError, ErrorCode } from "@/lib/errors";
import { serverPublish } from "@/lib/realtime/server";

const REWARDS: Record<string, number> = {
  "daily-post": 25,
  "daily-cheer": 30,
  "daily-comment": 20,
  "daily-follow": 15,
  "weekly-streak": 100,
  "weekly-session": 75,
};

export const POST = withErrorHandler(
  async (_req: Request, { params }: { params: Promise<{ questId: string }> }) => {
    const userId = await getUserId();
    if (!userId) throw new AppError("Unauthorized", 401, ErrorCode.AUTH_UNAUTHORIZED);
    const { questId } = await params;

    const reward = REWARDS[questId];
    if (!reward) throw new AppError("Unknown quest", 404, ErrorCode.NOT_FOUND);

    const referenceId = "quest-claim:" + userId + ":" + questId + ":" + new Date().toISOString().slice(0, 10);
    const existing = await prisma.transaction.findFirst({ where: { referenceId } });
    if (existing) return NextResponse.json({ alreadyClaimed: true });

    const user = await withTransaction(async (tx) => {
      const updated = await tx.user.update({
        where: { id: userId },
        data: { sparks: { increment: reward } },
        select: { sparks: true },
      });
      const wallet = await tx.wallet.findUnique({ where: { userId } });
      if (wallet) {
        await tx.transaction.create({
          data: {
            walletId: wallet.id,
            type: "TOPUP",
            amount: 0,
            balance: wallet.balance,
            description: "Quest " + questId + ": +" + reward + " Sparks",
            referenceId,
            metadata: { questId, reward, kind: "sparks" },
          },
        });
      }
      return updated;
    });

    await serverPublish("user:" + userId, "sparks:updated", { sparks: user.sparks, delta: reward });

    return NextResponse.json({ success: true, sparks: user.sparks, reward });
  },
);

