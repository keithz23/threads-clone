import { Module } from '@nestjs/common';
import { RepostsService } from './reposts.service';
import { RepostsController } from './reposts.controller';

@Module({
  controllers: [RepostsController],
  providers: [RepostsService],
})
export class RepostsModule {}
