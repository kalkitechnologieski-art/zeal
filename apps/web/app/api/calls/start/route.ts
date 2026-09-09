import { NextResponse } from "next/server";
import { getUserId } from "@/lib/auth";
import { prisma, withTransaction } from "@zeal/database";
import { withErrorHandler, AppError, ErrorCode } from "@/lib/errors";
import { generateToken } from "@/lib/livekit/room";
import { z } from "zod";

const StartCallSchema = z.object({
  bookingId: z.string().cuid(),
});

export const POST = withErrorHandler(async (req: Request) => {
  const userId = await getUserId();
  if (!userId) throw new AppError("Unauthorized", 401, ErrorCode.AUTH_UNAUTHORIZED);

  const body = await req.json();
  const { bookingId } = StartCallSchema.parse(body);

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      consultant: { include: { user: true } },
      user: true,
    },
  });

  if (!booking) {
    throw new AppError("Booking not found", 404, ErrorCode.BOOKING_NOT_FOUND);
  }

  // Authorize: only the user or the consultant can start the call
  if (booking.userId !== userId && booking.consultant.userId !== userId) {
    throw new AppError("Not authorized", 403, ErrorCode.AUTH_FORBIDDEN);
  }

  if (booking.status !== "CONFIRMED") {
    throw new AppError("Booking not confirmed", 400, ErrorCode.BOOKING_CONFLICT);
  }

  // Create call session
  const callSession = await withTransaction(async (tx) => {
    const session = await tx.callSession.create({
      data: {
        bookingId: booking.id,
        userId: booking.userId!,
        consultantId: booking.consultantId,
        startTime: new Date(),
        status: "INITIATED",
        durationSeconds: 0,
        amount: 0,
        isAI: false,
      },
    });

    // Update booking status to IN_PROGRESS
    await tx.booking.update({
      where: { id: bookingId },
      data: { status: "IN_PROGRESS" },
    });

    return session;
  });

  // Generate LiveKit token
  const roomName = `booking-${bookingId}`;
  const token = await generateToken(roomName, userId);

  return NextResponse.json({
    sessionId: callSession.id,
    token,
    roomName,
    wsUrl: process.env.LIVEKIT_WS_URL,
  });
});

// BATCH2_APPLIED
