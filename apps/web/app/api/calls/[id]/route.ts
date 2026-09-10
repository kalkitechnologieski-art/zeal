import { NextResponse } from "next/server";
import { getUserId } from "@/lib/auth";
import { prisma } from "@zeal/database";
import { withErrorHandler, AppError, ErrorCode } from "@/lib/errors";

export const GET = withErrorHandler(
  async (_req: Request, { params }: { params: Promise<{ id: string }> }) => {
    const userId = await getUserId();
    if (!userId) {
      throw new AppError("Unauthorized", 401, ErrorCode.AUTH_UNAUTHORIZED);
    }
    const { id } = await params;

    const session = await prisma.callSession.findUnique({
      where: { id },
      include: {
        booking: {
          include: {
            consultant: { include: { user: { select: { id: true, name: true } } } },
          },
        },
      },
    });

    if (!session) {
      throw new AppError("Session not found", 404, ErrorCode.SESSION_NOT_FOUND);
    }

    const isOwner = session.userId === userId;
    const isConsultant = session.booking?.consultant.userId === userId;
    if (!isOwner && !isConsultant) {
      throw new AppError("Not authorized", 403, ErrorCode.AUTH_FORBIDDEN);
    }

    return NextResponse.json({ session });
  },
);

// BATCH2_APPLIED
