import { getUserId } from "@/lib/auth";
import { NextResponse } from "next/server";
import { prisma } from "@zeal/database";
import { withErrorHandler, AppError, HTTP_STATUS } from "@/lib/errors";

export const GET = withErrorHandler(async (req: Request) => {
  const userId = await getUserId();
  if (!userId) throw new AppError("Unauthorized", HTTP_STATUS.UNAUTHORIZED);

  const url = new URL(req.url);
  const cursor = url.searchParams.get("cursor") || undefined;
  const limit = parseInt(url.searchParams.get("limit") || "10");

  // For MVP, show all posts; later we can filter by followed users.
  const posts = await prisma.post.findMany({
    include: {
      author: {
        select: {
          id: true,
          username: true,
          name: true,
          avatar: true,
        },
      },
      _count: {
        select: { cheers: true, comments: true },
      },
    },
    orderBy: { createdAt: "desc" },
    take: limit + 1,
    ...(cursor && { cursor: { id: cursor }, skip: 1 }),
  });

  let nextCursor: string | undefined;
  if (posts.length > limit) {
    const last = posts.pop();
    nextCursor = last?.id;
  }

  const formatted = posts.map((post) => ({
    id: post.id,
    content: post.content,
    imageUrl: post.mediaUrls?.[0] || null,
    author: post.author,
    cheerCount: post._count.cheers,
    commentCount: post._count.comments,
    shareCount: post.shareCount,
    createdAt: post.createdAt,
  }));

  return NextResponse.json({ posts: formatted, nextCursor });
});
