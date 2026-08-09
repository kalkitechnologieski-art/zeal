import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@zeal/database';
import { generateMeetingLink } from '@/lib/livekit/room';
import { NotificationService } from '@/lib/notifications/service';
import { withErrorHandler, AppError } from '@/lib/errors';

export const POST = withErrorHandler(async (
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { userId } = await auth();
  if (!userId) throw new AppError('Unauthorized', 401, 'UNAUTHORIZED');
  const { id } = await params;

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || (user.role !== 'HEALER' && user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN')) {
    throw new AppError('Forbidden', 403, 'FORBIDDEN');
  }

  const booking = await prisma.booking.findUnique({
    where: { id },
    include: {
      consultant: {
        include: { user: true }, // 👈 include user to access name
      },
    },
  });
  if (!booking) throw new AppError('Booking not found', 404, 'BOOKING_NOT_FOUND');

  if (user.role === 'HEALER' && booking.consultant.userId !== userId) {
    throw new AppError('Not your booking', 403, 'FORBIDDEN');
  }

  const meetingLink = await generateMeetingLink(booking.id);
  const updated = await prisma.booking.update({
    where: { id },
    data: { status: 'CONFIRMED', meetingLink },
  });

  await NotificationService.createNotification({
    userId: booking.userId!,
    type: 'booking_confirmed',
    message: `Your booking with ${booking.consultant.user.name} is confirmed!`,
    redirectUrl: `/booking/${booking.id}`,
    actorId: userId,
  });

  return NextResponse.json({ booking: updated });
});
