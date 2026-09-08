import { NextResponse } from "next/server";
import { getUserId } from "@/lib/auth";
import { prisma } from "@zeal/database";
import { withErrorHandler, AppError, HTTP_STATUS } from "@/lib/errors";

export const GET = withErrorHandler(async (req: Request) => {
  const userId = await getUserId();
  if (!userId) throw new AppError("Unauthorized", HTTP_STATUS.UNAUTHORIZED);
  const url = new URL(req.url);
  const status = url.searchParams.get("status") as any;
  const limit = parseInt(url.searchParams.get("limit") || "50");
  const offset = parseInt(url.searchParams.get("offset") || "0");
  const where: any = {};
  if (status) where.status = status;
  const [bookings, total] = await Promise.all([
    prisma.booking.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, email: true } },
        consultant: {
          include: { user: { select: { id: true, name: true } } },
        },
      },
      orderBy: { scheduledAt: "desc" },
      take: limit,
      skip: offset,
    }),
    prisma.booking.count({ where }),
  ]);
  return NextResponse.json({ bookings, total });
});
