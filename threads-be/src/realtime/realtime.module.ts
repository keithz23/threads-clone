import { Module } from '@nestjs/common';
import { RealTimeGateWay } from './realtime.gateway';
import { RealtimeService } from './realtime.service';

@Module({
  providers: [RealTimeGateWay, RealtimeService],
  exports: [RealtimeService],
})
export class RealtimeModule {}
