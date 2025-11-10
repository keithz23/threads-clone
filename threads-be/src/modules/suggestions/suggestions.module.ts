import { Module } from '@nestjs/common';
import { SuggestionsService } from './suggestions.service';
import { SuggestionsController } from './suggestions.controller';
import { PrismaService } from 'src/prisma/prisma.service';
import { FollowsService } from '../follows/follows.service';
import { NotificationsGateway } from '../notifications/notifications.gateway';
import { NotificationsService } from '../notifications/notifications.service';

@Module({
  controllers: [SuggestionsController],
  providers: [
    SuggestionsService,
    PrismaService,
    FollowsService,
    NotificationsGateway,
    NotificationsService,
  ],
})
export class SuggestionsModule {}
