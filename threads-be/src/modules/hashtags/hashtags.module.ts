import { Module } from '@nestjs/common';
import { HashtagsService } from './hashtags.service';
import { HashtagsController } from './hashtags.controller';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [HashtagsController],
  providers: [HashtagsService],
})
export class HashtagsModule {}
