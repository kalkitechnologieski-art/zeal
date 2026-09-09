import { NextResponse } from "next/server";
import { getUserId } from "@/lib/auth";
import { prisma, withTransaction } from "@zeal/database";
import { withErrorHandler, AppError, ErrorCode } from "@/lib/errors";
import { z } from "zod";

const AIStartSchema = z.object({
  aiConsultantId: z.string().cuid(),
});

export const POST = withErrorHandler(async (req: Request) => {
  const userId = await getUserId();
  if (!userId) throw new AppError("Unauthorized", 401, ErrorCode.AUTH_UNAUTHORIZED);

  const body = await req.json();
  const { aiConsultantId } = AIStartSchema.parse(body);

  const ai = await prisma.aIConsultant.findUnique({
    where: { id: aiConsultantId },
  });

  if (!ai) {
    throw new AppError("AI consultant not found", 404, ErrorCode.NOT_FOUND);
  }

  if (!ai.isActive) {
    throw new AppError("AI consultant is not active", 400, ErrorCode.AI_SERVICE_UNAVAILABLE);
  }

  // Create a call session with isAI=true and link to AI consultant
  const session = await withTransaction(async (tx) => {
    const s = await tx.callSession.create({
      data: {
        userId,
        consultantId: `ai-${aiConsultantId}`, // placeholder
        isAI: true,
        aiConsultantId: aiConsultantId,
        startTime: new Date(),
        status: "INITIATED",
        durationSeconds: 0,
        amount: 0,
        bookingId: null,
      },
    });
    return s;
  });

  return NextResponse.json({
    sessionId: session.id,
    rate: ai.isPaid ? ai.perMinuteRate : 0,
  });
});

// BATCH2_APPLIED
