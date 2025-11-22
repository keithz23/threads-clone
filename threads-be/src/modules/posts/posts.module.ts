import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { PostsController } from './posts.controller';
import { PostsService } from './posts.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { UploadModule } from 'src/uploads/upload.module';
import { S3Service } from 'src/uploads/s3.service';
import { NotificationsModule } from '../notifications/notifications.module';
import { LikesModule } from '../likes/likes.module';
import { RepostsModule } from '../reposts/reposts.module';
import { FollowsModule } from '../follows/follows.module';

@Module({
  imports: [
    FollowsModule,
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
