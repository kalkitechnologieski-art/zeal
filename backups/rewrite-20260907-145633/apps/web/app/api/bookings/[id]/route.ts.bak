import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@zeal/database';
import { withErrorHandler, AppError } from '@/lib/errors';

export const GET = withErrorHandler(async (
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

  return NextResponse.json({ booking });
});

export const PUT = withErrorHandler(async (
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { userId } = await auth();
  if (!userId) throw new AppError('Unauthorized', 401, 'UNAUTHORIZED');
  const { id } = await params;

  const body = await req.json();
  const { status, scheduledAt, durationMinutes } = body;

  const booking = await prisma.booking.findFirst({
    where: { id, userId },
  });
  if (!booking) throw new AppError('Booking not found', 404, 'BOOKING_NOT_FOUND');

  const updated = await prisma.booking.update({
    where: { id },
    data: { status, scheduledAt, durationMinutes },
  });

  return NextResponse.json({ booking: updated });
});

export const DELETE = withErrorHandler(async (
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { userId } = await auth();
  if (!userId) throw new AppError('Unauthorized', 401, 'UNAUTHORIZED');
  const { id } = await params;

  const booking = await prisma.booking.findFirst({
    where: { id, userId },
  });
  if (!booking) throw new AppError('Booking not found', 404, 'BOOKING_NOT_FOUND');

  await prisma.booking.update({
    where: { id },
    data: { status: 'CANCELLED' },
  });

  return NextResponse.json({ success: true });
});
