import { NextResponse } from "next/server";
import { prisma } from "@zeal/database";
import { withErrorHandler } from "@/lib/errors";
import { requireSuperAdmin } from "@/lib/auth/admin";

export const GET = withErrorHandler(async () => {
  await requireSuperAdmin();

  const now = new Date();
  const startOfDay = new Date(now);
  startOfDay.setHours(0, 0, 0, 0);
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [
    totalUsers,
    activeConsultants,
    totalBookings,
    revenueToday,
    revenueMonth,
    liveSessions,
    pendingVerifications,
    unreadNotifications,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.consultant.count({ where: { status: "VERIFIED", isActive: true } }),
    prisma.booking.count(),
    prisma.transaction.aggregate({
      where: { type: "PAYMENT", createdAt: { gte: startOfDay } },
      _sum: { amount: true },
    }),
    prisma.transaction.aggregate({
      where: { type: "PAYMENT", createdAt: { gte: startOfMonth } },
      _sum: { amount: true },
    }),
    prisma.callSession.count({ where: { status: "INITIATED" } }),
    prisma.consultant.count({ where: { status: "PENDING" } }),
    prisma.notification.count({ where: { read: false } }),
  ]);

  return NextResponse.json({
    users: totalUsers,
    consultants: activeConsultants,
    bookings: totalBookings,
    revenueToday: Math.abs(revenueToday._sum.amount ?? 0),
    revenueMonth: Math.abs(revenueMonth._sum.amount ?? 0),
    liveSessions,
    pendingVerifications,
    unreadNotifications,
  });
});

// BATCH3_APPLIED
