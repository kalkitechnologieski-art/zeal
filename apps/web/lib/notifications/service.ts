import { prisma } from '@zeal/database';

export class NotificationService {
  static async createNotification(data: {
    userId: string;
    type: string;
    message: string;
    redirectUrl?: string;
    actorId: string;
  }) {
    const notif = await prisma.notification.create({
      data: {
        userId: data.userId,
        type: data.type,
        message: data.message,
        redirectUrl: data.redirectUrl,
        actorId: data.actorId,
        read: false,
      },
    });
    return notif;
  }

  static async markAsRead(notificationId: string, userId: string) {
    await prisma.notification.updateMany({
      where: { id: notificationId, userId },
      data: { read: true },
    });
  }

  static async markAllAsRead(userId: string) {
    await prisma.notification.updateMany({
      where: { userId, read: false },
      data: { read: true },
    });
  }

  static async getNotifications(userId: string, options?: { limit?: number; offset?: number }) {
    const limit = options?.limit || 50;
    const offset = options?.offset || 0;

    const [items, total, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.notification.count({ where: { userId } }),
      prisma.notification.count({ where: { userId, read: false } }),
    ]);

    return { items, total, unreadCount };
  }
}
