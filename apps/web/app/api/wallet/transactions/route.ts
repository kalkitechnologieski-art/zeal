import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@zeal/database';
import { Ledger } from '@/lib/wallet/ledger';
import { withErrorHandler, AppError } from '@/lib/errors';

export const GET = withErrorHandler(async (req: Request) => {
  const { userId } = await auth();
  if (!userId) throw new AppError('Unauthorized', 401, 'UNAUTHORIZED');

  const wallet = await prisma.wallet.findUnique({ where: { userId } });
  if (!wallet) throw new AppError('Wallet not found', 404, 'WALLET_NOT_FOUND');

  const url = new URL(req.url);
  const limit = parseInt(url.searchParams.get('limit') || '50');
  const offset = parseInt(url.searchParams.get('offset') || '0');
  const type = url.searchParams.get('type') as any;

  const result = await Ledger.getTransactions(wallet.id, { limit, offset, type });
  return NextResponse.json(result);
});
