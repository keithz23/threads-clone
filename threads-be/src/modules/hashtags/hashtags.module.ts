import { Module } from '@nestjs/common';
import { HashtagsService } from './hashtags.service';
import { HashtagsController } from './hashtags.controller';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  controllers: [HashtagsController],
  providers: [HashtagsService, PrismaService],
})
export class HashtagsModule {}
