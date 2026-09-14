import { NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@zeal/database";
import { withErrorHandler, AppError, ErrorCode } from "@/lib/errors";
import { Ledger } from "@/lib/wallet/ledger";
import { serverPublish } from "@/lib/realtime/server";

interface RazorpayWebhookPayload {
  event: string;
  payload: {
    payment?: {
      entity: {
        id: string;
        order_id: string;
        amount: number;
        currency: string;
        status: string;
      };
    };
  };
}

function verifySignature(body: string, signature: string, secret: string): boolean {
  const expected = crypto
    .createHmac("sha256", secret)
    .update(body)
    .digest("hex");
  if (expected.length !== signature.length) return false;
  try {
    return crypto.timingSafeEqual(
      Buffer.from(expected),
      Buffer.from(signature),
    );
  } catch {
    return false;
  }
}

export const POST = withErrorHandler(async (req: Request) => {
  const rawBody = await req.text();
  const signature = req.headers.get("x-razorpay-signature") || "";
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;

  if (!secret) {
    throw new AppError(
      "Razorpay webhook secret missing",
      500,
      ErrorCode.CONFIG_ERROR,
    );
  }

  // Always return 200 on bad signature — Razorpay retries on 4xx
  if (!verifySignature(rawBody, signature, secret)) {
    return NextResponse.json({ received: true, ignored: "bad-signature" });
  }

  let payload: RazorpayWebhookPayload;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ received: true });
  }

  if (payload.event === "payment.captured") {
    const payment = payload.payload.payment?.entity;
    if (!payment) {
      return NextResponse.json({ received: true, ignored: "no-payment" });
    }

    const orderId = payment.order_id;
    const amount = payment.amount / 100;

    const pendingTx = await prisma.transaction.findFirst({
      where: { referenceId: orderId, type: "TOPUP" },
      orderBy: { createdAt: "desc" },
    });
    if (!pendingTx) {
      return NextResponse.json({ received: true, ignored: "no-pending-tx" });
    }

    const creditRef = "razorpay:" + payment.id;
    const alreadyCredited = await Ledger.getByReferenceId(creditRef);
    if (alreadyCredited) {
      return NextResponse.json({ received: true, ignored: "already-credited" });
    }

    await Ledger.createTransaction({
      walletId: pendingTx.walletId,
      type: "TOPUP",
      amount,
      description: "Razorpay topup (" + payment.id + ")",
      referenceId: creditRef,
      metadata: { orderId, paymentId: payment.id },
    });

    // Notify the wallet owner
    const wallet = await prisma.wallet.findUnique({
      where: { id: pendingTx.walletId },
      select: { userId: true, balance: true },
    });
    if (wallet) {
      await serverPublish("user:" + wallet.userId, "wallet:updated", {
        balance: wallet.balance,
        delta: amount,
      });
    }

    return NextResponse.json({ received: true, credited: amount });
  }

  return NextResponse.json({ received: true, ignored: payload.event });
});

