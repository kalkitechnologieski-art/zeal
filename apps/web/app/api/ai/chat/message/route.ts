import { NextResponse } from "next/server";
import { getUserId } from "@/lib/auth";
import { prisma } from "@zeal/database";
import { withErrorHandler, AppError, ErrorCode } from "@/lib/errors";
import { getAIResponse } from "@/lib/ai/ai-chat";
import { z } from "zod";

const AIMessageSchema = z.object({
  sessionId: z.string().cuid(),
  message: z.string().min(1).max(2000),
});

export const POST = withErrorHandler(async (req: Request) => {
  const userId = await getUserId();
  if (!userId) throw new AppError("Unauthorized", 401, ErrorCode.AUTH_UNAUTHORIZED);

  const body = await req.json();
  const { sessionId, message } = AIMessageSchema.parse(body);

  const session = await prisma.callSession.findUnique({
    where: { id: sessionId },
    include: { aiConsultant: true },
  });

  if (!session || !session.aiConsultant) {
    throw new AppError("Session or AI not found", 404, ErrorCode.SESSION_NOT_FOUND);
  }

  if (session.userId !== userId) {
    throw new AppError("Not authorized", 403, ErrorCode.AUTH_FORBIDDEN);
  }

  if (session.status === "ENDED") {
    throw new AppError("Session already ended", 400, ErrorCode.BOOKING_CANCELLATION_FAILED);
  }

  // Build system prompt
  const ai = session.aiConsultant;
  const systemPrompt = `You are ${ai.name}, a ${ai.persona || "helpful"} AI ${ai.category}. 
Bio: ${ai.bio}
Respond to the user's question in a clear, empathetic, and professional manner.`;

  // Get AI response (with fallback)
  const response = await getAIResponse(message, "", systemPrompt);

  return NextResponse.json({
    response: response.content,
  });
});

// BATCH2_APPLIED
