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
  private connectedUsers = new Map<string, string>(); // userId -> socketId

  constructor(private readonly notificationsService: NotificationsService) {}

  handleConnection(client: Socket) {
    const userId = client.handshake.query.userId as string;

    if (userId) {
      this.connectedUsers.set(userId, client.id);
      this.logger.log(`User [${userId}] connected to notifications`);

      // Gửi unread count
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
    // const notifications =
    //   await this.notificationsService.getNotifications(userId);

    // return { notifications };
    return;
  }

  // ===== MARK AS READ =====
  @SubscribeMessage('mark-notification-read')
  async handleMarkRead(
    @MessageBody() data: { notificationId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const userId = this.getUserIdFromSocket(client);
    // await this.notificationsService.markAsRead(data.notificationId, userId);

    // // Update unread count
    // this.sendUnreadCount(userId);

    return { success: true };
  }

  // ===== MARK ALL AS READ =====
  @SubscribeMessage('mark-all-read')
  async handleMarkAllRead(@ConnectedSocket() client: Socket) {
    const userId = this.getUserIdFromSocket(client);
    // await this.notificationsService.markAllAsRead(userId);

    // this.sendUnreadCount(userId);

    return { success: true };
  }

  // Utility: Gửi notification từ service khác
  async sendNotification(userId: string, type: string, content: any) {
    // 1. Lưu vào database
    const notification = await this.notificationsService.create({
      userId,
      type,
      content,
    });

    // 2. Gửi real-time qua socket
    const socketId = this.connectedUsers.get(userId);
    if (socketId) {
      this.server.to(socketId).emit('new-notification', notification);

      // Update unread count
      this.sendUnreadCount(userId);
    }

    return notification;
  }

  private async sendUnreadCount(userId: string) {
    // const count = await this.notificationsService.getUnreadCount(userId);
    const socketId = this.connectedUsers.get(userId);

    // if (socketId) {
    //   this.server.to(socketId).emit('unread-count', { count });
    // }
  }

  isUserConnected(userId: string): boolean {
    return this.connectedUsers.has(userId);
  }
}
