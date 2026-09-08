import { getUserId } from "@/lib/auth";
import { NextResponse } from "next/server";
import { prisma } from "@zeal/database";
import { withErrorHandler, AppError, HTTP_STATUS } from "@/lib/errors";

export const POST = withErrorHandler(async (req: Request) => {
  const userId = await getUserId();
  if (!userId) throw new AppError("Unauthorized", HTTP_STATUS.UNAUTHORIZED);

  const formData = await req.formData();
  const content = formData.get("content") as string || "";
  const imageFile = formData.get("image") as File | null;

  // TODO: Replace placeholder with actual Cloudflare R2 upload.
  let imageUrl: string | null = null;
  if (imageFile) {
    // For now, generate a dummy URL.
    imageUrl = `https://via.placeholder.com/600?text=Post+${Date.now()}`;
    // In production: upload to R2 and get the URL.
  }

  const post = await prisma.post.create({
    data: {
      content,
      mediaUrls: imageUrl ? [imageUrl] : [],
      authorId: userId,
      cheerCount: 0,
      commentCount: 0,
      shareCount: 0,
      isPinned: false,
      isFlagged: false,
    },
    include: {
      author: {
        select: {
          id: true,
          username: true,
          name: true,
          avatar: true,
        },
      },
    },
  });

  return NextResponse.json({ post });
});
