import { NextResponse } from "next/server";
import { getUserId } from "@/lib/auth";
import { prisma } from "@zeal/database";
import { withErrorHandler, AppError, ErrorCode } from "@/lib/errors";
import { getCallAdapter } from "@/lib/calls";

export const POST = withErrorHandler(async (req: Request) => {
  const userId = await getUserId();
  if (!userId) {
    throw new AppError("Unauthorized", 401, ErrorCode.AUTH_UNAUTHORIZED);
  }

  const body = (await req.json()) as { bookingId?: string; roomName?: string };
  const roomName = body.roomName || (body.bookingId ? `booking-${body.bookingId}` : null);
  if (!roomName) {
    throw new AppError("bookingId or roomName required", 400, ErrorCode.VALIDATION_INPUT);
  }

  // If we have a bookingId, verify access
  if (body.bookingId) {
    const booking = await prisma.booking.findUnique({
      where: { id: body.bookingId },
      include: { consultant: { select: { userId: true } } },
    });
    if (!booking) {
      throw new AppError("Booking not found", 404, ErrorCode.BOOKING_NOT_FOUND);
    }
    const allowed = booking.userId === userId || booking.consultant.userId === userId;
    if (!allowed) {
      throw new AppError("Not authorized", 403, ErrorCode.AUTH_FORBIDDEN);
    }
  }

  const callAdapter = getCallAdapter();
  if (!callAdapter) {
    throw new AppError("Call service unavailable", 503, ErrorCode.CONFIG_ERROR);
  }

  const { token, wsUrl, expiresAt } = await callAdapter.generateToken({
    roomName,
    identity: userId,
    ttl: 7200,
  });

  return NextResponse.json({ token, roomName, wsUrl, expiresAt });
});

// BATCH2_APPLIED
