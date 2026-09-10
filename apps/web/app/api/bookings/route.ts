import { NextResponse } from "next/server";
import { getUserId } from "@/lib/auth";
import { prisma, withTransaction } from "@zeal/database";
import {
  withErrorHandler,
  AppError,
  ErrorCode,
  InsufficientBalanceError,
} from "@/lib/errors";
import { Ledger } from "@/lib/wallet/ledger";
import { generateToken, getCallAdapter } from "@/lib/calls";
import { sendEmail } from "@/lib/emails";
import { emailTemplates } from "@/lib/emails/templates";
import { BookingCreateSchema } from "@/lib/validation";
import { redis } from "@/lib/cache";

// ─── POST: create a booking ──────────────────────────────────────────────────
export const POST = withErrorHandler(async (req: Request) => {
  const userId = await getUserId();
  if (!userId) {
    throw new AppError("Unauthorized", 401, ErrorCode.AUTH_UNAUTHORIZED);
  }

  const body = await req.json();
  const { consultantId, scheduledAt, durationMinutes, externalEmail } =
    BookingCreateSchema.parse(body);

  const consultant = await prisma.consultant.findUnique({
    where: { id: consultantId },
    include: { user: { select: { id: true, name: true, email: true } } },
  });

  if (!consultant) {
    throw new AppError("Consultant not found", 404, ErrorCode.NOT_FOUND);
  }
  if (!consultant.isActive) {
    throw new AppError("Consultant is not active", 400, ErrorCode.BOOKING_CONFLICT);
  }

  // Fetch platform fee from cache (fallback 10%)
  let platformFeePercent = 10;
  try {
    const fee = await redis.get("platform_fee_percent");
    if (fee && typeof fee === "string") {
      const parsed = parseFloat(fee);
      if (!isNaN(parsed)) platformFeePercent = parsed;
    }
  } catch (_) {
    // Non-critical
  }

  const amount = (durationMinutes / 60) * consultant.perMinuteRate;
  const platformFee = amount * (platformFeePercent / 100);
  const consultantEarning = amount - platformFee;

  // ─── Conflict detection ────────────────────────────────────────────────────
  const proposedStart = new Date(scheduledAt);
  const proposedEnd = new Date(
    proposedStart.getTime() + durationMinutes * 60_000,
  );

  const conflict = await prisma.booking.findFirst({
    where: {
      consultantId,
      status: { in: ["PENDING", "CONFIRMED", "IN_PROGRESS"] },
      scheduledAt: { lt: proposedEnd },
      AND: [
        {
          scheduledAt: {
            gte: new Date(proposedStart.getTime() - 4 * 60 * 60_000),
          },
        },
      ],
    },
  });

  if (conflict) {
    const conflictEnd = new Date(
      conflict.scheduledAt.getTime() + conflict.durationMinutes * 60_000,
    );
    if (proposedStart < conflictEnd && proposedEnd > conflict.scheduledAt) {
      throw new AppError(
        "Time slot already booked",
        409,
        ErrorCode.BOOKING_CONFLICT,
      );
    }
  }

  // ─── Wallet check ──────────────────────────────────────────────────────────
  let wallet = null;
  if (!externalEmail) {
    wallet = await prisma.wallet.findUnique({ where: { userId } });
    if (!wallet) {
      throw new AppError("Wallet not found", 404, ErrorCode.WALLET_NOT_FOUND);
    }
    if (wallet.balance < amount) {
      throw new InsufficientBalanceError(amount, wallet.balance);
    }
  }

  // ─── Create booking (atomic) ───────────────────────────────────────────────
  const booking = await withTransaction(async (tx) => {
    if (wallet && !externalEmail) {
      await Ledger.createTransaction({
        walletId: wallet.id,
        type: "PAYMENT",
        amount: -amount,
        description: "Booking with " + (consultant.user.name || "consultant"),
        referenceId: "booking-" + Date.now(),
        metadata: { consultantId, scheduledAt, durationMinutes },
      });
    }

    return tx.booking.create({
      data: {
        userId: externalEmail ? null : userId,
        consultantId,
        scheduledAt: proposedStart,
        durationMinutes,
        amount,
        platformFee,
        consultantEarning,
        externalEmail: externalEmail || null,
        status: externalEmail ? "PENDING" : "CONFIRMED",
      },
      include: {
        consultant: { include: { user: true } },
        user: true,
      },
    });
  });

  // ─── Generate meeting link (best-effort) ───────────────────────────────────
  let meetingLink: string | null = null;
  const callAdapter = getCallAdapter();
  if (callAdapter) {
    try {
      const roomName = "booking-" + booking.id;
      const token = await generateToken(roomName, userId, { ttl: 7200 });
      meetingLink = (token.wsUrl || "") + "/room/" + roomName;
      await prisma.booking.update({
        where: { id: booking.id },
        data: { meetingLink },
      });
    } catch (err) {
      console.warn("[Booking] Meeting link generation failed:", err);
    }
  }

  // ─── Email notification ────────────────────────────────────────────────────
  try {
    const tpl = emailTemplates.bookingConfirmation(
      consultant.user.name || "Consultant",
      proposedStart.toLocaleString(),
    );
    const recipient = booking.user?.email || externalEmail || "";
    if (recipient) {
      await sendEmail({
        to: recipient,
        subject: tpl.subject,
        html: tpl.html,
      });
    }
  } catch (err) {
    console.warn("[Booking] Email failed:", err);
  }

  return NextResponse.json({ booking });
});

// ─── GET: list user's bookings ───────────────────────────────────────────────
export const GET = withErrorHandler(async (req: Request) => {
  const userId = await getUserId();
  if (!userId) {
    throw new AppError("Unauthorized", 401, ErrorCode.AUTH_UNAUTHORIZED);
  }

  const url = new URL(req.url);
  const status = url.searchParams.get("status") || undefined;
  const limit = Math.min(parseInt(url.searchParams.get("limit") || "20"), 100);
  const page = Math.max(parseInt(url.searchParams.get("page") || "1"), 1);

  const where = status
    ? { userId, status: status as never }
    : { userId };

  const [items, total] = await Promise.all([
    prisma.booking.findMany({
      where,
      include: { consultant: { include: { user: true } } },
      orderBy: { scheduledAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.booking.count({ where }),
  ]);

  return NextResponse.json({
    items,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  });
});

// BATCH2_FIX_APPLIED
