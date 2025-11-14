import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class RepostsService {
  private logger = new Logger(RepostsService.name);
  constructor(
    private readonly prisma: PrismaService,
    private notificationService: NotificationsService,
  ) {}

  private async repost(postId: string, userId: string, postOwnerId: string) {
    const result = await this.prisma.$transaction(async (tx) => {
      // Check post
      const post = await tx.post.findUnique({
        where: { id: postId },
      });

      if (!post) {
        throw new NotFoundException('Post not found');
      }

      const existingRepost = await tx.repost.findUnique({
        where: {
          userId_postId: { userId, postId },
        },
      });

      if (existingRepost) {
        throw new ConflictException('Already reposted');
      }

      // create repost
      const repost = await tx.repost.create({
        data: {
          userId,
          postId,
        },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              displayName: true,
              verified: true,
            },
          },
        },
      });

      await tx.post.update({
        where: { id: postId },
        data: {
          repostCount: { increment: 1 },
        },
      });

      if (userId !== postOwnerId) {
        try {
          await this.notificationService.sendNotification({
            userId: postOwnerId,
            actorId: userId,
            postId: postId,
            type: 'REPOST',
          });
        } catch (error) {
          this.logger.error('Failed to send repost notification:', error);
        }
      }

      return repost;
    });

    return {
      reposted: true,
      repost: result,
    };
  }

  private async unRepost(postId: string, userId: string, postOwnerId: string) {
    await this.prisma.$transaction(async (tx) => {
      const repost = await tx.repost.findUnique({
        where: {
          userId_postId: { userId, postId },
        },
      });

      if (!repost) {
        throw new NotFoundException('Repost not found');
      }

      await tx.repost.delete({
        where: {
          userId_postId: { userId, postId },
        },
      });

      await tx.post.update({
        where: { id: postId },
        data: {
          repostCount: { decrement: 1 },
        },
      });

      if (userId !== postOwnerId) {
        await tx.notification.deleteMany({
          where: {
            type: 'REPOST',
            actorId: userId,
            postId: postId,
          },
        });
      }
    });

    return {
      reposted: false,
    };
  }

  async toggleRepost(postId: string, userId: string) {
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
      select: { userId: true },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    const postOwnerId = post.userId;

    const existingRepost = await this.prisma.repost.findUnique({
      where: {
        userId_postId: { userId, postId },
      },
    });

    // Toggle
    if (existingRepost) {
      return await this.unRepost(postId, userId, postOwnerId);
    } else {
      return await this.repost(postId, userId, postOwnerId);
    }
  }
}
