import { NextResponse } from "next/server";
import { getUserId } from "@/lib/auth";
import { prisma } from "@zeal/database";
import { withErrorHandler, AppError, HTTP_STATUS } from "@/lib/errors";
import { getAIResponse } from "@/lib/ai/ai-chat";
import { AIMessageSchema } from "@/lib/validation";

export const POST = withErrorHandler(async (req: Request) => {
  const userId = await getUserId();
  if (!userId) throw new AppError("Unauthorized", HTTP_STATUS.UNAUTHORIZED);

  const { sessionId, message } = AIMessageSchema.parse(await req.json());

  const callSession = await prisma.callSession.findUnique({
    where: { id: sessionId },
    include: { aiConsultant: true },
  });
  if (!callSession || !callSession.aiConsultant) {
    throw new AppError("Session or AI not found", HTTP_STATUS.NOT_FOUND);
  }
  if (callSession.userId !== userId) {
    throw new AppError("Not authorized", HTTP_STATUS.FORBIDDEN);
  }

  const systemPrompt = `You are ${callSession.aiConsultant.name}, a ${callSession.aiConsultant.persona || "helpful"} AI ${callSession.aiConsultant.category}. Respond to the user's question in a clear, empathetic, and professional manner.`;
  const response = await getAIResponse(message, "", systemPrompt);

  return NextResponse.json({ response: response.content });
});
