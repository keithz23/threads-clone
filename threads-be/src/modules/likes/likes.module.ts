import { Module } from '@nestjs/common';
import { LikesService } from './likes.service';
import { LikesController } from './likes.controller';
import { NotificationsGateway } from '../notifications/notifications.gateway';
import { NotificationsService } from '../notifications/notifications.service';

@Module({
  controllers: [LikesController],
  providers: [LikesService, NotificationsGateway, NotificationsService],
})
export class LikesModule {}
