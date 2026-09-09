import { NextResponse } from "next/server";
import { getUserId } from "@/lib/auth";
import { prisma, withTransaction } from "@zeal/database";
import { withErrorHandler, AppError, ErrorCode } from "@/lib/errors";
import { Ledger } from "@/lib/wallet/ledger";
import { NotificationService } from "@/lib/notifications/service";

export const POST = withErrorHandler(async (req: Request, { params }: { params: Promise<{ id: string }> }) => {
  const userId = await getUserId();
  if (!userId) throw new AppError("Unauthorized", 401, ErrorCode.AUTH_UNAUTHORIZED);

  const { id } = await params;

  const booking = await prisma.booking.findUnique({
    where: { id },
    include: { consultant: { include: { user: true } }, user: true },
  });

  if (!booking) {
    throw new AppError("Booking not found", 404, ErrorCode.BOOKING_NOT_FOUND);
  }

  // Only user or consultant or admin can cancel
  if (booking.userId !== userId && booking.consultant.userId !== userId) {
    throw new AppError("Not authorized", 403, ErrorCode.AUTH_FORBIDDEN);
  }

  if (booking.status === "CANCELLED") {
    return NextResponse.json({ booking });
  }

  if (booking.status === "COMPLETED") {
    throw new AppError("Cannot cancel completed booking", 400, ErrorCode.BOOKING_CONFLICT);
  }

  // Perform cancellation with refund if applicable
  const result = await withTransaction(async (tx) => {
    // Refund if booking was confirmed and user exists
    if (booking.status === "CONFIRMED" && booking.userId) {
      const wallet = await tx.wallet.findUnique({
        where: { userId: booking.userId },
      });
      if (wallet) {
        await Ledger.createTransaction({
          walletId: wallet.id,
          type: "REFUND",
          amount: booking.amount,
          description: `Refund for cancelled booking ${booking.id}`,
          referenceId: booking.id,
        });
      }
    }

    const updated = await tx.booking.update({
      where: { id },
      data: { status: "CANCELLED" },
    });
    return updated;
  });

  // Notify other party
  const recipientId = booking.userId ?? booking.consultant.userId;
  await NotificationService.createNotification({
    userId: recipientId,
    type: "booking",
    message: `Booking ${booking.id} has been cancelled.`,
    redirectUrl: `/bookings`,
    actorId: userId,
  });

  return NextResponse.json({ booking: result });
});

// BATCH2_APPLIED
