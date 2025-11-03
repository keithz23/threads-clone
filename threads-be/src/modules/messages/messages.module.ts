import { Module } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { MessagesGateway } from './messages.gateway';
import { PrismaService } from 'src/prisma/prisma.service';
import { MessagesHttpController } from './message.controller';

@Module({
  controllers: [MessagesHttpController],
  providers: [MessagesGateway, MessagesService, PrismaService],
  exports: [MessagesGateway, MessagesService],
})
export class MessagesModule {}
