import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { ConversationsService } from './conversations.service';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { UpdateConversationDto } from './dto/update-conversation.dto';
import { AddParticipantDto } from './dto/add-participant.dto';
import { ToggleMuteDto } from './dto/toggle-mute.dto';

@ApiTags('Conversations')
@Controller('conversations')
export class ConversationsController {
  constructor(private readonly conversationService: ConversationsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new conversation' })
  async create(
    @Body() dto: CreateConversationDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.conversationService.create(dto, userId);
  }

  @Get()
  @ApiOperation({ summary: 'Get user conversations' })
  async findAll(
    @CurrentUser('id') userId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.conversationService.findUserConversations(userId, page, limit);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get conversation by ID' })
  async findOne(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.conversationService.findOne(id, userId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update conversation' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateConversationDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.conversationService.update(id, userId, dto);
  }

  @Post(':id/participants')
  @ApiOperation({ summary: 'Add participant to group' })
  async addParticipant(
    @Param('id') id: string,
    @Body() dto: AddParticipantDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.conversationService.addParticipant(id, userId, dto.userId);
  }

  @Post(':id/leave')
  @ApiOperation({ summary: 'Leave conversation' })
  async leave(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.conversationService.leaveConversation(id, userId);
  }

  @Post(':id/pin')
  @ApiOperation({ summary: 'Toggle pin conversation' })
  async togglePin(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.conversationService.togglePin(id, userId);
  }

  @Post(':id/mute')
  @ApiOperation({ summary: 'Toggle mute conversation' })
  async toggleMute(
    @Param('id') id: string,
    @Body() dto: ToggleMuteDto,
    @CurrentUser('id') userId: string,
  ) {
    const mutedUntil = dto.mutedUntil ? new Date(dto.mutedUntil) : undefined;
    return this.conversationService.toggleMute(id, userId, mutedUntil);
  }
}
