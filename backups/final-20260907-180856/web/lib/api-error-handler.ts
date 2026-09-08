import { NextResponse } from "next/server";

export class AppError extends Error {
  constructor(
    public override message: string,
    public statusCode: number = 500,
    public code?: string,
    public details?: any
  ) {
    super(message);
    this.name = "AppError";
  }
}

export function handleApiError(error: unknown): NextResponse {
  if (error instanceof AppError) {
    return NextResponse.json(
      {
        success: false,
        error: {
          message: error.message,
          code: error.code || "APP_ERROR",
          details: error.details || null,
        },
      },
      { status: error.statusCode }
    );
  }

  if (error instanceof Error) {
    console.error("Unhandled API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          message: "Internal server error",
          code: "INTERNAL_SERVER_ERROR",
          details: process.env.NODE_ENV === "development" ? error.stack : undefined,
        },
      },
      { status: 500 }
    );
  }

  return NextResponse.json(
    {
      success: false,
      error: {
        message: "Unknown error occurred",
        code: "UNKNOWN_ERROR",
      },
    },
    { status: 500 }
  );
}

export function withErrorHandler(
  handler: (req: Request, ...args: any[]) => Promise<Response>
) {
  return async (req: Request, ...args: any[]) => {
    try {
      return await handler(req, ...args);
    } catch (error) {
      return handleApiError(error);
    }
  };
}
