import { Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { NotificationsGateway } from './notifications.gateway';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  providers: [NotificationsGateway, NotificationsService, PrismaService],
})
export class NotificationsModule {}
