import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@zeal/database";
import { withErrorHandler, AppError, HTTP_STATUS } from "@/lib/errors";
import { CallBilling } from "@/lib/calls/billing";
import { uploadToR2 } from "@/lib/storage/r2";
import { NotificationService } from "@/lib/notifications/service";
import { ws } from "@/lib/socket/server";

export const POST = withErrorHandler(async (req: Request) => {
  const { userId } = await auth();
  if (!userId) throw new AppError("Unauthorized", HTTP_STATUS.UNAUTHORIZED);

  const { sessionId, recordingFile, rating, review } = await req.json();
  if (!sessionId) throw new AppError("Session ID required", HTTP_STATUS.BAD_REQUEST);

  const session = await prisma.callSession.findUnique({
    where: { id: sessionId },
    include: { booking: { include: { consultant: true } } },
  });
  if (!session) throw new AppError("Session not found", HTTP_STATUS.NOT_FOUND);

  // Ensure the booking exists
  if (!session.booking) {
    throw new AppError("Booking not found for this session", HTTP_STATUS.NOT_FOUND);
  }

  if (session.userId !== userId) {
    throw new AppError("Not authorized", HTTP_STATUS.FORBIDDEN);
  }

  const durationSeconds = Math.floor((Date.now() - session.startTime.getTime()) / 1000);

  let recordingUrl: string | null = null;
  if (recordingFile) {
    try {
      recordingUrl = await uploadToR2(recordingFile, `recordings/${sessionId}.mp4`);
    } catch (error) {
      console.error("Recording upload failed:", error);
    }
  }

  const updatedSession = await prisma.callSession.update({
    where: { id: sessionId },
    data: {
      endTime: new Date(),
      durationSeconds,
      status: "ENDED",
      ...(recordingUrl && { recordingUrl, recordingReady: true }),
      amount: (durationSeconds / 60) * session.booking.consultant.perMinuteRate,
    },
  });

  await CallBilling.endSession(sessionId);

  await prisma.booking.update({
    where: { id: session.bookingId! },
    data: { status: "CONFIRMED" },
  });

  // TODO: Implement rating/review in a separate Review model
  if (rating && rating > 0) {
    // For now, just log the rating – we'll add a review model later
    console.log(`Rating for booking ${session.bookingId}: ${rating}, review: ${review}`);
    // Optionally store in a separate Review table (to be created)
  }

  // Notify both parties
  const participants = [session.userId, session.booking.consultant.userId];
  participants.forEach((id) => {
    try {
      ws.to(`user:${id}`).emit("call_ended", {
        sessionId,
        durationSeconds,
        recordingUrl,
        rating,
      });
    } catch (error) {
      console.error(`WebSocket notification failed for user ${id}:`, error);
    }
  });

  return NextResponse.json({ session: updatedSession });
});
