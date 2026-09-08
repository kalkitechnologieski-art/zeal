import { prisma } from "@zeal/database";
import { NextResponse } from "next/server";
import { withErrorHandler, AppError } from "@/lib/api-error-handler";

// Mock AI response – replace with actual Zhipu/Agnes integration
export const POST = withErrorHandler(async (req: Request) => {
  const body = await req.json();
  const { query, consultantId } = body;

  if (!query) {
    throw new AppError("Query is required", 400, "VALIDATION_ERROR");
  }

  // In production: call Zhipu AI or Agnes API
  const response = {
    message: `AI response to: "${query}"`,
    timestamp: new Date().toISOString(),
  };

  return NextResponse.json({
    success: true,
    data: response,
  });
});
