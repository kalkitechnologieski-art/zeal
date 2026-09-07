import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@zeal/database';
import { Ledger } from '@/lib/wallet/ledger';
import { generateMeetingLink } from '@/lib/livekit/room';
import { NotificationService } from '@/lib/notifications/service';
import { withErrorHandler, AppError, ValidationError } from '@/lib/errors';
import { CreateBookingSchema } from '@zeal/types';

export const POST = withErrorHandler(async (req: Request) => {
  const { userId } = await auth();
  if (!userId) throw new AppError('Unauthorized', 401, 'UNAUTHORIZED');

  const body = await req.json();
  const parsed = CreateBookingSchema.safeParse(body);
  if (!parsed.success) {
    throw new ValidationError('Invalid booking data', parsed.error.flatten());
  }

  const { consultantId, scheduledAt, durationMinutes, externalEmail } = parsed.data;

  const consultant = await prisma.consultant.findUnique({
    where: { id: consultantId },
    include: { user: true },
  });
  if (!consultant) throw new AppError('Consultant not found', 404, 'CONSULTANT_NOT_FOUND');

  const amount = (durationMinutes / 60) * consultant.perMinuteRate;
  const platformFee = amount * 0.10;
  const consultantEarning = amount - platformFee;

  const userWallet = await prisma.wallet.findUnique({ where: { userId } });
  if (!userWallet) throw new AppError('Wallet not found', 404, 'WALLET_NOT_FOUND');

  let paymentId = null;
  if (!externalEmail) {
    await Ledger.createTransaction({
      walletId: userWallet.id,
      type: 'PAYMENT',
      amount: -amount,
      description: `Booking with ${consultant.user.name}`,
    });
  }

  const booking = await prisma.booking.create({
    data: {
      userId: externalEmail ? null : userId,
      consultantId,
      scheduledAt: new Date(scheduledAt),
      durationMinutes,
      amount,
      platformFee,
      consultantEarning,
      externalEmail,
      status: externalEmail ? 'PENDING' : 'CONFIRMED',
      paymentId: paymentId || undefined,
    },
  });

  if (booking.status === 'CONFIRMED') {
    const meetingLink = await generateMeetingLink(booking.id);
    await prisma.booking.update({
      where: { id: booking.id },
      data: { meetingLink },
    });
    await NotificationService.createNotification({
      userId: booking.userId!,
      type: 'booking_confirmed',
      message: `Your booking with ${consultant.user.name} is confirmed for ${booking.scheduledAt}`,
      redirectUrl: `/booking/${booking.id}`,
      actorId: consultant.userId,
    });
  }

  return NextResponse.json({ booking });
});

export const GET = withErrorHandler(async (req: Request) => {
  const { userId } = await auth();
  if (!userId) throw new AppError('Unauthorized', 401, 'UNAUTHORIZED');

  const url = new URL(req.url);
  const status = url.searchParams.get('status') as any;
  const limit = parseInt(url.searchParams.get('limit') || '50');
  const offset = parseInt(url.searchParams.get('offset') || '0');

  const where: any = { userId };
  if (status) where.status = status;

  const [items, total] = await Promise.all([
    prisma.booking.findMany({
      where,
      include: { consultant: { include: { user: true } } },
      orderBy: { scheduledAt: 'desc' },
      take: limit,
      skip: offset,
    }),
    prisma.booking.count({ where }),
  ]);

  return NextResponse.json({ items, total });
});
