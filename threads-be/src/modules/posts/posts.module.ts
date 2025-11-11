import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { PostsController } from './posts.controller';
import { PostsService } from './posts.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { QUEUE_NAMES } from 'src/common/constants/queue.constant';
import { UploadModule } from 'src/uploads/upload.module';
import { S3Service } from 'src/uploads/s3.service';

@Module({
  imports: [
    PrismaModule,
    UploadModule,
    BullModule.registerQueue({
      name: 'posts', 
    }),
  ],
  controllers: [PostsController],
  providers: [PostsService, S3Service],
  exports: [PostsService],
})
export class PostsModule {}
