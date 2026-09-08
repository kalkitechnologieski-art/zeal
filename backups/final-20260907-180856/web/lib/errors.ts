import { ZodError } from "zod";

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
} as const;

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly details?: any;

  constructor(
    message: string,
    statusCode: number = HTTP_STATUS.INTERNAL_SERVER_ERROR,
    code: string = "INTERNAL_ERROR",
    details?: any,
  ) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: any) {
    super(message, HTTP_STATUS.BAD_REQUEST, "VALIDATION_ERROR", details);
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = "Unauthorized") {
    super(message, HTTP_STATUS.UNAUTHORIZED, "AUTHENTICATION_ERROR");
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(`${resource} not found`, HTTP_STATUS.NOT_FOUND, "NOT_FOUND");
  }
}

export function withErrorHandler(
  handler: (req: Request, ...args: any[]) => Promise<Response>,
) {
  return async (req: Request, ...args: any[]) => {
    try {
      return await handler(req, ...args);
    } catch (error) {
      console.error("API Error:", {
        path: req.url,
        method: req.method,
        error: error instanceof Error ? error.stack : error,
      });

      if (error instanceof AppError) {
        return new Response(
          JSON.stringify({
            success: false,
            error: {
              message: error.message,
              code: error.code,
              details: error.details,
            },
          }),
          {
            status: error.statusCode,
            headers: { "Content-Type": "application/json" },
          },
        );
      }

      if (error instanceof ZodError) {
        return new Response(
          JSON.stringify({
            success: false,
            error: {
              message: "Validation failed",
              code: "VALIDATION_ERROR",
              details: error.flatten(),
            },
          }),
          {
            status: HTTP_STATUS.BAD_REQUEST,
            headers: { "Content-Type": "application/json" },
          },
        );
      }

      return new Response(
        JSON.stringify({
          success: false,
          error: {
            message: "Internal server error",
            code: "INTERNAL_ERROR",
          },
        }),
        {
          status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
          headers: { "Content-Type": "application/json" },
        },
      );
    }
  };
}
