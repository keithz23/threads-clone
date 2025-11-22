import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { FollowsService } from '../follows/follows.service';

@Injectable()
export class SuggestionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly followService: FollowsService,
  ) {}

  async getSuggestions(userId: string, limit: number = 25) {
    const following = await this.followService.getFollowingList(userId);
    const followingIds = following.map((user) => user.id);

    const friendsOfFriendsPromises = followingIds.map((id) =>
      this.followService.getFollowingList(id),
    );

    const friendsOfFriendsArrays = await Promise.all(friendsOfFriendsPromises);

    const friendsOfFriends = friendsOfFriendsArrays
      .flat()
      .filter((user) => user.id !== userId && !followingIds.includes(user.id));

    const userCounts = friendsOfFriends.reduce(
      (acc, user) => {
        acc[user.id] = (acc[user.id] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    const uniqueSuggestions = Array.from(
      new Map(friendsOfFriends.map((user) => [user.id, user])).values(),
    ).sort((a, b) => userCounts[b.id] - userCounts[a.id]);

    if (uniqueSuggestions.length < limit) {
      const popularUsers = await this.getPopularUsers(
        userId,
        followingIds,
        limit - uniqueSuggestions.length,
      );

      uniqueSuggestions.push(...popularUsers);
    }

    return uniqueSuggestions.slice(0, limit).map((user) => ({
      ...user,
      mutualConnections: userCounts[user.id] || 0,
    }));
  }

  private async getPopularUsers(
    currentUserId: string,
    excludeIds: string[],
    limit: number,
  ) {
    const popularUsers = await this.prisma.user.findMany({
      where: {
        id: {
          notIn: [...excludeIds, currentUserId],
        },
      },
      select: {
        id: true,
        displayName: true,
        username: true,
        email: true,
        bio: true,
        avatarUrl: true,
        _count: {
          select: {
            followers: true,
          },
        },
      },
      orderBy: {
        followers: {
          _count: 'desc',
        },
      },
      take: limit,
    });

    return popularUsers;
  }
}
