import { NextResponse } from "next/server";
import { getUserId } from "@/lib/auth";
import { prisma } from "@zeal/database";
import { withErrorHandler, AppError, HTTP_STATUS } from "@/lib/errors";
import { generateToken } from "@/lib/livekit/room";
import { CallBilling } from "@/lib/calls/billing";

export const POST = withErrorHandler(async (req: Request) => {
  const userId = await getUserId();
  if (!userId) throw new AppError("Unauthorized", HTTP_STATUS.UNAUTHORIZED);

  const { bookingId } = await req.json();
  if (!bookingId) throw new AppError("Booking ID required", HTTP_STATUS.BAD_REQUEST);

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { consultant: true },
  });
  if (!booking) throw new AppError("Booking not found", HTTP_STATUS.NOT_FOUND);

  if (booking.userId !== userId && booking.consultant.userId !== userId) {
    throw new AppError("Not authorized", HTTP_STATUS.FORBIDDEN);
  }

  if (booking.status !== "CONFIRMED") {
    throw new AppError("Booking not confirmed", HTTP_STATUS.BAD_REQUEST);
  }

  const callSession = await prisma.callSession.create({
    data: {
      bookingId: booking.id,
      userId: booking.userId!,
      consultantId: booking.consultantId,
      startTime: new Date(),
      status: "INITIATED",
      durationSeconds: 0,
      amount: 0,
    },
  });

  const roomName = `booking-${bookingId}`;
  const token = await generateToken(roomName, userId);

  CallBilling.startBilling(callSession.id, booking.consultant.perMinuteRate);

  await prisma.booking.update({
    where: { id: bookingId },
    data: { status: "IN_PROGRESS" },
  });

  return NextResponse.json({ sessionId: callSession.id, token, roomName });
});
