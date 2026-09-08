import { NextResponse } from 'next/server';
import { prisma } from '@zeal/database';
import { Ledger } from '@/lib/wallet/ledger';
import { withErrorHandler, AppError } from '@/lib/errors';
import crypto from 'crypto';

// Verify Razorpay webhook signature
function verifySignature(body: string, signature: string, secret: string): boolean {
  const expected = crypto
    .createHmac('sha256', secret)
    .update(body)
    .digest('hex');
  return expected === signature;
}

export const POST = withErrorHandler(async (req: Request) => {
  const body = await req.text();
  const signature = req.headers.get('x-razorpay-signature') || '';
  const secret = process.env.RAZORPAY_KEY_SECRET;

  if (!secret) {
    throw new AppError('Razorpay secret not configured', 500, 'CONFIG_ERROR');
  }

  // Verify signature – reject if invalid
  if (!verifySignature(body, signature, secret)) {
    throw new AppError('Invalid webhook signature', 401, 'WEBHOOK_INVALID');
  }

  const payload = JSON.parse(body);
  const { event, payload: eventPayload } = payload;

  if (event === 'payment.captured') {
    const orderId = eventPayload.payment.order_id;
    const amount = eventPayload.payment.amount / 100;

    // Find the pending transaction by referenceId
    const pendingTx = await prisma.transaction.findFirst({
      where: {
        referenceId: orderId,
        type: 'TOPUP',
      },
    });
    if (!pendingTx) {
      throw new AppError('Pending transaction not found', 404, 'TRANSACTION_NOT_FOUND');
    }

    // Credit the wallet using the ledger – this is immutable and atomic
    await Ledger.createTransaction({
      walletId: pendingTx.walletId,
      type: 'TOPUP',
      amount: amount,
      description: `Razorpay payment captured: ${orderId}`,
      referenceId: orderId,
    });
  }

  return NextResponse.json({ received: true, success: true });
});
