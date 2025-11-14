import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { PostsController } from './posts.controller';
import { PostsService } from './posts.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { UploadModule } from 'src/uploads/upload.module';
import { S3Service } from 'src/uploads/s3.service';
import { LikesService } from '../likes/likes.service';
import { NotificationsGateway } from '../notifications/notifications.gateway';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationsModule } from '../notifications/notifications.module';
import { LikesModule } from '../likes/likes.module';
import { RepostsModule } from '../reposts/reposts.module';

@Module({
  imports: [
    PrismaModule,
    UploadModule,
    NotificationsModule,
    LikesModule,
    RepostsModule,
    BullModule.registerQueue({
      name: 'posts',
    }),
  ],
  controllers: [PostsController],
  providers: [PostsService, S3Service],
  exports: [PostsService],
})
export class PostsModule {}
