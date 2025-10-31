import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { ConversationType, ParticipantRole } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ConversationsService {
  private readonly logger = new Logger(ConversationsService.name);
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Create a new conversation
   */
  async create(
    createConversationDto: CreateConversationDto,
    currentUserId: string,
  ) {
    const { type, name, description, avatar, participantIds } =
      createConversationDto;

    try {
      // 1. Validate participants
      if (!participantIds || participantIds.length === 0) {
        throw new BadRequestException('At least one participant is required');
      }

      // 2. Ensure current user is in participants
      if (!participantIds.includes(currentUserId)) {
        participantIds.push(currentUserId);
      }

      // 3. Validate participant users exist
      const users = await this.prisma.user.findMany({
        where: { id: { in: participantIds } },
      });

      if (users.length !== participantIds.length) {
        throw new BadRequestException('One or more participants not found');
      }

      // 4. For DIRECT conversations, validate only 2 participants
      if (type === ConversationType.DIRECT) {
        if (participantIds.length !== 2) {
          throw new BadRequestException(
            'Direct conversation must have exactly 2 participants',
          );
        }

        // Check if direct conversation already exists between these users
        const existingConversation = await this.findExistingDirectConversation(
          participantIds[0],
          participantIds[1],
        );

        if (existingConversation) {
          return existingConversation; // Return existing conversation
        }
      }

      // 5. For GROUP conversations, validate name
      if (type === ConversationType.GROUP) {
        if (!name || name.trim().length === 0) {
          throw new BadRequestException('Group conversation must have a name');
        }

        if (participantIds.length < 2) {
          throw new BadRequestException(
            'Group conversation must have at least 2 participants',
          );
        }
      }

      // 6. Create conversation with participants in transaction
      const conversation = await this.prisma.$transaction(async (tx) => {
        // Create conversation
        const newConversation = await tx.conversation.create({
          data: {
            type,
            name: type === ConversationType.DIRECT ? null : name,
            description,
            avatar,
          },
        });

        // Create participants
        const participantsData = participantIds.map((userId, index) => ({
          conversationId: newConversation.id,
          userId,
          // First user is owner for group conversations
          role:
            type === ConversationType.GROUP && index === 0
              ? (ParticipantRole.OWNER as ParticipantRole)
              : (ParticipantRole.MEMBER as ParticipantRole),
          joinedAt: new Date(),
        }));

        await tx.conversationParticipant.createMany({
          data: participantsData,
        });

        // Return conversation with participants
        return tx.conversation.findUnique({
          where: { id: newConversation.id },
          include: {
            participants: {
              include: {
                user: {
                  select: {
                    id: true,
                    username: true,
                    displayName: true,
                    avatarUrl: true,
                    isOnline: true,
                    lastSeenAt: true,
                  },
                },
              },
            },
          },
        });
      });

      return conversation;
    } catch (error) {
      // Re-throw known errors
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException ||
        error instanceof ForbiddenException
      ) {
        throw error;
      }

      // Log unexpected errors
      this.logger.error('Error creating conversation:', error);
      throw new InternalServerErrorException(
        'An unexpected error occurred while creating conversation',
      );
    }
  }

  /**
   * Get all conversations for a user
   */
  async findUserConversations(
    userId: string,
    page: number = 1,
    limit: number = 20,
  ) {
    try {
      const skip = (page - 1) * limit;

      const [participants, total] = await Promise.all([
        this.prisma.conversationParticipant.findMany({
          where: {
            userId,
            leftAt: null, // Only active conversations
          },
          include: {
            conversation: {
              include: {
                lastMessage: {
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
                participants: {
                  where: { leftAt: null },
                  include: {
                    user: {
                      select: {
                        id: true,
                        username: true,
                        displayName: true,
                        avatarUrl: true,
                        isOnline: true,
                        lastSeenAt: true,
                      },
                    },
                  },
                },
                _count: {
                  select: { messages: true },
                },
              },
            },
          },
          orderBy: [
            { isPinned: 'desc' },
            { conversation: { lastMessageAt: 'desc' } },
          ],
          take: limit,
          skip,
        }),
        this.prisma.conversationParticipant.count({
          where: { userId, leftAt: null },
        }),
      ]);

      return {
        conversations: participants.map((p) => ({
          ...p.conversation,
          unreadCount: p.unreadCount,
          mentionCount: p.mentionCount,
          isPinned: p.isPinned,
          isMuted: p.isMuted,
          lastReadAt: p.lastReadAt,
        })),
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      this.logger.error('Error fetching conversations:', error);
      throw new InternalServerErrorException(
        'An unexpected error occurred while fetching conversations',
      );
    }
  }

  /**
   * Get single conversation by ID
   */
  async findOne(conversationId: string, userId: string) {
    try {
      // Check if user is participant
      const participant = await this.prisma.conversationParticipant.findUnique({
        where: {
          conversationId_userId: {
            conversationId,
            userId,
          },
        },
      });

      if (!participant) {
        throw new ForbiddenException(
          'You are not a participant in this conversation',
        );
      }

      const conversation = await this.prisma.conversation.findUnique({
        where: { id: conversationId },
        include: {
          participants: {
            where: { leftAt: null },
            include: {
              user: {
                select: {
                  id: true,
                  username: true,
                  displayName: true,
                  avatarUrl: true,
                  isOnline: true,
                  lastSeenAt: true,
                },
              },
            },
          },
          lastMessage: {
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
          pinnedMessages: {
            include: {
              message: {
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
          },
        },
      });

      if (!conversation) {
        throw new NotFoundException('Conversation not found');
      }

      return {
        ...conversation,
        unreadCount: participant.unreadCount,
        mentionCount: participant.mentionCount,
        isPinned: participant.isPinned,
        isMuted: participant.isMuted,
        lastReadAt: participant.lastReadAt,
      };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ForbiddenException
      ) {
        throw error;
      }

      this.logger.error('Error fetching conversation:', error);
      throw new InternalServerErrorException(
        'An unexpected error occurred while fetching conversation',
      );
    }
  }

  /**
   * Update conversation (name, avatar, etc.)
   */
  async update(
    conversationId: string,
    userId: string,
    updateData: { name?: string; description?: string; avatar?: string },
  ) {
    try {
      // Check if user is admin or owner
      const participant = await this.prisma.conversationParticipant.findUnique({
        where: {
          conversationId_userId: {
            conversationId,
            userId,
          },
        },
        include: { conversation: true },
      });

      if (!participant) {
        throw new ForbiddenException(
          'You are not a participant in this conversation',
        );
      }

      if (participant.conversation.type === ConversationType.GROUP) {
        if (participant.role !== 'ADMIN' && participant.role !== 'OWNER') {
          throw new ForbiddenException(
            'Only admins can update group conversation',
          );
        }
      }

      const updatedConversation = await this.prisma.conversation.update({
        where: { id: conversationId },
        data: updateData,
        include: {
          participants: {
            include: {
              user: {
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

      return updatedConversation;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ForbiddenException
      ) {
        throw error;
      }

      this.logger.error('Error updating conversation:', error);
      throw new InternalServerErrorException(
        'An unexpected error occurred while updating conversation',
      );
    }
  }

  /**
   * Add participant to group conversation
   */
  async addParticipant(
    conversationId: string,
    userId: string,
    newParticipantId: string,
  ) {
    try {
      // Check if user is admin/owner
      const participant = await this.prisma.conversationParticipant.findUnique({
        where: {
          conversationId_userId: {
            conversationId,
            userId,
          },
        },
        include: { conversation: true },
      });

      if (!participant) {
        throw new ForbiddenException(
          'You are not a participant in this conversation',
        );
      }

      if (participant.conversation.type !== ConversationType.GROUP) {
        throw new BadRequestException(
          'Can only add participants to group conversations',
        );
      }

      if (participant.role !== 'ADMIN' && participant.role !== 'OWNER') {
        throw new ForbiddenException('Only admins can add participants');
      }

      // Check if new participant already exists
      const existingParticipant =
        await this.prisma.conversationParticipant.findUnique({
          where: {
            conversationId_userId: {
              conversationId,
              userId: newParticipantId,
            },
          },
        });

      if (existingParticipant && !existingParticipant.leftAt) {
        throw new BadRequestException('User is already a participant');
      }

      // Add or re-add participant
      const newParticipant = await this.prisma.conversationParticipant.upsert({
        where: {
          conversationId_userId: {
            conversationId,
            userId: newParticipantId,
          },
        },
        create: {
          conversationId,
          userId: newParticipantId,
          role: 'MEMBER',
        },
        update: {
          leftAt: null,
          joinedAt: new Date(),
        },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              displayName: true,
              avatarUrl: true,
            },
          },
        },
      });

      // Create system message
      await this.prisma.message.create({
        data: {
          conversationId,
          senderId: userId,
          type: 'SYSTEM',
          content: `${newParticipant.user.displayName || newParticipant.user.username} joined the group`,
          status: 'SENT',
        },
      });

      return newParticipant;
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof ForbiddenException
      ) {
        throw error;
      }

      this.logger.error('Error adding participant:', error);
      throw new InternalServerErrorException(
        'An unexpected error occurred while adding participant',
      );
    }
  }

  /**
   * Leave conversation
   */
  async leaveConversation(conversationId: string, userId: string) {
    try {
      const participant = await this.prisma.conversationParticipant.findUnique({
        where: {
          conversationId_userId: {
            conversationId,
            userId,
          },
        },
        include: {
          conversation: true,
          user: true,
        },
      });

      if (!participant) {
        throw new NotFoundException('Participant not found');
      }

      if (participant.leftAt) {
        throw new BadRequestException(
          'You have already left this conversation',
        );
      }

      // Update participant to mark as left
      await this.prisma.conversationParticipant.update({
        where: { id: participant.id },
        data: { leftAt: new Date() },
      });

      // Create system message for group conversations
      if (participant.conversation.type === ConversationType.GROUP) {
        await this.prisma.message.create({
          data: {
            conversationId,
            senderId: userId,
            type: 'SYSTEM',
            content: `${participant.user.displayName || participant.user.username} left the group`,
            status: 'SENT',
          },
        });
      }

      return { success: true };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }

      this.logger.error('Error leaving conversation:', error);
      throw new InternalServerErrorException(
        'An unexpected error occurred while leaving conversation',
      );
    }
  }

  /**
   * Pin/Unpin conversation
   */
  async togglePin(conversationId: string, userId: string) {
    try {
      const participant = await this.prisma.conversationParticipant.findUnique({
        where: {
          conversationId_userId: {
            conversationId,
            userId,
          },
        },
      });

      if (!participant) {
        throw new ForbiddenException(
          'You are not a participant in this conversation',
        );
      }

      const updated = await this.prisma.conversationParticipant.update({
        where: { id: participant.id },
        data: { isPinned: !participant.isPinned },
      });

      return { isPinned: updated.isPinned };
    } catch (error) {
      if (error instanceof ForbiddenException) {
        throw error;
      }

      this.logger.error('Error toggling pin:', error);
      throw new InternalServerErrorException(
        'An unexpected error occurred while toggling pin',
      );
    }
  }

  /**
   * Mute/Unmute conversation
   */
  async toggleMute(conversationId: string, userId: string, mutedUntil?: Date) {
    try {
      const participant = await this.prisma.conversationParticipant.findUnique({
        where: {
          conversationId_userId: {
            conversationId,
            userId,
          },
        },
      });

      if (!participant) {
        throw new ForbiddenException(
          'You are not a participant in this conversation',
        );
      }

      const updated = await this.prisma.conversationParticipant.update({
        where: { id: participant.id },
        data: {
          isMuted: !participant.isMuted,
          mutedUntil: !participant.isMuted ? mutedUntil : null,
        },
      });

      return {
        isMuted: updated.isMuted,
        mutedUntil: updated.mutedUntil,
      };
    } catch (error) {
      if (error instanceof ForbiddenException) {
        throw error;
      }

      this.logger.error('Error toggling mute:', error);
      throw new InternalServerErrorException(
        'An unexpected error occurred while toggling mute',
      );
    }
  }

  // ============================================
  // HELPER METHODS
  // ============================================

  /**
   * Find existing direct conversation between two users
   */
  private async findExistingDirectConversation(
    userId1: string,
    userId2: string,
  ) {
    const conversations = await this.prisma.conversation.findMany({
      where: {
        type: ConversationType.DIRECT,
        participants: {
          every: {
            userId: { in: [userId1, userId2] },
            leftAt: null,
          },
        },
      },
      include: {
        participants: {
          where: { leftAt: null },
          include: {
            user: {
              select: {
                id: true,
                username: true,
                displayName: true,
                avatarUrl: true,
                isOnline: true,
                lastSeenAt: true,
              },
            },
          },
        },
      },
    });

    // Find conversation with exactly these 2 participants
    return conversations.find((conv) => {
      const participantIds = conv.participants.map((p) => p.userId).sort();
      return (
        participantIds.length === 2 &&
        participantIds[0] === [userId1, userId2].sort()[0] &&
        participantIds[1] === [userId1, userId2].sort()[1]
      );
    });
  }
}
