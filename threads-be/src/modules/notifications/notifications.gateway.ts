import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { NotificationsService } from './notifications.service';
import { Logger } from '@nestjs/common';
import { NotificationType } from '@prisma/client';

@WebSocketGateway({
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true,
  },
  namespace: '/notifications',
})
export class NotificationsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(NotificationsGateway.name);
  private connectedUsers = new Map<string, string>();

  constructor(private readonly notificationsService: NotificationsService) {}

  handleConnection(client: Socket) {
    const userId = client.handshake.query.userId as string;

    if (userId) {
      this.connectedUsers.set(userId, client.id);
      this.logger.log(`User [${userId}] connected to notifications`);

      // Send unread count
      this.sendUnreadCount(userId);
    }
  }

  handleDisconnect(client: Socket) {
    const userId = this.getUserIdFromSocket(client);

    if (userId) {
      this.connectedUsers.delete(userId);
      this.logger.log(`User [${userId}] disconnected from notifications`);
    }
  }

  private getUserIdFromSocket(client: Socket): string | null {
    return (client.handshake.query.userId as string) || null;
  }

  // ===== GET NOTIFICATIONS =====
  @SubscribeMessage('get-notifications')
  async handleGetNotifications(@ConnectedSocket() client: Socket) {
    const userId = this.getUserIdFromSocket(client);

    if (!userId) {
      return { error: 'User not authenticated' };
    }

    const notifications =
      await this.notificationsService.getNotifications(userId);

    client.emit('notifications:initial', notifications);

    return { notifications };
  }

  // ===== MARK AS READ =====
  @SubscribeMessage('mark-notification-read')
  async handleMarkRead(
    @MessageBody() data: { notificationId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const userId = this.getUserIdFromSocket(client);

    if (!userId) {
      return { error: 'User not authenticated' };
    }

    await this.notificationsService.markAsRead(data.notificationId, userId);

    // Update unread count
    this.sendUnreadCount(userId);

    return { success: true };
  }

  // ===== MARK ALL AS READ =====
  @SubscribeMessage('mark-all-read')
  async handleMarkAllRead(@ConnectedSocket() client: Socket) {
    const userId = this.getUserIdFromSocket(client);

    if (!userId) {
      return { error: 'User not authenticated' };
    }

    await this.notificationsService.markAllAsRead(userId);

    this.sendUnreadCount(userId);

    return { success: true };
  }

  // ===== SEND NOTIFICATION  =====
  async sendNotification(data: {
    userId: string;
    actorId: string;
    type: NotificationType;
    postId?: string;
  }) {
    // Don't send notification to yourself
    if (data.userId === data.actorId) {
      return null;
    }

    // Check for duplicate notification (optional)
    const duplicate = await this.notificationsService.findDuplicate(data);
    if (duplicate) {
      this.logger.log(
        `Duplicate notification prevented for user ${data.userId}`,
      );
      return duplicate;
    }

    // Create notification in database
    const notification = await this.notificationsService.create(data);

    // Send real-time notification if user is connected
    const socketId = this.connectedUsers.get(data.userId);
    if (socketId) {
      this.server.to(socketId).emit('new-notification', notification);

      // Update unread count
      this.sendUnreadCount(data.userId);
    }

    return notification;
  }

  private async sendUnreadCount(userId: string) {
    const count = await this.notificationsService.getUnreadCount(userId);
    const socketId = this.connectedUsers.get(userId);

    if (socketId) {
      this.server.to(socketId).emit('unread-count', { count });
    }
  }

  isUserConnected(userId: string): boolean {
    return this.connectedUsers.has(userId);
  }
}
