import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@zeal/database";
import { withErrorHandler, AppError, HTTP_STATUS } from "@/lib/errors";

export const GET = withErrorHandler(async (
  req: Request,
  { params }: { params: Promise<{ userId: string }> }
) => {
  const { userId } = await params;

  if (authUserId !== userId) {
    // Public profile – limited fields (bio is on consultant, not user)
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        name: true,
        avatar: true,
        sparks: true,
        isVerified: true,
        role: true,
        consultant: {
          select: {
            id: true,
            category: true,
            specialties: true,
            languages: true,
            bio: true,
            perMinuteRate: true,
            rating: true,
            totalConsultations: true,
            isActive: true,
            faith: true,
            availability: true,
          },
        },
      },
    });
    if (!user) throw new AppError("User not found", HTTP_STATUS.NOT_FOUND);
    return NextResponse.json(user);
  }

  // Own profile – full access including wallet
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { wallet: true, consultant: true },
  });
  if (!user) throw new AppError("User not found", HTTP_STATUS.NOT_FOUND);
  return NextResponse.json(user);
});

export const PUT = withErrorHandler(async (
  req: Request,
  { params }: { params: Promise<{ userId: string }> }
) => {
  const { userId } = await params;
  if (authUserId !== userId) throw new AppError("Unauthorized", HTTP_STATUS.FORBIDDEN);

  const body = await req.json();
  const { username, name, avatar, isHealer, specialties, languages, perMinuteRate, faith, availability, category, bio } = body;

  const updateData: any = { username, name, avatar };
  if (isHealer) {
    updateData.consultant = {
      upsert: {
        create: {
          category: category || "ASTROLOGER",
          specialties: specialties || [],
          languages: languages || [],
          bio: bio || "",
          perMinuteRate: perMinuteRate || 50,
          faith: faith || "HINDU",
          availability: availability || {},
          isActive: false,
        },
        update: {
          specialties: specialties || [],
          languages: languages || [],
          bio: bio || "",
          perMinuteRate: perMinuteRate || 50,
          faith: faith || "HINDU",
          availability: availability || {},
        },
      },
    };
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: updateData,
    include: { wallet: true, consultant: true },
  });
  return NextResponse.json({ user: updatedUser });
});
