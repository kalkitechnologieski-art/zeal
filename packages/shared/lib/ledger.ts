import { prisma, TransactionType } from '@zeal/database';

export class Ledger {
  static async createTransaction(data: {
    walletId: string;
    type: TransactionType;
    amount: number;
    description: string;
    referenceId?: string;
    metadata?: any;
  }): Promise<{ id: string; balance: number }> {
    // Get current balance with row lock
    const wallet = await prisma.wallet.findUnique({
      where: { id: data.walletId },
    });
    if (!wallet) throw new Error('Wallet not found');

    const newBalance = wallet.balance + data.amount;
    if (newBalance < 0) throw new Error('Insufficient balance');

    // Create transaction and update wallet in a transaction
    const [transaction] = await prisma.$transaction([
      prisma.transaction.create({
        data: {
          walletId: data.walletId,
          type: data.type,
          amount: data.amount,
          balance: newBalance,
          description: data.description,
          referenceId: data.referenceId,
          metadata: data.metadata,
        },
      }),
      prisma.wallet.update({
        where: { id: data.walletId },
        data: { balance: newBalance },
      }),
    ]);
    return { id: transaction.id, balance: newBalance };
  }

  static async getBalance(walletId: string): Promise<number> {
    const wallet = await prisma.wallet.findUnique({
      where: { id: walletId },
      select: { balance: true },
    });
    return wallet?.balance ?? 0;
  }
}
