// Per-minute call billing via immutable Ledger
import { prisma } from "@zeal/database";
import { AppError, ErrorCode } from "@/lib/errors";
import { Ledger } from "@/lib/wallet/ledger";

export interface BillingTickResult {
  charged: boolean;
  amount: number;
  reason?: string;
}

export class CallBilling {
  /**
   * Charge a single minute of a call session.
   * Idempotent: uses `${sessionId}:${minuteNumber}` as referenceId.
   */
  static async chargeMinute(params: {
    sessionId: string;
    minuteNumber: number;
    amount: number;
    payerUserId: string;
    payeeUserId?: string;
  }): Promise<BillingTickResult> {
    const { sessionId, minuteNumber, amount, payerUserId, payeeUserId } = params;

    if (amount <= 0) {
      return { charged: false, amount: 0, reason: "zero-amount" };
    }

    const referenceId = `${sessionId}:min:${minuteNumber}`;

    // Idempotency check
    const existing = await Ledger.getByReferenceId(referenceId);
    if (existing) {
      return { charged: false, amount: 0, reason: "already-charged" };
    }

    const payerWallet = await prisma.wallet.findUnique({
      where: { userId: payerUserId },
      select: { id: true, balance: true },
    });

    if (!payerWallet) {
      throw new AppError("Payer wallet not found", 404, ErrorCode.WALLET_NOT_FOUND);
    }

    if (payerWallet.balance < amount) {
      return { charged: false, amount: 0, reason: "insufficient-balance" };
    }

    // Debit payer
    await Ledger.createTransaction({
      walletId: payerWallet.id,
      type: "PAYMENT",
      amount: -amount,
      description: `Call minute #${minuteNumber} (session ${sessionId})`,
      referenceId,
      metadata: { sessionId, minuteNumber },
    });

    // Credit consultant (if applicable)
    if (payeeUserId) {
      const platformFeePct = 0.10;
      const consultantShare = amount * (1 - platformFeePct);
      const payeeWallet = await prisma.wallet.findUnique({
        where: { userId: payeeUserId },
        select: { id: true },
      });
      if (payeeWallet) {
        await Ledger.createTransaction({
          walletId: payeeWallet.id,
          type: "COMMISSION",
          amount: consultantShare,
          description: `Call earning #${minuteNumber} (session ${sessionId})`,
          referenceId: `${referenceId}:payee`,
          metadata: { sessionId, minuteNumber },
        });
      }
    }

    return { charged: true, amount };
  }

  /**
   * Settle the final partial minute when a session ends.
   */
  static async settleFinalMinute(params: {
    sessionId: string;
    totalSeconds: number;
    ratePerMinute: number;
    payerUserId: string;
    payeeUserId?: string;
  }): Promise<BillingTickResult> {
    const { sessionId, totalSeconds, ratePerMinute, payerUserId, payeeUserId } = params;

    // Calculate what's been paid via full minutes
    const fullMinutes = Math.floor(totalSeconds / 60);
    const remainder = totalSeconds % 60;

    if (remainder === 0) return { charged: false, amount: 0 };

    const amount = (remainder / 60) * ratePerMinute;
    if (amount < 0.01) return { charged: false, amount: 0 };

    return this.chargeMinute({
      sessionId,
      minuteNumber: fullMinutes + 1,
      amount,
      payerUserId,
      payeeUserId,
    });
  }
}

// BATCH2_APPLIED
