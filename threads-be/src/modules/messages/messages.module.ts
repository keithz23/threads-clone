import { Module } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { MessagesGateway } from './messages.gateway';
import { MessagesHttpController } from './message.controller';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [MessagesHttpController],
  providers: [MessagesGateway, MessagesService],
  exports: [MessagesGateway, MessagesService],
})
export class MessagesModule {}
