import { Injectable, NotFoundException } from '@nestjs/common';
import { LikeDto } from './dto/create-like.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class LikesService {
  constructor(
    private readonly prisma: PrismaService,
    private notificationService: NotificationsService,
  ) {}

  async toggleLike(userId: string, likeDto: LikeDto) {
    const { postId } = likeDto;

    // Check if post exists
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
      select: {
        id: true,
        isDeleted: true,
        userId: true,
      },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    if (post.isDeleted) {
      throw new NotFoundException('Post has been deleted');
    }

    // Check if already liked
    const existingLike = await this.prisma.like.findUnique({
      where: {
        userId_postId: {
          userId,
          postId,
        },
      },
    });

    if (existingLike) {
      // Unlike: Remove like and decrement counter
      return await this.unlike(userId, postId, post.userId);
    } else {
      // Like: Create like and increment counter
      return await this.like(userId, postId, post.userId);
    }
  }

  private async like(userId: string, postId: string, postOwnerId: string) {
    const result = await this.prisma.$transaction(async (tx) => {
      // Create like
      const like = await tx.like.create({
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
              avatarUrl: true,
              verified: true,
            },
          },
        },
      });

      await tx.post.update({
        where: { id: postId },
        data: {
          likeCount: {
            increment: 1,
          },
        },
      });
      if (userId !== postOwnerId) {
        await this.notificationService.sendNotification({
          userId: postOwnerId,
          actorId: userId,
          postId: postId,
          type: 'LIKE',
        });
      }

      return like;
    });

    return {
      liked: true,
      like: result,
    };
  }

  private async unlike(userId: string, postId: string, postOwnerId: string) {
    await this.prisma.$transaction(async (tx) => {
      // Delete like
      await tx.like.delete({
        where: {
          userId_postId: {
            userId,
            postId,
          },
        },
      });

      // Decrement like counter
      await tx.post.update({
        where: { id: postId },
        data: {
          likeCount: {
            decrement: 1,
          },
        },
      });

      // Delete notification (if exists)
      if (userId !== postOwnerId) {
        await tx.notification.deleteMany({
          where: {
            type: 'LIKE',
            actorId: userId,
            postId: postId,
          },
        });
      }
    });

    return {
      liked: false,
    };
  }
}
