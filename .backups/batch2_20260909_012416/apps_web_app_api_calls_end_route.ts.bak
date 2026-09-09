import { NextResponse } from "next/server";
import { getUserId } from "@/lib/auth";
import { prisma } from "@zeal/database";
import { withErrorHandler, AppError, HTTP_STATUS } from "@/lib/errors";
import { CallBilling } from "@/lib/calls/billing";
import { uploadToR2 } from "@/lib/storage/r2";

export const POST = withErrorHandler(async (req: Request) => {
  const userId = await getUserId();
  if (!userId) throw new AppError("Unauthorized", HTTP_STATUS.UNAUTHORIZED);

  const { sessionId, recordingFile, rating, review } = await req.json();
  if (!sessionId) throw new AppError("Session ID required", HTTP_STATUS.BAD_REQUEST);

  const callSession = await prisma.callSession.findUnique({
    where: { id: sessionId },
    include: { booking: { include: { consultant: true } } },
  });
  if (!callSession) throw new AppError("Session not found", HTTP_STATUS.NOT_FOUND);

  if (!callSession.booking) {
    throw new AppError("Booking not found for this session", HTTP_STATUS.NOT_FOUND);
  }

  if (callSession.userId !== userId) {
    throw new AppError("Not authorized", HTTP_STATUS.FORBIDDEN);
  }

  const durationSeconds = Math.floor((Date.now() - callSession.startTime.getTime()) / 1000);

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
      amount: (durationSeconds / 60) * callSession.booking.consultant.perMinuteRate,
    },
  });

  await CallBilling.endSession(sessionId);

  await prisma.booking.update({
    where: { id: callSession.bookingId! },
    data: { status: "CONFIRMED" },
  });

  if (rating && rating > 0) {
    console.log(`Rating for booking ${callSession.bookingId}: ${rating}, review: ${review}`);
  }

  return NextResponse.json({ session: updatedSession });
});
