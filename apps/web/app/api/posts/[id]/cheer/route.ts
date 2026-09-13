import { NextResponse } from "next/server";
import { prisma } from "@zeal/database";
import { getUserId } from "@/lib/auth";
import { withErrorHandler, AppError, ErrorCode } from "@/lib/errors";
import { NotificationService } from "@/lib/notifications/service";

export const POST = withErrorHandler(async (_req: Request, { params }: { params: Promise<{ id: string }> }) => {
  const userId = await getUserId();
  if (!userId) throw new AppError("Unauthorized", 401, ErrorCode.AUTH_UNAUTHORIZED);
  const { id: postId } = await params;

  const post = await prisma.post.findUnique({ where: { id: postId }, select: { id: true, authorId: true, cheerCount: true } });
  if (!post) throw new AppError("Post not found", 404, ErrorCode.NOT_FOUND);

  const existing = await prisma.cheer.findUnique({ where: { userId_postId: { userId, postId } } });
  if (existing) return NextResponse.json({ cheers: post.cheerCount, cheered: true });

  await prisma.$transaction([
    prisma.cheer.create({ data: { userId, postId } }),
    prisma.post.update({ where: { id: postId }, data: { cheerCount: { increment: 1 } } }),
  ]);

  if (post.authorId !== userId) {
    try {
      await NotificationService.createNotification({
        userId: post.authorId,
        type: "system",
        message: "Someone cheered your post",
        redirectUrl: "/post/" + postId,
        actorId: userId,
      });
    } catch {}
  }

  return NextResponse.json({ cheers: post.cheerCount + 1, cheered: true });
});

export const DELETE = withErrorHandler(async (_req: Request, { params }: { params: Promise<{ id: string }> }) => {
  const userId = await getUserId();
  if (!userId) throw new AppError("Unauthorized", 401, ErrorCode.AUTH_UNAUTHORIZED);
  const { id: postId } = await params;

  const existing = await prisma.cheer.findUnique({ where: { userId_postId: { userId, postId } } });
  if (!existing) return NextResponse.json({ cheers: 0, cheered: false });

  await prisma.$transaction([
    prisma.cheer.delete({ where: { userId_postId: { userId, postId } } }),
    prisma.post.update({ where: { id: postId }, data: { cheerCount: { decrement: 1 } } }),
  ]);

  const post = await prisma.post.findUnique({ where: { id: postId }, select: { cheerCount: true } });
  return NextResponse.json({ cheers: post?.cheerCount ?? 0, cheered: false });
});

