import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@zeal/database';
import { generateToken } from '@/lib/livekit/room';
import { withErrorHandler, AppError } from '@/lib/errors';

export const GET = withErrorHandler(async (req: Request) => {
  const { userId } = await auth();
  if (!userId) throw new AppError('Unauthorized', 401, 'UNAUTHORIZED');

  const url = new URL(req.url);
  const bookingId = url.searchParams.get('bookingId');
  if (!bookingId) throw new AppError('Booking ID required', 400, 'MISSING_BOOKING_ID');

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { consultant: true },
  });
  if (!booking) throw new AppError('Booking not found', 404, 'BOOKING_NOT_FOUND');

  if (booking.userId !== userId && booking.consultant.userId !== userId) {
    throw new AppError('Not authorized', 403, 'FORBIDDEN');
  }

  const roomName = `booking-${bookingId}`;
  const token = await generateToken(roomName, userId);

  return NextResponse.json({ token, wsUrl: process.env.LIVEKIT_WS_URL });
});
