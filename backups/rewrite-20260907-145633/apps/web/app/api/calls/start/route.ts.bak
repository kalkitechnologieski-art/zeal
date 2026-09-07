import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@zeal/database';
import { generateToken } from '@/lib/livekit/room';
import { CallBilling } from '@/lib/calls/billing';
import { withErrorHandler, AppError } from '@/lib/errors';

export const POST = withErrorHandler(async (req: Request) => {
  const { userId } = await auth();
  if (!userId) throw new AppError('Unauthorized', 401, 'UNAUTHORIZED');

  const { bookingId } = await req.json();
  if (!bookingId) throw new AppError('Booking ID required', 400, 'MISSING_BOOKING_ID');

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { consultant: true },
  });
  if (!booking) throw new AppError('Booking not found', 404, 'BOOKING_NOT_FOUND');

  const session = await prisma.callSession.create({
    data: {
      bookingId: booking.id,
      userId: userId,
      consultantId: booking.consultantId,
      startTime: new Date(),
      status: 'INITIATED',
    },
  });

  const roomName = `booking-${bookingId}`;
  const token = await generateToken(roomName, userId);

  CallBilling.startBilling(session.id, booking.consultant.perMinuteRate);

  return NextResponse.json({ sessionId: session.id, token });
});
