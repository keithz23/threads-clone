import { Logger } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true,
  },
  namespace: '/rt',
})
export class RealTimeGateWay
  implements OnGatewayConnection, OnGatewayDisconnect
{
  private logger = new Logger(RealTimeGateWay.name);

  @WebSocketServer() server: Server;

  handleConnection(client: Socket) {
    const userId = client.handshake.query.userId as string;
    const profileId = client.handshake.query.profileId as string;

    this.logger.log(`Client connecting... Socket ID: ${client.id}`);
    this.logger.log(`User ID: ${userId}`);
    this.logger.log(`Profile ID: ${profileId}`);

    if (!userId) {
      this.logger.error('No userId provided, disconnecting client');
      client.disconnect(true);
      return;
    }

    // Join user room
    client.join(`user:${userId}`);
    this.logger.log(`User [${userId}] joined room: user:${userId}`);

    // Join profile room if profileId exists
    if (profileId) {
      client.join(`profile:${profileId}`);
      this.logger.log(`User [${userId}] joined room: profile:${profileId}`);
    }
  }

  handleDisconnect(client: Socket) {
    const userId = client.handshake.query.userId as string;
    this.logger.log(`User [${userId}] disconnected. Socket ID: ${client.id}`);
  }

  // Handle manual room join
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

  // Handle room leave
  @SubscribeMessage('room:leave')
  handleLeaveRoom(@ConnectedSocket() client: Socket, @MessageBody() data: any) {
    const { profileId, room } = data;
    const roomName = room || (profileId ? `profile:${profileId}` : null);

    if (roomName) {
      client.leave(roomName);
      this.logger.log(`Client ${client.id} left room: ${roomName}`);
      client.emit('room:left', { room: roomName });
    }
  }

  // ===== Helper methods to emit events =====

  /**
   * Emit profile update to a specific profile room
   */
  emitProfileUpdate(profileId: string, profile: any) {
    this.logger.log(
      `Emitting profile.updated to room: profile:${profileId}`,
    );
    this.server.to(`profile:${profileId}`).emit('profile.updated', { profile });
  }

  /**
   * Emit profile update to a specific user
   */
  emitProfileUpdateToUser(userId: string, profile: any) {
    this.logger.log(`Emitting profile.updated to user: ${userId}`);
    this.server.to(`user:${userId}`).emit('profile.updated', { profile });
  }

  /**
   * Broadcast profile update to all connected clients
   */
  broadcastProfileUpdate(profile: any) {
    this.logger.log(`Broadcasting profile.updated to all clients`);
    this.server.emit('profile.updated', { profile });
  }
}
