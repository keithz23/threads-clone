import { Injectable } from '@nestjs/common';
import { RealTimeGateway } from './realtime.gateway';

@Injectable()
export class RealtimeService {
  constructor(private readonly gw: RealTimeGateway) {}
  emitToUser(userId: string, event: string, data: any) {
    this.gw.server.to(`user:${userId}`).emit(event, data);
  }
  emitToRoom(room: string, event: string, data: any) {
    this.gw.server.to(room).emit(event, data);
  }
}
