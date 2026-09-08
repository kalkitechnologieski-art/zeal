import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@zeal/database";
import { withErrorHandler, AppError, HTTP_STATUS } from "@/lib/errors";
import { generateToken } from "@/lib/livekit/room";
import { CallBilling } from "@/lib/calls/billing";
import { NotificationService } from "@/lib/notifications/service";

// WebSocket fallback for production (Vercel does not support WebSockets)
let fallbackWs: any;
try {
  fallbackWs = require("@/lib/socket/server").ws;
} catch {
  fallbackWs = {
    to: () => ({ emit: () => {} }),
    emit: () => {},
  };
}

export const POST = withErrorHandler(async (req: Request) => {
  const supabase = createServerClientFromCookies();
  const { data: { session } } = await supabase.auth.getSession();
  const userId = session?.user?.id;
  if (!userId) throw new AppError("Unauthorized", HTTP_STATUS.UNAUTHORIZED);

  const { bookingId } = await req.json();
  if (!bookingId) throw new AppError("Booking ID required", HTTP_STATUS.BAD_REQUEST);

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { consultant: { include: { user: true } } },
  });
  if (!booking) throw new AppError("Booking not found", HTTP_STATUS.NOT_FOUND);

  if (booking.userId !== userId && booking.consultant.userId !== userId) {
    throw new AppError("Not authorized", HTTP_STATUS.FORBIDDEN);
  }

  if (booking.status !== "CONFIRMED") {
    throw new AppError("Booking not confirmed", HTTP_STATUS.BAD_REQUEST);
  }

  const session = await prisma.callSession.create({
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

  CallBilling.startBilling(session.id, booking.consultant.perMinuteRate);

  // Notify the other participant via WebSocket (fallback)
  const recipientId = booking.userId === userId ? booking.consultant.userId : booking.userId;
  try {
    fallbackWs.to(`user:${recipientId}`).emit("call_started", {
      sessionId: session.id,
      bookingId: booking.id,
      caller: userId,
      roomName,
    });
  } catch (error) {
    console.error("WebSocket notification failed (non-critical):", error);
  }

  await prisma.booking.update({
    where: { id: bookingId },
    data: { status: "IN_PROGRESS" },
  });

  return NextResponse.json({ sessionId: session.id, token, roomName });
});
