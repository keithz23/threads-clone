import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { OnEvent } from '@nestjs/event-emitter';
import { NotificationsGateway } from './notifications.gateway';
import { NotificationType } from '@prisma/client';
import { CreateNotificationDto } from './dto/create-notification.dto';

@Injectable()
export class NotificationsService implements OnModuleInit {
  constructor(
    private readonly prisma: PrismaService,
    private readonly gateway: NotificationsGateway,
  ) {}

  onModuleInit() {}

  @OnEvent('notifications.get')
  async handleGetNotifications(payload: { userId: string; socketId?: string }) {
    const { userId, socketId } = payload;
    const notifications = await this.getNotifications(userId);
    // emit về client qua gateway
    this.gateway.emitToUserById(userId, 'notifications:initial', notifications);
  }

  @OnEvent('notifications.markRead')
  async handleMarkRead(payload: {
    userId: string;
    notificationId: string;
    socketId?: string;
  }) {
    const { userId, notificationId } = payload;
    await this.markAsRead(notificationId, userId);
    const count = await this.getUnreadCount(userId);
    this.gateway.emitToUserById(userId, 'unread-count', { count });
  }

  @OnEvent('notifications.markAllRead')
  async handleMarkAllRead(payload: { userId: string; socketId?: string }) {
    const { userId } = payload;
    await this.markAllAsRead(userId);
    this.gateway.emitToUserById(userId, 'unread-count', { count: 0 });
  }

  // Public method used by other services to create notification
  async sendNotification(data: {
    userId: string;
    actorId: string;
    type: NotificationType;
    postId?: string;
  }) {
    if (data.userId === data.actorId) return null;

    const duplicate = await this.findDuplicate(data);
    if (duplicate) return duplicate;

    const notification = await this.create({
      userId: data.userId,
      actorId: data.actorId,
      type: data.type,
      postId: data.postId,
    });

    // Real-time emit if user connected
    if (this.gateway.isUserConnected(data.userId)) {
      this.gateway.emitToUserById(
        data.userId,
        'new-notification',
        notification,
      );
      const count = await this.getUnreadCount(data.userId);
      this.gateway.emitToUserById(data.userId, 'unread-count', { count });
    }

    return notification;
  }

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
        post: { select: { id: true, content: true } },
      },
    });
  }

  async getNotifications(userId: string, limit = 20) {
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
        post: { select: { id: true, content: true } },
      },
    });
  }

  async markAsRead(notificationId: string, userId: string) {
    return await this.prisma.notification.updateMany({
      where: { id: notificationId, userId },
      data: { isRead: true },
    });
  }

  async markAllAsRead(userId: string) {
    return await this.prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
  }

  async getUnreadCount(userId: string) {
    return await this.prisma.notification.count({
      where: { userId, isRead: false },
    });
  }

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
