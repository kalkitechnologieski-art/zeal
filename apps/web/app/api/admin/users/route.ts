import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@zeal/database";
import { withErrorHandler, AppError, HTTP_STATUS } from "@/lib/errors";

export const GET = withErrorHandler(async (req: Request) => {
  const { userId, sessionClaims } = await auth();
  if (!userId) throw new AppError("Unauthorized", HTTP_STATUS.UNAUTHORIZED);
  const role = (sessionClaims as any)?.metadata?.role;
  if (role !== "SUPER_ADMIN" && role !== "ADMIN") {
    throw new AppError("Forbidden", HTTP_STATUS.FORBIDDEN);
  }

  const url = new URL(req.url);
  const search = url.searchParams.get("search") || "";
  const roleFilter = url.searchParams.get("role") || undefined;
  const limit = parseInt(url.searchParams.get("limit") || "50");
  const offset = parseInt(url.searchParams.get("offset") || "0");

  const where: any = {};
  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
      { username: { contains: search, mode: "insensitive" } },
    ];
  }
  if (roleFilter) where.role = roleFilter;

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        username: true,
        role: true,
        sparks: true,
        isVerified: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: offset,
    }),
    prisma.user.count({ where }),
  ]);

  return NextResponse.json({ users, total });
});

export const PUT = withErrorHandler(async (req: Request) => {
  const { userId, sessionClaims } = await auth();
  if (!userId) throw new AppError("Unauthorized", HTTP_STATUS.UNAUTHORIZED);
  if ((sessionClaims as any)?.metadata?.role !== "SUPER_ADMIN") {
    throw new AppError("Forbidden", HTTP_STATUS.FORBIDDEN);
  }

  const { userId: targetUserId, updates } = await req.json();
  if (!targetUserId) throw new AppError("Missing userId", HTTP_STATUS.BAD_REQUEST);

  const updated = await prisma.user.update({
    where: { id: targetUserId },
    data: updates,
    select: {
      id: true,
      name: true,
      email: true,
      username: true,
      role: true,
      sparks: true,
      isVerified: true,
    },
  });
  return NextResponse.json({ user: updated });
});
