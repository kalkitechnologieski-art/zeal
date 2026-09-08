import { getUserId } from "@/lib/auth";
import { NextResponse } from "next/server";
import { prisma } from "@zeal/database";
import { withErrorHandler, AppError, HTTP_STATUS } from "@/lib/errors";

export const GET = withErrorHandler(async (
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) => {
  const userId = await getUserId();
  if (!userId) throw new AppError("Unauthorized", HTTP_STATUS.UNAUTHORIZED);
  const { id } = await params;

  const booking = await prisma.booking.findFirst({
    where: { id, userId },
    include: { consultant: { include: { user: true } }, user: true },
  });
  if (!booking) throw new AppError("Booking not found", HTTP_STATUS.NOT_FOUND);
  return NextResponse.json({ booking });
});

export const PUT = withErrorHandler(async (
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) => {
  const userId = await getUserId();
  if (!userId) throw new AppError("Unauthorized", HTTP_STATUS.UNAUTHORIZED);
  const { id } = await params;

  const body = await req.json();
  const { status, scheduledAt, durationMinutes } = body;

  const booking = await prisma.booking.findFirst({
    where: { id, userId },
  });
  if (!booking) throw new AppError("Booking not found", HTTP_STATUS.NOT_FOUND);

  const updated = await prisma.booking.update({
    where: { id },
    data: { status, scheduledAt, durationMinutes },
    include: { consultant: { include: { user: true } }, user: true },
  });
  return NextResponse.json({ booking: updated });
});

export const DELETE = withErrorHandler(async (
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) => {
  const userId = await getUserId();
  if (!userId) throw new AppError("Unauthorized", HTTP_STATUS.UNAUTHORIZED);
  const { id } = await params;

  const booking = await prisma.booking.findFirst({
    where: { id, userId },
  });
  if (!booking) throw new AppError("Booking not found", HTTP_STATUS.NOT_FOUND);

  const updated = await prisma.booking.update({
    where: { id },
    data: { status: "CANCELLED" },
  });
  return NextResponse.json({ booking: updated });
});
