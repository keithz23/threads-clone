import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { EventEmitter2 } from '@nestjs/event-emitter';
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

  constructor(private readonly eventEmitter: EventEmitter2) {}

  handleConnection(client: Socket) {
    const userId = client.handshake.query.userId as string;
    if (userId) {
      this.connectedUsers.set(userId, client.id);
      this.logger.log(`User [${userId}] connected to notifications`);
      this.eventEmitter.emit('notifications.connected', {
        userId,
        socketId: client.id,
      });
    }
  }

  handleDisconnect(client: Socket) {
    const userId = (client.handshake.query.userId as string) || null;
    if (userId) {
      this.connectedUsers.delete(userId);
      this.logger.log(`User [${userId}] disconnected from notifications`);
      this.eventEmitter.emit('notifications.disconnected', {
        userId,
        socketId: client.id,
      });
    }
  }

  // Client -> server messages;
  @SubscribeMessage('get-notifications')
  handleGetNotifications(@ConnectedSocket() client: Socket) {
    const userId = client.handshake.query.userId as string;
    if (!userId) {
      client.emit('notifications:error', { message: 'User not authenticated' });
      return;
    }
    this.eventEmitter.emit('notifications.get', {
      userId,
      socketId: client.id,
    });
  }

  @SubscribeMessage('mark-notification-read')
  handleMarkRead(
    @MessageBody() data: { notificationId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const userId = client.handshake.query.userId as string;
    if (!userId) {
      client.emit('notifications:error', { message: 'User not authenticated' });
      return;
    }
    this.eventEmitter.emit('notifications.markRead', {
      userId,
      notificationId: data.notificationId,
      socketId: client.id,
    });
  }

  @SubscribeMessage('mark-all-read')
  handleMarkAllRead(@ConnectedSocket() client: Socket) {
    const userId = client.handshake.query.userId as string;
    if (!userId) {
      client.emit('notifications:error', { message: 'User not authenticated' });
      return;
    }
    this.eventEmitter.emit('notifications.markAllRead', {
      userId,
      socketId: client.id,
    });
  }

  // ----- helper methods for service to call -----
  emitToUserById(userId: string, event: string, payload: any) {
    const socketId = this.connectedUsers.get(userId);
    if (socketId) {
      this.server.to(socketId).emit(event, payload);
    }
  }

  isUserConnected(userId: string) {
    return this.connectedUsers.has(userId);
  }

  getSocketId(userId: string) {
    return this.connectedUsers.get(userId);
  }
}
