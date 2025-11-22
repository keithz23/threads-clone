import { Module } from '@nestjs/common';
import { RepostsService } from './reposts.service';
import { RepostsController } from './reposts.controller';
import { NotificationsModule } from '../notifications/notifications.module';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [NotificationsModule, PrismaModule],
  controllers: [RepostsController],
  providers: [RepostsService],
  exports: [RepostsService],
})
export class RepostsModule {}
