import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@zeal/database";
import { withErrorHandler, AppError, HTTP_STATUS } from "@/lib/errors";
import { instamojo } from "@/lib/wallet/instamojo";
import { TopupSchema } from "@/lib/validation";

export const POST = withErrorHandler(async (req: Request) => {
  const supabase = createServerClientFromCookies();
  const { data: { session } } = await supabase.auth.getSession();
  const userId = session?.user?.id;
  if (!userId) throw new AppError("Unauthorized", HTTP_STATUS.UNAUTHORIZED);

  const { amount } = TopupSchema.parse(await req.json());

  let wallet = await prisma.wallet.findUnique({ where: { userId } });
  if (!wallet) {
    wallet = await prisma.wallet.create({
      data: { userId, balance: 0, escrow: 0, pendingIn: 0, pendingOut: 0, blocked: 0 },
    });
  }

  const paymentRequest = await instamojo.createPaymentRequest({
    amount,
    purpose: "Zeal Wallet Top-up",
    redirect_url: `${process.env.NEXT_PUBLIC_APP_URL}/wallet`,
    webhook_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/wallet/webhooks/instamojo`,
  });

  await prisma.transaction.create({
    data: {
      walletId: wallet.id,
      type: "TOPUP",
      amount: 0,
      balance: wallet.balance,
      description: `Instamojo payment request ${paymentRequest.id}`,
      referenceId: paymentRequest.id,
      metadata: { paymentRequestId: paymentRequest.id, amount },
    },
  });

  return NextResponse.json({
    paymentRequestId: paymentRequest.id,
    longurl: paymentRequest.longurl,
    amount: paymentRequest.amount,
  });
});
