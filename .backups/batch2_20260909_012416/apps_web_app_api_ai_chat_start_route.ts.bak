import { NextResponse } from "next/server";
import { getUserId } from "@/lib/auth";
import { prisma } from "@zeal/database";
import { withErrorHandler, AppError, HTTP_STATUS } from "@/lib/errors";
import { AIStartSchema } from "@/lib/validation";

export const POST = withErrorHandler(async (req: Request) => {
  const userId = await getUserId();
  if (!userId) throw new AppError("Unauthorized", HTTP_STATUS.UNAUTHORIZED);

  const { aiConsultantId } = AIStartSchema.parse(await req.json());

  const ai = await prisma.aIConsultant.findUnique({
    where: { id: aiConsultantId },
  });
  if (!ai) throw new AppError("AI consultant not found", HTTP_STATUS.NOT_FOUND);

  const callSession = await prisma.callSession.create({
    data: {
      userId,
      consultantId: `ai-${aiConsultantId}`,
      isAI: true,
      aiConsultantId: aiConsultantId,
      startTime: new Date(),
      status: "INITIATED",
      amount: 0,
    },
  });

  return NextResponse.json({
    sessionId: callSession.id,
    rate: ai.perMinuteRate,
  });
});
