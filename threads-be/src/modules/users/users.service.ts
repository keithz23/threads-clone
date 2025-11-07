import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}
  async getProfile(username: string, currentUserId?: string) {
    const user = await this.prisma.user.findUnique({
      where: { username },
      select: {
        id: true,
        username: true,
        email: true,
        displayName: true,
        bio: true,
        avatarUrl: true,
        coverUrl: true,
        website: true,
        location: true,
        verified: true,
        isPrivate: true,
        link: true,
        linkTitle: true,
        interests: true,
        followersCount: true,
        followingCount: true,
        postsCount: true,
        createdAt: true,
        phoneNumber: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }
    const userId = user.id;

    const isOwnProfile = currentUserId === userId;

    const relationshipStatus =
      !isOwnProfile && currentUserId
        ? await this.getRelationshipStatus(userId, currentUserId)
        : null;

    return {
      ...this.transformUser(user),
      isOwnProfile,
      isPrivate: user.isPrivate,

      email: isOwnProfile ? user.email : undefined,
      phoneNumber: isOwnProfile ? user.phoneNumber : undefined,

      ...(relationshipStatus && { relationshipStatus }),
    };
  }

  private async getRelationshipStatus(
    targetUserId: string,
    currentUserId: string,
  ) {
    // perform all existence checks in parallel (don't await each individually)
    const [isFollowing, isFollower, isBlocked, isMuted, hasPendingRequest] =
      await Promise.all([
        this.prisma.follow.findUnique({
          where: {
            followerId_followingId: {
              followerId: currentUserId,
              followingId: targetUserId,
            },
          },
        }),

        this.prisma.follow.findUnique({
          where: {
            followerId_followingId: {
              followerId: targetUserId,
              followingId: currentUserId,
            },
          },
        }),

        this.prisma.block.findUnique({
          where: {
            blockerId_blockedId: {
              blockedId: currentUserId,
              blockerId: targetUserId,
            },
          },
        }),

        this.prisma.mute.findUnique({
          where: {
            muterId_mutedId: {
              mutedId: currentUserId,
              muterId: targetUserId,
            },
          },
        }),

        this.prisma.followRequest.findUnique({
          where: {
            senderId_receiverId: {
              senderId: currentUserId,
              receiverId: targetUserId,
            },
          },
        }),
      ]);

    return {
      isFollowing: !!isFollowing,
      isFollower: !!isFollower,
      isBlocked: !!isBlocked,
      isMuted: !!isMuted,
      hasPendingRequest: !!hasPendingRequest,
    };
  }
  private transformUser(user: any) {
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      displayName: user.displayName,
      bio: user.bio,
      avatarUrl: user.avatarUrl,
      coverUrl: user.coverUrl,
      website: user.website,
      location: user.location,
      verified: user.verified,
      isPrivate: user.isPrivate,
      link: user.link,
      linkTitle: user.linkTitle,
      interests: user.interests,
      followersCount: user.followersCount,
      followingCount: user.followingCount,
      postsCount: user.postsCount,
      createdAt: user.createdAt,
    };
  }
}
