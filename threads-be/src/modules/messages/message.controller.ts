import { Body, Controller, Post } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { MessagesGateway } from './messages.gateway';
import { CreateMessageDto } from './dto/create-message.dto';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { User } from '@prisma/client';

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
    @CurrentUser() user: User,
  ) {
    const msg = await this.messagesService.createMessage({
      ...dto,
      senderId: user.id,
    });

    return msg;
  }
}
