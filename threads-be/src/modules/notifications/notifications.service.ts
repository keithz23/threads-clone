import { Injectable } from '@nestjs/common';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { NotificationType } from '@prisma/client';

@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService) {}
  async create(createNotificationDto: CreateNotificationDto) {
    const { userId, type, postId, actorId } = createNotificationDto;
    return await this.prisma.notification.create({
      data: {
        userId,
        type,
        actorId,
        isRead: false,
        postId,
      },
      include: {
        actor: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatarUrl: true,
          },
        },
        post: {
          select: {
            id: true,
            content: true,
          },
        },
      },
    });
  }

  async getNotifications(userId: string, limit: number = 20) {
    return await this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        actor: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatarUrl: true,
          },
        },
        post: {
          select: {
            id: true,
            content: true,
          },
        },
      },
    });
  }

  async markAsRead(notificationId: string, userId: string) {
    return await this.prisma.notification.updateMany({
      where: {
        id: notificationId,
        userId,
      },
      data: {
        isRead: true,
      },
    });
  }

  async markAllAsRead(userId: string) {
    return await this.prisma.notification.updateMany({
      where: {
        userId,
        isRead: false,
      },
      data: {
        isRead: true,
      },
    });
  }

  async getUnreadCount(userId: string) {
    return await this.prisma.notification.count({
      where: {
        userId,
        isRead: false,
      },
    });
  }

  // Check for duplicate notification (optional - prevents spam)
  async findDuplicate(data: {
    userId: string;
    actorId: string;
    type: NotificationType;
    postId?: string;
  }) {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    return await this.prisma.notification.findFirst({
      where: {
        userId: data.userId,
        actorId: data.actorId,
        type: data.type,
        postId: data.postId,
        createdAt: { gte: oneDayAgo },
      },
    });
  }
}
