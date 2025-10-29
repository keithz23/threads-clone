import { Body, Controller, Post } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { MessagesGateway } from './messages.gateway';
import { CreateMessageDto } from './dto/create-message.dto';

@Controller('messages')
export class MessagesHttpController {
  constructor(
    private readonly messagesService: MessagesService,
    private readonly messagesGateway: MessagesGateway,
  ) {}

  @Post('send')
  async sendViaHttp(
    @Body()
    dto: CreateMessageDto,
  ) {
    return;
  }
}
