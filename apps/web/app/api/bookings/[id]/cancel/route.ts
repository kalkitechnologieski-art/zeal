import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@zeal/database";
import { NotificationService } from "@/lib/notifications/service";
import { Ledger } from "@/lib/wallet/ledger";
import { withErrorHandler, AppError, HTTP_STATUS } from "@/lib/errors";

export const POST = withErrorHandler(async (
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { userId } = await auth();
  if (!userId) throw new AppError("Unauthorized", HTTP_STATUS.UNAUTHORIZED);
  const { id } = await params;

  const booking = await prisma.booking.findUnique({
    where: { id },
    include: { consultant: { include: { user: true } }, user: true },
  });
  if (!booking) throw new AppError("Booking not found", HTTP_STATUS.NOT_FOUND);

  // Only the user, consultant, or admin can cancel (admin check via role is optional; here we only check user/consultant)
  if (booking.userId !== userId && booking.consultant.userId !== userId) {
    throw new AppError("Not authorized", HTTP_STATUS.FORBIDDEN);
  }

  if (booking.status === "CANCELLED") return NextResponse.json({ booking });

  // If confirmed, refund the user's wallet (only if there is a user)
  if (booking.status === "CONFIRMED" && booking.userId) {
    const wallet = await prisma.wallet.findUnique({ where: { userId: booking.userId } });
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

  const updated = await prisma.booking.update({
    where: { id },
    data: { status: "CANCELLED" },
    include: { consultant: { include: { user: true } }, user: true },
  });

  // Notify the other party
  const recipientId = booking.userId ?? booking.consultant.userId;
  await NotificationService.createNotification({
    userId: recipientId,
    type: "booking",
    message: `Booking ${booking.id} has been cancelled.`,
    redirectUrl: `/bookings`,
    actorId: userId,
  });

  return NextResponse.json({ booking: updated });
});
