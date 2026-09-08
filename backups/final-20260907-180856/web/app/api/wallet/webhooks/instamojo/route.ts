import { NextResponse } from "next/server";
import { prisma } from "@zeal/database";
import { instamojo } from "@/lib/wallet/instamojo";
import { Ledger } from "@/lib/wallet/ledger";
import { withErrorHandler, AppError, HTTP_STATUS } from "@/lib/errors";

export const POST = withErrorHandler(async (req: Request) => {
  const body = await req.text();
  const signature = req.headers.get("x-signature") || "";

  // Verify webhook signature
  if (!instamojo.verifyWebhook(body, signature)) {
    throw new AppError("Invalid webhook signature", HTTP_STATUS.UNAUTHORIZED);
  }

  const payload = JSON.parse(body);
  const { payment_request_id, payment_status, amount } = payload;

  if (payment_status === "Credit") {
    // Find the pending transaction using the payment request ID as reference
    const pendingTx = await prisma.transaction.findFirst({
      where: {
        referenceId: payment_request_id,
        type: "TOPUP",
      },
    });

    if (!pendingTx) {
      // If no pending transaction found, we may have already processed it or it's invalid.
      // Log and return success (idempotent).
      console.warn(`No pending transaction found for payment_request_id: ${payment_request_id}`);
      return NextResponse.json({ received: true });
    }

    // Credit the wallet using the immutable ledger
    await Ledger.createTransaction({
      walletId: pendingTx.walletId,
      type: "TOPUP",
      amount: Number(amount),
      description: `Instamojo payment ${payment_request_id}`,
      referenceId: payment_request_id,
    });
  }

  // Always respond with 200 OK to acknowledge receipt
  return NextResponse.json({ received: true });
});
