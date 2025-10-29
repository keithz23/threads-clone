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
import { MessagesService } from './messages.service';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true,
  },
  namespace: '/messages', // Namespace for messages
})
export class MessagesGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(MessagesGateway.name);
  private onlineUsers = new Map<string, string>(); // userId -> socketId

  constructor(private readonly messagesService: MessagesService) {}

  handleConnection(client: Socket) {
    const userId = client.handshake.query.userId as string;

    if (userId) {
      this.onlineUsers.set(userId, client.id);
      this.logger.log(`User [${userId}] connected to messages`);

      // Broadcast online users
      this.server.emit('online-users', Array.from(this.onlineUsers.keys()));
    }
  }

  handleDisconnect(client: Socket) {
    const userId = this.getUserIdFromSocket(client);

    if (userId) {
      this.onlineUsers.delete(userId);
      this.server.emit('online-users', Array.from(this.onlineUsers.keys()));
      this.logger.log(`User [${userId}] disconnected from messages`);
    }
  }

  private getUserIdFromSocket(client: Socket): string | null {
    return (client.handshake.query.userId as string) || null;
  }

  // ===== SEND MESSAGE =====
  @SubscribeMessage('send-message')
  async handleSendMessage(
    @MessageBody()
    data: { conversationId: string; content: string; replyToId?: string },
    @ConnectedSocket() client: Socket,
  ) {
    const senderId = this.getUserIdFromSocket(client) || '';

    // 1. Save message in database
    const savedMessage = await this.messagesService.create({
      senderId,
      conversationId: data.conversationId,
      content: data.content,
      replyToId: String(data.replyToId),
    });

    // 2. Gửi đến người nhận qua socket
    const receiverSocketId = this.onlineUsers.get(data.conversationId);
    if (receiverSocketId) {
      this.server.to(receiverSocketId).emit('receive-message', savedMessage);
    }

    // 3. Confirm cho người gửi
    return { success: true, message: savedMessage };
  }

  // ===== TYPING INDICATOR =====
  @SubscribeMessage('typing')
  handleTyping(
    @MessageBody() data: { conversationId: string; replyToId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const senderId = this.getUserIdFromSocket(client);
    const receiverSocketId = this.onlineUsers.get(data.conversationId);

    if (receiverSocketId) {
      this.server.to(receiverSocketId).emit('user-typing', {
        senderId,
        replyToId: data.replyToId,
      });
    }
  }

  @SubscribeMessage('stop-typing')
  handleStopTyping(
    @MessageBody() data: { conversationId: string; replyToId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const senderId = this.getUserIdFromSocket(client);
    const receiverSocketId = this.onlineUsers.get(data.conversationId);

    if (receiverSocketId) {
      this.server.to(receiverSocketId).emit('user-stop-typing', {
        senderId,
        replyToId: data.replyToId,
      });
    }
  }

  // ===== JOIN/LEAVE CHAT =====
  @SubscribeMessage('join-chat')
  handleJoinChat(
    @MessageBody() data: { conversationId: string },
    @ConnectedSocket() client: Socket,
  ) {
    client.join(`chat-${data.conversationId}`);
    return { joined: true, conversationId: data.conversationId };
  }

  @SubscribeMessage('leave-chat')
  handleLeaveChat(
    @MessageBody() data: { conversationId: string },
    @ConnectedSocket() client: Socket,
  ) {
    client.leave(`chat-${data.conversationId}`);
    return { left: true, conversationId: data.conversationId };
  }

  // ===== MESSAGE READ =====
  @SubscribeMessage('mark-read')
  async handleMarkRead(
    @MessageBody() data: { messageIds: string[] },
    @ConnectedSocket() client: Socket,
  ) {
    const userId = this.getUserIdFromSocket(client);
    await this.messagesService.markAsRead(data.messageIds, String(userId));

    return { success: true };
  }

  // Utility: Gửi message từ service khác
  sendMessageToUser(userId: string, event: string, data: any) {
    const socketId = this.onlineUsers.get(userId);
    if (socketId) {
      this.server.to(socketId).emit(event, data);
    }
  }

  isUserOnline(userId: string): boolean {
    return this.onlineUsers.has(userId);
  }
}
