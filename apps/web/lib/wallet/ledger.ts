import { prisma, withTransaction, TransactionType } from "@zeal/database";
import { AppError, ErrorCode, InsufficientBalanceError } from "@/lib/errors";

export interface LedgerEntry {
  walletId: string;
  type: TransactionType;
  amount: number;
  description: string;
  referenceId?: string;
  metadata?: Record<string, unknown>;
  counterpartyId?: string;
  category?: string;
}

export class Ledger {
  private static readonly MAX_RETRIES = 3;

  static async createTransaction(entry: LedgerEntry): Promise<{
    id: string;
    balance: number;
    counterpartyTransactionId?: string;
  }> {
    if (entry.amount === 0) {
      throw new AppError("Transaction amount must be non-zero", 400, ErrorCode.VALIDATION_INPUT);
    }

    return withTransaction(
      async (tx) => {
        const wallet = await tx.wallet.findUnique({
          where: { id: entry.walletId },
          select: { id: true, balance: true, userId: true },
        });
        if (!wallet) throw new AppError("Wallet not found", 404, ErrorCode.WALLET_NOT_FOUND);

        const newBalance = wallet.balance + entry.amount;
        if (entry.amount < 0 && newBalance < 0) {
          throw new InsufficientBalanceError(Math.abs(entry.amount), wallet.balance);
        }

        const transaction = await tx.transaction.create({
          data: {
            walletId: entry.walletId,
            type: entry.type,
            amount: entry.amount,
            balance: newBalance,
            description: entry.description,
            referenceId: entry.referenceId,
            metadata: {
              ...entry.metadata,
              counterpartyId: entry.counterpartyId,
              category: entry.category,
              ledgerVersion: 2,
            },
          },
        });

        await tx.wallet.update({
          where: { id: entry.walletId },
          data: { balance: newBalance },
        });

        let counterpartyTransactionId: string | undefined;
        if (entry.counterpartyId && entry.amount !== 0) {
          const counterpartyWallet = await tx.wallet.findUnique({
            where: { id: entry.counterpartyId },
          });
          if (counterpartyWallet) {
            const counterpartyBalance = counterpartyWallet.balance - entry.amount;
            const ct = await tx.transaction.create({
              data: {
                walletId: entry.counterpartyId,
                type: entry.type === "PAYMENT" ? "COMMISSION" : 
                      entry.type === "TOPUP" ? "PAYMENT" : "COMMISSION",
                amount: -entry.amount,
                balance: counterpartyBalance,
                description: `Counterparty: ${entry.description}`,
                referenceId: entry.referenceId,
                metadata: { originalTransactionId: transaction.id, ledgerVersion: 2 },
              },
            });
            await tx.wallet.update({
              where: { id: entry.counterpartyId },
              data: { balance: counterpartyBalance },
            });
            counterpartyTransactionId = ct.id;
          }
        }

        return {
          id: transaction.id,
          balance: newBalance,
          counterpartyTransactionId,
        };
      },
      { maxRetries: Ledger.MAX_RETRIES, isolationLevel: "Serializable" },
    );
  }

  static async getBalance(walletId: string): Promise<number> {
    const wallet = await prisma.wallet.findUnique({
      where: { id: walletId },
      select: { balance: true },
    });
    if (!wallet) throw new AppError("Wallet not found", 404, ErrorCode.WALLET_NOT_FOUND);
    return wallet.balance;
  }

  static async getTransactions(
    walletId: string,
    options?: {
      limit?: number;
      offset?: number;
      type?: TransactionType;
      fromDate?: Date;
      toDate?: Date;
      referenceId?: string;
    },
  ) {
    const limit = options?.limit || 50;
    const offset = options?.offset || 0;
    const where: any = { walletId };
    if (options?.type) where.type = options.type;
    if (options?.fromDate) where.createdAt = { gte: options.fromDate };
    if (options?.toDate) where.createdAt = { ...where.createdAt, lte: options.toDate };
    if (options?.referenceId) where.referenceId = options.referenceId;

    const [items, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: limit,
        skip: offset,
      }),
      prisma.transaction.count({ where }),
    ]);

    return {
      items,
      total,
      pagination: { limit, offset, hasMore: offset + limit < total },
    };
  }

  static async getByReferenceId(referenceId: string) {
    return prisma.transaction.findFirst({
      where: { referenceId },
      orderBy: { createdAt: "desc" },
    });
  }

  static async reconcile(walletId: string) {
    const wallet = await prisma.wallet.findUnique({ where: { id: walletId } });
    if (!wallet) throw new AppError("Wallet not found", 404, ErrorCode.WALLET_NOT_FOUND);

    const transactions = await prisma.transaction.findMany({
      where: { walletId },
      orderBy: { createdAt: "asc" },
    });

    let expectedBalance = 0;
    for (const tx of transactions) expectedBalance += tx.amount;

    return {
      expectedBalance,
      actualBalance: wallet.balance,
      difference: wallet.balance - expectedBalance,
      transactions,
    };
  }
}

// BATCH1_APPLIED
