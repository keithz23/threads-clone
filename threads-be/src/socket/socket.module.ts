import { Module, Global } from '@nestjs/common';
import { SocketRedisService } from './socket-redis.service';

@Global()
@Module({
  providers: [SocketRedisService],
  exports: [SocketRedisService],
})
export class SocketModule {}
