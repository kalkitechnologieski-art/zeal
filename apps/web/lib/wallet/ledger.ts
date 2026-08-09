import { prisma, TransactionType } from '@zeal/database';
import { AppError } from '@/lib/errors';

export class Ledger {
  static async createTransaction(data: {
    walletId: string;
    type: TransactionType;
    amount: number;
    description: string;
    referenceId?: string;
    metadata?: any;
  }): Promise<any> {
    return prisma.$transaction(async (tx) => {
      const wallet = await tx.wallet.findUnique({
        where: { id: data.walletId },
        select: { balance: true },
      });
      if (!wallet) throw new AppError('Wallet not found', 404, 'WALLET_NOT_FOUND');

      const newBalance = wallet.balance + data.amount;
      if (newBalance < 0) {
        throw new AppError('Insufficient balance', 400, 'INSUFFICIENT_BALANCE');
      }

      const transaction = await tx.transaction.create({
        data: {
          walletId: data.walletId,
          type: data.type,
          amount: data.amount,
          balance: newBalance,
          description: data.description,
          referenceId: data.referenceId,
          metadata: data.metadata,
        },
      });

      await tx.wallet.update({
        where: { id: data.walletId },
        data: { balance: newBalance },
      });

      return transaction;
    });
  }

  static async getBalance(walletId: string): Promise<number> {
    const wallet = await prisma.wallet.findUnique({
      where: { id: walletId },
      select: { balance: true },
    });
    if (!wallet) throw new AppError('Wallet not found', 404, 'WALLET_NOT_FOUND');
    return wallet.balance;
  }

  static async getTransactions(
    walletId: string,
    options?: { limit?: number; offset?: number; type?: TransactionType }
  ): Promise<{ items: any[]; total: number }> {
    const where: any = { walletId };
    if (options?.type) where.type = options.type;

    const [items, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: options?.limit || 50,
        skip: options?.offset || 0,
      }),
      prisma.transaction.count({ where }),
    ]);
    return { items, total };
  }
}
