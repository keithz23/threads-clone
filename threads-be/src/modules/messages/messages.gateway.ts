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
import { Logger, UseGuards } from '@nestjs/common';
import { WsJwtGuard } from 'src/common/guards/ws-jwt.guard';

@UseGuards(WsJwtGuard)
@WebSocketGateway({
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true,
  },
  namespace: '/messages',
})
export class MessagesGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(MessagesGateway.name);
  private onlineUsers = new Map<string, string>();

  handleConnection(client: Socket) {
    const userId =
      (client.data?.user?.sub as string) ||
      (client.data?.user?.id as string) ||
      (client.handshake.auth?.userId as string) ||
      (client.handshake.query?.userId as string) ||
      null;

    if (!userId) {
      this.logger.error('No userId, disconnecting');
      client.disconnect(true);
      return;
    }

    this.onlineUsers.set(userId, client.id);
    this.logger.log(`User [${userId}] connected`);

    this.server.emit('online-users', Array.from(this.onlineUsers.keys()));
  }

  handleDisconnect(client: Socket) {
    const userId = this.getUserIdFromSocket(client);

    if (userId) {
      this.onlineUsers.delete(userId);
      this.server.emit('online-users', Array.from(this.onlineUsers.keys()));
      this.logger.log(`User [${userId}] disconnected`);
    }
  }

  private getUserIdFromSocket(client: Socket): string | null {
    return (client.handshake.query.userId as string) || null;
  }

  @SubscribeMessage('join-conversation')
  async handleJoinConversation(
    @MessageBody() data: { conversationId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const roomName = `conversation:${data.conversationId}`;
    client.join(roomName);

    this.logger.log(
      `User [${this.getUserIdFromSocket(client)}] joined ${roomName}`,
    );

    return { joined: true, conversationId: data.conversationId };
  }

  @SubscribeMessage('send-message')
  async handleSendMessage(
    @MessageBody()
    data: { conversationId: string; content: string; replyToId?: string },
    @ConnectedSocket() client: Socket,
  ) {
    const senderId = this.getUserIdFromSocket(client);

    if (!senderId) {
      return { success: false, error: 'User not authenticated' };
    }

    // try {
    //   const savedMessage = await this.messagesService.createMessage({
    //     senderId,
    //     conversationId: data.conversationId,
    //     content: data.content,
    //     replyToId: data.replyToId,
    //   });

    //   // Redis adapter auto broadcast across all servers
    //   const roomName = `conversation:${data.conversationId}`;
    //   this.server.to(roomName).emit('receive-message', savedMessage);

    //   return { success: true };
    // } catch (error) {
    //   this.logger.error('Error sending message:', error);
    //   return { success: false, error: 'Failed to send message' };
    // }
  }

  @SubscribeMessage('typing')
  handleTyping(
    @MessageBody() data: { conversationId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const senderId = this.getUserIdFromSocket(client);
    const roomName = `conversation:${data.conversationId}`;

    client.to(roomName).emit('user-typing', {
      senderId,
      conversationId: data.conversationId,
    });
  }

  @SubscribeMessage('stop-typing')
  handleStopTyping(
    @MessageBody() data: { conversationId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const senderId = this.getUserIdFromSocket(client);
    const roomName = `conversation:${data.conversationId}`;

    client.to(roomName).emit('user-stop-typing', {
      senderId,
      conversationId: data.conversationId,
    });
  }

  sendtoConversation(conversationId: string, event: string, data: any) {
    const roomName = `conversation:${conversationId}`;
    this.server.to(roomName).emit(event, data);
    this.logger.log(`Sent ${event} to ${roomName}`);
  }

  sendToUser(userId: string, event: string, data: any) {
    const socketId = this.onlineUsers.get(userId);
    if (socketId) {
      this.server.to(socketId).emit(event, data);
      this.logger.log(`Sent ${event} to user [${userId}]`);
    } else {
      this.logger.warn(`User [${userId}] is not online`);
    }
  }

  broadcastToAll(event: string, data: any) {
    this.server.emit(event, data);
  }

  isUserOnline(userId: string): boolean {
    return this.onlineUsers.has(userId);
  }

  getOnlineUsersInConversation(conversationId: string): string[] {
    const roomName = `conversation:${conversationId}`;
    const room = this.server.sockets.adapter.rooms.get(roomName);

    if (!room) return [];

    const onlineUserIds: string[] = [];
    for (const [userId, socketId] of this.onlineUsers.entries()) {
      if (room.has(socketId)) {
        onlineUserIds.push(userId);
      }
    }
    return onlineUserIds;
  }

  broadcastTyping(conversationId: string, userId: string, isTyping: boolean) {
    const roomName = `conversation:${conversationId}`;
    const event = isTyping ? 'user-typing' : 'user-stop-typing';

    this.server.to(roomName).emit(event, {
      userId,
      conversationId,
    });
  }
}
