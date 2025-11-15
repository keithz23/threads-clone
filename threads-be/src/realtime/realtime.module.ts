import { Global, Module } from '@nestjs/common';
import { RealTimeGateWay } from './realtime.gateway';
import { RealtimeService } from './realtime.service';
import { WsJwtGuard } from 'src/common/guards/ws-jwt.guard';

@Global()
@Module({
  providers: [RealTimeGateWay, RealtimeService, WsJwtGuard],
  exports: [RealtimeService, RealTimeGateWay],
})
export class RealtimeModule {}
