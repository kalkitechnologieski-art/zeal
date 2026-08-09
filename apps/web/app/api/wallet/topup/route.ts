import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@zeal/database';
import { createOrder } from '@/lib/wallet/razorpay';
import { withErrorHandler, AppError, ValidationError } from '@/lib/errors';
import { TopupSchema } from '@zeal/types';

export const POST = withErrorHandler(async (req: Request) => {
  const { userId } = await auth();
  if (!userId) throw new AppError('Unauthorized', 401, 'UNAUTHORIZED');

  const body = await req.json();
  const parsed = TopupSchema.safeParse(body);
  if (!parsed.success) {
    throw new ValidationError('Invalid top-up data', parsed.error.flatten());
  }
  const { amount } = parsed.data;

  let wallet = await prisma.wallet.findUnique({ where: { userId } });
  if (!wallet) {
    wallet = await prisma.wallet.create({
      data: { userId, balance: 0, escrow: 0, pendingIn: 0, pendingOut: 0, blocked: 0 },
    });
  }

  // Create Razorpay order
  const order = await createOrder(amount, 'INR', `topup_${userId}_${Date.now()}`);

  // Store pending transaction (will be confirmed by webhook)
  await prisma.transaction.create({
    data: {
      walletId: wallet.id,
      type: 'TOPUP',
      amount: amount,
      balance: wallet.balance,
      description: `Razorpay top-up order ${order.id}`,
      referenceId: order.id,
      metadata: { order_id: order.id, amount: order.amount / 100 },
    },
  });

  return NextResponse.json({
    orderId: order.id,
    amount: Number(order.amount) / 100,
    currency: order.currency,
    key: process.env.RAZORPAY_KEY_ID,
    // You can also pass a redirect URL or checkout options here
  });
});
