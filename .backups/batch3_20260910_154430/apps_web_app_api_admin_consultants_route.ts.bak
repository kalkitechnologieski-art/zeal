import { NextResponse } from "next/server";
import { getUserId } from "@/lib/auth";
import { prisma } from "@zeal/database";
import { withErrorHandler, AppError, ErrorCode } from "@/lib/errors";
import { z } from "zod";
import { ConsultantCategory } from "@prisma/client";

const ConsultantUpdateSchema = z.object({
  isVerified: z.boolean().optional(),
  isActive: z.boolean().optional(),
  perMinuteRate: z.number().min(0).optional(),
  category: z.nativeEnum(ConsultantCategory).optional(),
  specialties: z.array(z.string()).optional(),
  languages: z.array(z.string()).optional(),
  bio: z.string().optional(),
});

// GET – list all consultants (human + AI) with pagination and filters
export const GET = withErrorHandler(async (req: Request) => {
  const userId = await getUserId();
  if (!userId) throw new AppError("Unauthorized", 401, ErrorCode.AUTH_UNAUTHORIZED);

  const url = new URL(req.url);
  const page = parseInt(url.searchParams.get("page") || "1");
  const limit = parseInt(url.searchParams.get("limit") || "10");
  const search = url.searchParams.get("search") || "";
  const category = url.searchParams.get("category") as ConsultantCategory || "";

  // Build where clause with proper typing
  const where: any = {};
  if (search) {
    where.OR = [
      { user: { name: { contains: search, mode: "insensitive" } } },
      { user: { email: { contains: search, mode: "insensitive" } } },
      { user: { username: { contains: search, mode: "insensitive" } } },
    ];
  }
  if (category) where.category = category;

  const [consultants, total] = await Promise.all([
    prisma.consultant.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            username: true,
            avatar: true,
            role: true,
            isVerified: true,
          },
        },
      },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: "desc" },
    }),
    prisma.consultant.count({ where }),
  ]);

  return NextResponse.json({
    items: consultants,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  });
});

// POST – create a new consultant (manual)
export const POST = withErrorHandler(async (req: Request) => {
  const userId = await getUserId();
  if (!userId) throw new AppError("Unauthorized", 401, ErrorCode.AUTH_UNAUTHORIZED);

  const body = await req.json();
  const { userId: targetUserId, category, specialties, languages, perMinuteRate, bio } = body;

  const existing = await prisma.consultant.findUnique({
    where: { userId: targetUserId },
  });
  if (existing) {
    throw new AppError("User is already a consultant", 409, ErrorCode.BOOKING_CONFLICT);
  }

  const consultant = await prisma.consultant.create({
    data: {
      userId: targetUserId,
      category: category as ConsultantCategory,
      specialties: specialties || [],
      languages: languages || [],
      perMinuteRate: perMinuteRate || 50,
      bio: bio || "",
      isActive: true,
      availability: {},
    },
    include: { user: true },
  });

  return NextResponse.json({ consultant });
});

// PUT – update a consultant
export const PUT = withErrorHandler(async (req: Request) => {
  const userId = await getUserId();
  if (!userId) throw new AppError("Unauthorized", 401, ErrorCode.AUTH_UNAUTHORIZED);

  const url = new URL(req.url);
  const consultantId = url.searchParams.get("id");
  if (!consultantId) {
    throw new AppError("Missing consultant ID", 400, ErrorCode.VALIDATION_INPUT);
  }

  const body = await req.json();
  const data = ConsultantUpdateSchema.parse(body);

  // Convert category if provided
  const updateData: any = { ...data };
  if (data.category) {
    updateData.category = data.category as ConsultantCategory;
  }

  const consultant = await prisma.consultant.update({
    where: { id: consultantId },
    data: updateData,
    include: { user: true },
  });

  return NextResponse.json({ consultant });
});

// DELETE – deactivate consultant (soft delete)
export const DELETE = withErrorHandler(async (req: Request) => {
  const userId = await getUserId();
  if (!userId) throw new AppError("Unauthorized", 401, ErrorCode.AUTH_UNAUTHORIZED);

  const url = new URL(req.url);
  const consultantId = url.searchParams.get("id");
  if (!consultantId) {
    throw new AppError("Missing consultant ID", 400, ErrorCode.VALIDATION_INPUT);
  }

  const consultant = await prisma.consultant.update({
    where: { id: consultantId },
    data: { isActive: false },
  });

  return NextResponse.json({ consultant });
});

// BATCH2_FIX_APPLIED
