import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@zeal/database';
import { Ledger } from '@/lib/wallet/ledger';
import { NotificationService } from '@/lib/notifications/service';
import { withErrorHandler, AppError } from '@/lib/errors';

export const POST = withErrorHandler(async (
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { userId } = await auth();
  if (!userId) throw new AppError('Unauthorized', 401, 'UNAUTHORIZED');
  const { id } = await params;

  const booking = await prisma.booking.findFirst({
    where: { id, userId },
    include: { consultant: { include: { user: true } } },
  });
  if (!booking) throw new AppError('Booking not found', 404, 'BOOKING_NOT_FOUND');

  if (booking.status === 'CONFIRMED') {
    await Ledger.createTransaction({
      walletId: booking.userId!,
      type: 'REFUND',
      amount: booking.amount,
      description: `Refund for cancelled booking ${booking.id}`,
      referenceId: booking.id,
    });
  }

  const updated = await prisma.booking.update({
    where: { id },
    data: { status: 'CANCELLED' },
  });

  await NotificationService.createNotification({
    userId: booking.consultant.userId,
    type: 'booking_cancelled',
    message: `Booking cancelled by user`,
    redirectUrl: `/admin/bookings/${booking.id}`,
    actorId: userId,
  });

  return NextResponse.json({ booking: updated });
});
