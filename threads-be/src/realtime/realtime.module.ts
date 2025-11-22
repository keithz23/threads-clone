import { Global, Module } from '@nestjs/common';
import { RealTimeGateway } from './realtime.gateway';
import { RealtimeService } from './realtime.service';
import { WsJwtGuard } from 'src/common/guards/ws-jwt.guard';
import { FollowsModule } from 'src/modules/follows/follows.module';

@Global()
@Module({
  imports: [FollowsModule],
  providers: [RealTimeGateway, RealtimeService, WsJwtGuard],
  exports: [RealtimeService, RealTimeGateway],
})
export class RealtimeModule {}
