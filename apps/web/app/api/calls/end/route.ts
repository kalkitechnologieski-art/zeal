import { NextResponse } from "next/server";
import { getUserId } from "@/lib/auth";
import { prisma, withTransaction } from "@zeal/database";
import { withErrorHandler, AppError, ErrorCode, InsufficientBalanceError } from "@/lib/errors";
import { Ledger } from "@/lib/wallet/ledger";
import { uploadToR2 } from "@/lib/storage/r2";
import { z } from "zod";

const EndCallSchema = z.object({
  sessionId: z.string().cuid(),
  recordingFile: z.any().optional(),
  rating: z.number().min(1).max(5).optional(),
  review: z.string().max(500).optional(),
});

export const POST = withErrorHandler(async (req: Request) => {
  const userId = await getUserId();
  if (!userId) throw new AppError("Unauthorized", 401, ErrorCode.AUTH_UNAUTHORIZED);

  const body = await req.json();
  const { sessionId, recordingFile, rating, review } = EndCallSchema.parse(body);

  // Fetch session with related data
  const callSession = await prisma.callSession.findUnique({
    where: { id: sessionId },
    include: {
      booking: {
        include: {
          consultant: {
            include: { user: { include: { wallet: true } } },
          },
          user: { include: { wallet: true } },
        },
      },
    },
  });

  if (!callSession) {
    throw new AppError("Session not found", 404, ErrorCode.SESSION_NOT_FOUND);
  }

  // Authorization
  if (callSession.userId !== userId && callSession.booking?.consultant.userId !== userId) {
    throw new AppError("Not authorized", 403, ErrorCode.AUTH_FORBIDDEN);
  }

  // Idempotency: already ended
  if (callSession.status === "ENDED") {
    return NextResponse.json({
      success: true,
      session: callSession,
      alreadyEnded: true,
    });
  }

  const now = new Date();
  const startTime = callSession.startTime;
  const durationSeconds = Math.floor((now.getTime() - startTime.getTime()) / 1000);

  if (durationSeconds < 1) {
    throw new AppError("Call duration too short", 400, ErrorCode.VALIDATION_INPUT);
  }

  const ratePerMinute = callSession.booking?.consultant.perMinuteRate || 50;
  const amount = (durationSeconds / 60) * ratePerMinute;
  const platformFee = amount * 0.10;
  const consultantEarning = amount - platformFee;

  // Upload recording if provided
  let recordingUrl: string | null = null;
  if (recordingFile) {
    try {
      const key = `recordings/${sessionId}/${Date.now()}.mp4`;
      recordingUrl = await uploadToR2(recordingFile, key);
    } catch (_) {
      // Continue without recording
    }
  }

  // Execute atomic transaction
  const result = await withTransaction(async (tx) => {
    // 1. Update session
    const updatedSession = await tx.callSession.update({
      where: { id: sessionId },
      data: {
        endTime: now,
        durationSeconds,
        amount,
        status: "ENDED",
        recordingUrl,
        recordingReady: !!recordingUrl,
      },
    });

    // 2. Charge user wallet
    if (callSession.userId && amount > 0) {
      const userWallet = await tx.wallet.findUnique({
        where: { userId: callSession.userId },
      });
      if (!userWallet) {
        throw new AppError("User wallet not found", 404, ErrorCode.WALLET_NOT_FOUND);
      }
      if (userWallet.balance < amount) {
        throw new InsufficientBalanceError(amount, userWallet.balance);
      }

      // Debit
      await Ledger.createTransaction({
        walletId: userWallet.id,
        type: "PAYMENT",
        amount: -amount,
        description: `Consultation fee (session ${sessionId})`,
        referenceId: sessionId,
      });
    }

    // 3. Credit consultant
    const consultantWallet = await tx.wallet.findUnique({
      where: { userId: callSession.booking!.consultant.userId },
    });
    if (consultantWallet && consultantEarning > 0) {
      await Ledger.createTransaction({
        walletId: consultantWallet.id,
        type: "COMMISSION",
        amount: consultantEarning,
        description: `Earnings from session ${sessionId}`,
        referenceId: sessionId,
      });
    }

    // 4. Update booking
    if (callSession.bookingId) {
      await tx.booking.update({
        where: { id: callSession.bookingId },
        data: {
          status: "COMPLETED",
          amount,
          platformFee,
          consultantEarning,
          rating: rating || undefined,
          review: review || undefined,
        },
      });
    }

    return updatedSession;
  });

  return NextResponse.json({
    success: true,
    session: result,
    durationSeconds,
    amount,
    platformFee,
    consultantEarning,
  });
});

// BATCH2_APPLIED
