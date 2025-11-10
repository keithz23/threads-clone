import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { NotificationsGateway } from '../notifications/notifications.gateway';

@Injectable()
export class FollowsService {
  constructor(
    private readonly prisma: PrismaService,
    private notificationGateway: NotificationsGateway,
  ) {}
  async follow(followerId: string, followingId: string) {
    // Prevent self-following
    if (followerId === followingId) {
      throw new BadRequestException('Cannot follow yourself');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: followerId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check if following user exists
    const followingUser = await this.prisma.user.findUnique({
      where: { id: followingId },
    });

    if (!followingUser) {
      throw new NotFoundException('User to follow not found');
    }

    // Check if already following
    const existingFollow = await this.prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId,
          followingId,
        },
      },
    });

    if (existingFollow) {
      throw new ConflictException('Already following this user');
    }

    const result = await this.prisma.$transaction(async (prisma) => {
      const createdFollow = await prisma.follow.create({
        data: {
          followerId,
          followingId,
        },
      });

      const updatedFollower = await prisma.user.update({
        where: { id: followerId },
        data: {
          followingCount: { increment: 1 },
        },
        select: { id: true, followingCount: true },
      });

      const updatedFollowing = await prisma.user.update({
        where: { id: followingId },
        data: {
          followersCount: { increment: 1 },
        },
        select: { id: true, followersCount: true },
      });

      return { createdFollow, updatedFollower, updatedFollowing };
    });

    await this.notificationGateway.sendNotification({
      userId: followingId, // recipient
      actorId: followerId, // actor
      type: 'FOLLOW',
    });

    return {
      isFollowing: true,
      followerId,
      followingId,
      followersCount: result.updatedFollowing.followersCount,
      followingCount: result.updatedFollower.followingCount,
      followId: result.createdFollow.id,
    };
  }

  async unFollow(followerId: string, followingId: string) {
    try {
      await this.prisma.$transaction(async (prisma) => {
        await prisma.follow.delete({
          where: {
            followerId_followingId: {
              followerId,
              followingId,
            },
          },
        });

        await prisma.user.update({
          where: { id: followerId },
          data: {
            followingCount: { decrement: 1 },
          },
        });

        await prisma.user.update({
          where: { id: followingId },
          data: {
            followersCount: { decrement: 1 },
          },
        });
      });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException('Follow relationship not found');
      }
      throw error;
    }
  }

  async getFollowingList(userId: string) {
    const userExists = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    });

    if (!userExists) {
      throw new NotFoundException('User not found');
    }

    const following = await this.prisma.follow.findMany({
      where: {
        followerId: userId,
      },
      select: {
        following: {
          select: {
            id: true,
            displayName: true,
            username: true,
            email: true,
            avatarUrl: true,
            bio: true,
          },
        },
      },
    });

    return following.map((f) => f.following);
  }

  async getFollowerList(userId: string) {
    const userExists = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    });

    if (!userExists) {
      throw new NotFoundException('User not found');
    }

    const followers = await this.prisma.follow.findMany({
      where: {
        followingId: userId,
      },
      select: {
        follower: {
          select: {
            id: true,
            displayName: true,
            username: true,
            email: true,
            avatarUrl: true,
            bio: true,
          },
        },
      },
    });

    return followers.map((f) => f.follower);
  }
}
