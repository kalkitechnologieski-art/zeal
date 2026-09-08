import { getUserId } from "@/lib/auth";
import { NextResponse } from "next/server";
import { prisma } from "@zeal/database";
import { withErrorHandler, AppError, HTTP_STATUS } from "@/lib/errors";
import { Ledger } from "@/lib/wallet/ledger";
import { generateMeetingLink } from "@/lib/livekit/room";
import { NotificationService } from "@/lib/notifications/service";
import { BookingCreateSchema } from "@/lib/validation";

export const POST = withErrorHandler(async (req: Request) => {
  const userId = await getUserId();
  if (!userId) throw new AppError("Unauthorized", HTTP_STATUS.UNAUTHORIZED);

  const body = await req.json();
  const { consultantId, scheduledAt, durationMinutes, externalEmail } =
    BookingCreateSchema.parse(body);

  const consultant = await prisma.consultant.findUnique({
    where: { id: consultantId },
    include: { user: true },
  });
  if (!consultant) throw new AppError("Consultant not found", HTTP_STATUS.NOT_FOUND);
  if (!consultant.isActive) {
    throw new AppError("Consultant is not active", HTTP_STATUS.BAD_REQUEST);
  }

  const amount = (durationMinutes / 60) * consultant.perMinuteRate;
  const platformFee = amount * 0.10;
  const consultantEarning = amount - platformFee;

  let wallet = null;
  if (!externalEmail) {
    wallet = await prisma.wallet.findUnique({ where: { userId } });
    if (!wallet) throw new AppError("Wallet not found", HTTP_STATUS.NOT_FOUND);
    if (wallet.balance < amount) {
      throw new AppError("Insufficient balance", HTTP_STATUS.BAD_REQUEST);
    }
  }

  const booking = await prisma.$transaction(async (tx) => {
    if (wallet && !externalEmail) {
      await Ledger.createTransaction({
        walletId: wallet.id,
        type: "PAYMENT",
        amount: -amount,
        description: `Booking with ${consultant.user.name}`,
        referenceId: `booking-${Date.now()}`,
      });
    }

    const newBooking = await tx.booking.create({
      data: {
        userId: externalEmail ? null : userId,
        consultantId,
        scheduledAt: new Date(scheduledAt),
        durationMinutes,
        amount,
        platformFee,
        consultantEarning,
        externalEmail,
        status: externalEmail ? "PENDING" : "CONFIRMED",
        meetingLink: externalEmail ? null : await generateMeetingLink(`booking-${Date.now()}`),
      },
      include: { consultant: { include: { user: true } }, user: true },
    });
    return newBooking;
  });

  await NotificationService.createNotification({
    userId: consultant.userId,
    type: "booking",
    message: `New booking from ${booking.user?.name || externalEmail || "Guest"}`,
    redirectUrl: `/consultant/bookings/${booking.id}`,
    actorId: userId,
  });

  return NextResponse.json({ booking });
});

export const GET = withErrorHandler(async (req: Request) => {
  const userId = await getUserId();
  if (!userId) throw new AppError("Unauthorized", HTTP_STATUS.UNAUTHORIZED);

  const url = new URL(req.url);
  const status = url.searchParams.get("status") as any;
  const limit = parseInt(url.searchParams.get("limit") || "50");
  const offset = parseInt(url.searchParams.get("offset") || "0");

  const where: any = { userId };
  if (status) where.status = status;

  const [bookings, total] = await Promise.all([
    prisma.booking.findMany({
      where,
      include: { consultant: { include: { user: true } } },
      orderBy: { scheduledAt: "desc" },
      take: limit,
      skip: offset,
    }),
    prisma.booking.count({ where }),
  ]);

  return NextResponse.json({ bookings, total });
});
