import { Ledger } from '@/lib/wallet/ledger';
import { prisma } from '@zeal/database';
import { AppError } from '@/lib/errors';

export class CallBilling {
  static async startBilling(sessionId: string, ratePerMinute: number) {
    console.log(`Starting billing for session ${sessionId} at ₹${ratePerMinute}/min`);
  }

  static async chargeForMinute(sessionId: string, amount: number) {
    const session = await prisma.callSession.findUnique({
      where: { id: sessionId },
      include: { booking: true },
    });
    if (!session) throw new AppError('Session not found', 404, 'SESSION_NOT_FOUND');
    if (!session.booking) throw new AppError('Booking not found', 404, 'BOOKING_NOT_FOUND');

    await Ledger.createTransaction({
      walletId: session.booking.userId!,
      type: 'PAYMENT',
      amount: -amount,
      description: `Call minute (session ${sessionId})`,
      referenceId: sessionId,
    });
  }

  static async endSession(sessionId: string) {
    const session = await prisma.callSession.update({
      where: { id: sessionId },
      data: {
        endTime: new Date(),
        status: 'ENDED',
      },
    });
    return session;
  }
}
