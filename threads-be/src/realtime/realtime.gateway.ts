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
import { FollowsService } from 'src/modules/follows/follows.service';

@UseGuards(WsJwtGuard)
@WebSocketGateway({
  transport: ['websocket'],
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true,
  },
  namespace: '/rt',
})
export class RealTimeGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server;

  constructor(private followsService: FollowsService) {}
  private readonly logger = new Logger(RealTimeGateway.name);

  handleConnection(client: Socket) {
    const userId = this.extractUserId(client);
    const profileId = client.handshake.query.profileId as string;

    if (!userId) {
      this.logger.error('No userId, disconnecting');
      client.disconnect(true);
      return;
    }

    client.join(`user:${userId}`);

    client.join(`feed:${userId}`);

    this.logger.log(`User [${userId}] connected to /rt`);

    if (profileId) {
      client.join(`profile:${profileId}`);
      this.logger.log(`User [${userId}] joined profile:${profileId}`);
    }
  }

  handleDisconnect(client: Socket) {
    const userId = this.extractUserId(client);
    this.logger.log(`User [${userId}] disconnected from /rt`);
  }

  private extractUserId(client: Socket): string | null {
    return (
      client.data?.user?.sub ||
      client.data?.user?.id ||
      client.handshake.auth?.userId ||
      client.handshake.query?.userId ||
      null
    );
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

  // Join hashtag room
  @SubscribeMessage('hashtag:join')
  handleJoinHashtag(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { hashtag: string },
  ) {
    const room = `hashtag:${data.hashtag}`;
    client.join(room);
    this.logger.log(`Client ${client.id} joined ${room}`);
    client.emit('hashtag:joined', { hashtag: data.hashtag });
  }

  emitNewPostToFollowers(followerIds: string[], post: any) {
    followerIds.forEach((followerId) => {
      this.server.to(`feed:${followerId}`).emit('post:new', { post });
    });
    this.logger.debug(`Emitted new post to ${followerIds.length} followers`);
  }

  // Emit post update (edit, delete)
  emitPostUpdate(postId: string, authorId: string, update: any) {
    this.server.emit('post:updated', { postId, authorId, ...update });
  }

  // Emit reaction real-time (like, comment)
  emitReaction(postId: string, reaction: any) {
    this.server.emit('post:reaction', { postId, reaction });
  }

  emitProfileUpdate(profileId: string, profile: any) {
    this.logger.debug(`profile:${profileId}`);
    this.server.to(`profile:${profileId}`).emit('profile:updated', { profile });
    this.server.to(`user:${profileId}`).emit('profile:updated', { profile });
    this.emitToFollowers(profileId, profile);

    this.logger.log(`Profile ${profileId} updated broadcast to multiple rooms`);
  }

  async emitToFollowers(userId: string, profile: any) {
    const followers = await this.followsService.getFollowerList(userId);
    followers.forEach((follower) => {
      this.server.to(`feed:${follower.id}`).emit('profile:updated', { profile });
    });
  }

  emitToUser(userId: string, event: string, data: any) {
    this.server.to(`user:${userId}`).emit(event, data);
  }

  broadcastEvent(event: string, data: any) {
    this.server.emit(event, data);
  }

  emitToHashtag(hashtag: string, event: string, data: any) {
    this.server.to(`hashtag:${hashtag}`).emit(event, data);
  }
}
