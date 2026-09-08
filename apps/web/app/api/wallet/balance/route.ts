import { getUserId } from "@/lib/auth";
import { NextResponse } from "next/server";
import { prisma } from "@zeal/database";
import { withErrorHandler, AppError, HTTP_STATUS } from "@/lib/errors";

export const GET = withErrorHandler(async () => {
  const userId = await getUserId();
  if (!userId) throw new AppError("Unauthorized", HTTP_STATUS.UNAUTHORIZED);

  const wallet = await prisma.wallet.findUnique({
    where: { userId },
  });
  if (!wallet) throw new AppError("Wallet not found", HTTP_STATUS.NOT_FOUND);

  return NextResponse.json({
    wallet: {
      id: wallet.id,
      balance: wallet.balance,
      escrow: wallet.escrow,
      pendingIn: wallet.pendingIn,
      pendingOut: wallet.pendingOut,
      blocked: wallet.blocked,
    },
  });
});
