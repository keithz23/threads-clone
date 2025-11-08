import { Module } from '@nestjs/common';
import { FollowsService } from './follows.service';
import { FollowsController } from './follows.controller';
import { PrismaService } from 'src/prisma/prisma.service';
import { NotificationsGateway } from '../notifications/notifications.gateway';
import { NotificationsService } from '../notifications/notifications.service';

@Module({
  controllers: [FollowsController],
  providers: [
    FollowsService,
    PrismaService,
    NotificationsGateway,
    NotificationsService,
  ],
})
export class FollowsModule {}
