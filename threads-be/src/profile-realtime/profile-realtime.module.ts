import { Module } from '@nestjs/common';
import { RealtimeModule } from 'src/realtime/realtime.module';
import { ProfileRealtimeListener } from './profile.realtime.listener';

@Module({
  imports: [RealtimeModule],
  providers: [ProfileRealtimeListener],
})
export class ProfileRealtimeModule {}
