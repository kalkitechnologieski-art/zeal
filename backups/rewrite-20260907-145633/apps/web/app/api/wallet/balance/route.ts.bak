import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@zeal/database';
import { Ledger } from '@/lib/wallet/ledger';
import { withErrorHandler, AppError } from '@/lib/errors';

export const GET = withErrorHandler(async () => {
  const { userId } = await auth();
  if (!userId) throw new AppError('Unauthorized', 401, 'UNAUTHORIZED');

  const wallet = await prisma.wallet.findUnique({ where: { userId } });
  if (!wallet) throw new AppError('Wallet not found', 404, 'WALLET_NOT_FOUND');

  const balance = await Ledger.getBalance(wallet.id);
  return NextResponse.json({ balance, wallet });
});
