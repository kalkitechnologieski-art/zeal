import { NextResponse } from "next/server";
import { getUserId } from "@/lib/auth";
import { prisma } from "@zeal/database";
import { withErrorHandler, AppError, ErrorCode } from "@/lib/errors";
import { getStorageAdapter } from "@/lib/storage";
import { randomUUID } from "crypto";

const MAX_IMAGES = 4;
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

export const POST = withErrorHandler(async (req: Request) => {
  const userId = await getUserId();
  if (!userId) {
    throw new AppError("Unauthorized", 401, ErrorCode.AUTH_UNAUTHORIZED);
  }

  const formData = await req.formData();
  const content = (formData.get("content") as string | null) || "";
  const tagString = (formData.get("tags") as string | null) || "";

  if (!content && !formData.get("image")) {
    throw new AppError(
      "Post must have content or an image",
      400,
      ErrorCode.VALIDATION_INPUT,
    );
  }
  if (content.length > 2000) {
    throw new AppError("Content too long", 400, ErrorCode.VALIDATION_INPUT);
  }

  const mediaUrls: string[] = [];
  const images = formData.getAll("image").filter((f) => f instanceof Blob);

  if (images.length > MAX_IMAGES) {
    throw new AppError(
      `Maximum ${MAX_IMAGES} images allowed`,
      400,
      ErrorCode.VALIDATION_INPUT,
    );
  }

  const adapter = getStorageAdapter();
  if (images.length > 0 && !adapter) {
    throw new AppError("Storage not configured", 503, ErrorCode.CONFIG_ERROR);
  }

  for (const img of images) {
    if (!(img instanceof Blob)) continue;
    if (img.size > MAX_IMAGE_BYTES) {
      throw new AppError(
        "Image exceeds 5 MB",
        413,
        ErrorCode.VALIDATION_INPUT,
      );
    }
    const ext = (img.type.split("/")[1] || "jpg").replace(/[^a-z0-9]/g, "");
    const key = `posts/${userId}/${randomUUID()}.${ext}`;
    const ab = await img.arrayBuffer();
    const body = new Uint8Array(ab);
    const result = await adapter!.upload({
      key,
      body,
      contentType: img.type,
      metadata: { uploadedBy: userId },
    });
    mediaUrls.push(result.url);
  }

  const tags = tagString
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean)
    .slice(0, 10);

  const post = await prisma.post.create({
    data: {
      content,
      mediaUrls,
      authorId: userId,
      cheerCount: 0,
      commentCount: 0,
      shareCount: 0,
      isPinned: false,
      isFlagged: false,
    },
    include: {
      author: {
        select: { id: true, username: true, name: true, avatar: true },
      },
    },
  });

  return NextResponse.json({ post, tags });
});

// BATCH3_APPLIED
