import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, UseGuards } from '@nestjs/common';
import { WsJwtGuard } from 'src/common/guards/ws-jwt.guard';

@UseGuards(WsJwtGuard)
@WebSocketGateway({
  transport: ['websocket'],
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true,
  },
  namespace: '/rt',
})
export class RealTimeGateWay
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server;

  private readonly logger = new Logger(RealTimeGateWay.name);

  handleConnection(client: Socket) {
    const userId =
      (client.data?.user?.sub as string) ||
      (client.data?.user?.id as string) ||
      (client.handshake.auth?.userId as string) ||
      (client.handshake.query?.userId as string) ||
      null;

    const profileId = client.handshake.query.profileId as string;

    if (!userId) {
      this.logger.error('No userId, disconnecting');
      client.disconnect(true);
      return;
    }

    client.join(`user:${userId}`);
    this.logger.log(`User [${userId}] connected to /rt`);

    if (profileId) {
      client.join(`profile:${profileId}`);
      this.logger.log(`User [${userId}] joined profile:${profileId}`);
    }
  }

  handleDisconnect(client: Socket) {
    const userId = client.handshake.query.userId as string;
    this.logger.log(`User [${userId}] disconnected from /rt`);
  }

  @SubscribeMessage('room:join')
  handleJoinRoom(@ConnectedSocket() client: Socket, @MessageBody() data: any) {
    const { profileId, room } = data;
    const roomName = room || (profileId ? `profile:${profileId}` : null);

    if (roomName) {
      client.join(roomName);
      this.logger.log(`Client ${client.id} joined room: ${roomName}`);
      client.emit('room:joined', { room: roomName });
    }
  }

  emitProfileUpdate(profileId: string, profile: any) {
    this.server.to(`profile:${profileId}`).emit('profile.updated', { profile });
  }

  emitToUser(userId: string, event: string, data: any) {
    this.server.to(`user:${userId}`).emit(event, data);
  }

  broadcastEvent(event: string, data: any) {
    this.server.emit(event, data);
  }
}
