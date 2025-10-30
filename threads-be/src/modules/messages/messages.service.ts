import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Message, MessageStatus, MessageType } from '@prisma/client';

@Injectable()
export class MessagesService {
  constructor(private prisma: PrismaService) {}
  /**
   * Create a new message in a conversation
   */
  async createMessage(dto: CreateMessageDto): Promise<Message> {
    // 1. Validate conversation exists and user is participant
    const participant = await this.prisma.conversationParticipant.findUnique({
      where: {
        conversationId_userId: {
          conversationId: dto.conversationId,
          userId: dto.senderId,
        },
      },
      include: {
        conversation: {
          include: {
            participants: {
              where: {
                userId: { not: dto.senderId },
                leftAt: null,
              },
            },
          },
        },
      },
    });

    if (!participant) {
      throw new ForbiddenException(
        'You are not a participant in this conversation',
      );
    }

    if (participant.leftAt) {
      throw new ForbiddenException('You have left this conversation');
    }

    // 2. Validate reply message exists (if replying)
    if (dto.replyToId) {
      const replyToMessage = await this.prisma.message.findFirst({
        where: {
          id: dto.replyToId,
          conversationId: dto.conversationId,
          isDeleted: false,
        },
      });

      if (!replyToMessage) {
        throw new NotFoundException('Reply message not found');
      }
    }

    // 3. Validate content based on message type
    const messageType = dto.messageType || MessageType.TEXT;
    this.validateMessageContent(dto.content, messageType, dto.mediaUrl);

    // 4. Extract mentions from content
    const mentions = this.extractMentions(dto.content || '');

    // 5. Process metadata based on message type
    const metadata = this.buildMetadata(messageType, dto.mediaUrl);

    // 6. Create message and update conversation in transaction
    const message = await this.prisma.$transaction(async (tx) => {
      // Create the message
      const newMessage = await tx.message.create({
        data: {
          conversationId: dto.conversationId,
          senderId: dto.senderId,
          content: dto.content,
          type: messageType,
          status: MessageStatus.SENT,
          replyToId: dto.replyToId,
          mentions,
          metadata,
        },
        include: {
          sender: {
            select: {
              id: true,
              username: true,
              displayName: true,
              avatarUrl: true,
              isOnline: true,
            },
          },
          replyTo: {
            include: {
              sender: {
                select: {
                  id: true,
                  username: true,
                  displayName: true,
                  avatarUrl: true,
                },
              },
            },
          },
        },
      });

      // Update conversation's last message
      await tx.conversation.update({
        where: { id: dto.conversationId },
        data: {
          lastMessageId: newMessage.id,
          lastMessageAt: newMessage.createdAt,
          messageCount: { increment: 1 },
        },
      });

      // Update unread counts for other participants
      const otherParticipants = participant.conversation.participants;

      for (const otherParticipant of otherParticipants) {
        const isMentioned = mentions.includes(otherParticipant.userId);

        await tx.conversationParticipant.update({
          where: { id: otherParticipant.id },
          data: {
            unreadCount: { increment: 1 },
            ...(isMentioned && { mentionCount: { increment: 1 } }),
          },
        });
      }

      // Create attachments if media URL provided
      if (dto.mediaUrl && this.isMediaType(messageType)) {
        await tx.messageAttachment.create({
          data: {
            messageId: newMessage.id,
            url: dto.mediaUrl,
            fileName: this.extractFileName(dto.mediaUrl),
            fileSize: 0, // Should be provided from upload service
            mimeType: this.getMimeType(messageType),
          },
        });
      }

      return newMessage;
    });

    // 7. TODO: Emit WebSocket event for real-time updates
    // this.eventEmitter.emit('message.created', {
    //   conversationId: dto.conversationId,
    //   message,
    // });

    // 8. TODO: Create notification for mentioned users
    // await this.createMentionNotifications(mentions, message);

    // 9. TODO: Send push notifications to offline users
    // await this.sendPushNotifications(otherParticipants, message);

    return message;
  }

  findAll() {
    return `This action returns all messages`;
  }

  findOne(id: number) {
    return `This action returns a #${id} message`;
  }

  update(id: number, updateMessageDto: UpdateMessageDto) {
    return `This action updates a #${id} message`;
  }

  remove(id: number) {
    return `This action removes a #${id} message`;
  }

  markAsRead(messageId: string[], userId: string) {
    return;
  }

  /**
   * Validate message content based on type
   */
  private validateMessageContent(
    content: string | undefined,
    type: MessageType,
    mediaUrl?: string,
  ): void {
    if (type === MessageType.TEXT && !content?.trim()) {
      throw new BadRequestException('Text message must have content');
    }

    if (this.isMediaType(type) && !mediaUrl) {
      throw new BadRequestException(`${type} message must have media URL`);
    }
  }

  /**
   * Extract @mentions from message content
   */
  private extractMentions(content: string): string[] {
    const mentionRegex = /@(\w+)/g;
    const mentions: string[] = [];
    let match;

    while ((match = mentionRegex.exec(content)) !== null) {
      mentions.push(match[1]);
    }

    return [...new Set(mentions)]; // Remove duplicates
  }

  /**
   * Build metadata object based on message type
   */
  private buildMetadata(type: MessageType, mediaUrl?: string): any {
    if (!this.isMediaType(type)) {
      return null;
    }

    return {
      url: mediaUrl,
      type,
      // These should be provided by upload service
      // width, height, duration, fileSize, etc.
    };
  }

  /**
   * Check if message type is media
   */
  private isMediaType(type: MessageType): boolean {
    return [
      MessageType.IMAGE,
      MessageType.VIDEO,
      MessageType.AUDIO,
      MessageType.FILE,
      MessageType.CONTACT,
      MessageType.LOCATION,
      MessageType.STICKER,
      MessageType.TEXT,
      MessageType.SYSTEM,
    ].includes(type);
  }

  /**
   * Extract file name from URL
   */
  private extractFileName(url: string): string {
    return url.split('/').pop() || 'unknown';
  }

  /**
   * Get MIME type based on message type
   */
  private getMimeType(type: MessageType): string {
    const mimeTypes = {
      [MessageType.IMAGE]: 'image/jpeg',
      [MessageType.VIDEO]: 'video/mp4',
      [MessageType.AUDIO]: 'audio/mpeg',
      [MessageType.FILE]: 'application/octet-stream',
    };

    return mimeTypes[type] || 'application/octet-stream';
  }
}
