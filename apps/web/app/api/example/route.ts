import { NextResponse } from "next/server";
import { withErrorHandler, AppError } from "@/lib/api-error-handler";

export const GET = withErrorHandler(async () => {
  // Example: throw new AppError("Resource not found", 404, "NOT_FOUND");
  return NextResponse.json({ message: "Hello from API with error handling!" });
});

export const POST = withErrorHandler(async (req: Request) => {
  const body = await req.json();
  if (!body.name) {
    throw new AppError("Name is required", 400, "VALIDATION_ERROR");
  }
  return NextResponse.json({ success: true, data: body });
});
