import { prisma } from '@zeal/database';
import { io } from '../socket';

export class NotificationService {
  static async create(data: {
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
    // Emit real-time
    io.to(`notif:${data.userId}`).emit('notification', notif);
    return notif;
  }

  static async markAsRead(userId: string, notificationId: string) {
    await prisma.notification.updateMany({
      where: { id: notificationId, userId },
      data: { read: true },
    });
  }

  static async markAllRead(userId: string) {
    await prisma.notification.updateMany({
      where: { userId, read: false },
      data: { read: true },
    });
  }
}
