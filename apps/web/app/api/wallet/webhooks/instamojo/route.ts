import { NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@zeal/database";
import { withErrorHandler, AppError, ErrorCode } from "@/lib/errors";
import { Ledger } from "@/lib/wallet/ledger";
import { serverPublish } from "@/lib/realtime/server";

interface InstamojoPayload {
  payment_request_id?: string;
  payment_status?: string;
  amount?: string | number;
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
  const body = await req.text();
  const signature = req.headers.get("x-signature") || "";
  const secret = process.env.INSTAMOJO_WEBHOOK_SECRET;

  if (!secret) {
    throw new AppError(
      "Instamojo webhook secret missing",
      500,
      ErrorCode.CONFIG_ERROR,
    );
  }

  // Always return 200 on bad signature
  if (!verifySignature(body, signature, secret)) {
    return NextResponse.json({ received: true, ignored: "bad-signature" });
  }

  let payload: InstamojoPayload;
  try {
    payload = JSON.parse(body);
  } catch {
    return NextResponse.json({ received: true });
  }

  const { payment_request_id, payment_status, amount } = payload;

  if (payment_status === "Credit" && payment_request_id) {
    const pendingTx = await prisma.transaction.findFirst({
      where: { referenceId: payment_request_id, type: "TOPUP" },
      orderBy: { createdAt: "desc" },
    });

    if (!pendingTx) {
      console.warn(
        "[Instamojo] No pending tx for " + payment_request_id,
      );
      return NextResponse.json({ received: true });
    }

    const creditRef = "instamojo:" + payment_request_id;
    const alreadyCredited = await Ledger.getByReferenceId(creditRef);
    if (alreadyCredited) {
      return NextResponse.json({ received: true, ignored: "already-credited" });
    }

    const creditAmount = Number(amount || 0);

    await Ledger.createTransaction({
      walletId: pendingTx.walletId,
      type: "TOPUP",
      amount: creditAmount,
      description: "Instamojo payment " + payment_request_id,
      referenceId: creditRef,
    });

    // Notify the wallet owner
    const wallet = await prisma.wallet.findUnique({
      where: { id: pendingTx.walletId },
      select: { userId: true, balance: true },
    });
    if (wallet) {
      await serverPublish("user:" + wallet.userId, "wallet:updated", {
        balance: wallet.balance,
        delta: creditAmount,
      });
    }

    return NextResponse.json({ received: true, credited: creditAmount });
  }

  return NextResponse.json({ received: true });
});

