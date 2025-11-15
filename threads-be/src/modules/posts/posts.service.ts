import { Injectable, NotFoundException } from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { MediaType } from '@prisma/client';
import { S3Service } from 'src/uploads/s3.service';
import { UploadResult } from 'src/common/interfaces/file-upload.interface';
import {
  CleanupJobData,
  JOB_NAMES,
  QUEUE_NAMES,
} from 'src/common/constants/queue.constant';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class PostsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly s3Service: S3Service,
    @InjectQueue(QUEUE_NAMES.CLEANUP)
    private cleanupQueue: Queue<CleanupJobData>,
    @InjectQueue(QUEUE_NAMES.IMAGE_PROCESSING)
    private imageProcessingQueue: Queue,
  ) {}

  async createSync(
    userId: string,
    createPostDto: CreatePostDto,
    images?: Express.Multer.File[],
  ) {
    const { content, replyPolicy, parentPostId, reviewApprove, rootPostId } =
      createPostDto;

    // Check user
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Upload images SYNC
    let uploadResults: UploadResult[] = [];
    const uploadedKeys: string[] = [];

    if (images && images.length > 0) {
      try {
        uploadResults = await this.s3Service.uploadImages(
          images,
          `public/posts/${userId}`,
          { resize: true, quality: 85 },
        );
        uploadedKeys.push(...uploadResults.map((r) => r.key));
      } catch (error) {
        throw new Error(`Failed to upload images: ${error.message}`);
      }
    }

    // Transaction
    let post;
    try {
      post = await this.prisma.$transaction(async (tx) => {
        const created = await tx.post.create({
          data: {
            content: content ?? '',
            replyPolicy: replyPolicy ?? 'ANYONE',
            reviewApprove: reviewApprove ?? false,
            parentPostId: parentPostId ?? null,
            rootPostId: rootPostId ?? null,
            userId,
          },
        });

        // Create media records
        if (uploadResults.length > 0) {
          await tx.postMedia.createMany({
            data: uploadResults.map((u, idx) => ({
              postId: created.id,
              mediaUrl: u.url,
              mediaType: MediaType.IMAGE,
              fileSize: u.size,
              orderIndex: idx,
            })),
          });
        }

        if (parentPostId) {
          await tx.post.update({
            where: { id: parentPostId },
            data: { replyCount: { increment: 1 } },
          });
        }

        return created;
      });
    } catch (error) {
      if (uploadedKeys.length > 0) {
        await this.scheduleCleanup(uploadedKeys, 'transaction_failed');
      }
      throw error;
    }

    // Return với relations
    return this.prisma.post.findUnique({
      where: { id: post.id },
      include: {
        media: { orderBy: { orderIndex: 'asc' } },
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
  }

  // Delete post with cleanup job
  async delete(postId: string, userId: string) {
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
      include: { media: true },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    if (post.userId !== userId) {
      throw new NotFoundException('Unauthorized');
    }

    // Delete from DB
    await this.prisma.$transaction(async (tx) => {
      await tx.postMedia.deleteMany({ where: { postId } });

      if (post.parentPostId) {
        await tx.post.update({
          where: { id: post.parentPostId },
          data: { replyCount: { decrement: 1 } },
        });
      }

      await tx.post.delete({ where: { id: postId } });
    });

    // Schedule S3 cleanup
    if (post.media.length > 0) {
      const keys = post.media.map((m) => this.extractKeyFromUrl(m.mediaUrl));
      await this.scheduleCleanup(keys, 'post_deleted');
    }
  }

  async getPostsByUser(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) throw new NotFoundException('User not found');

    const posts = await this.prisma.post.findMany({
      where: { userId },
      include: {
        media: true,
        user: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatarUrl: true,
            verified: true,
          },
        },
        _count: {
          select: {
            likes: true,
            replies: true,
            reposts: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return posts;
  }

  async getNewsFeedPost(
    userId: string,
    cursor?: string,
    filter: string = 'all',
    limit: number = 20,
  ) {
    const take = Math.min(Math.max(limit, 1), 100);
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) throw new NotFoundException('User not found');

    let whereClause: any = {
      isDeleted: false,
      parentPostId: null,
    };

    if (filter === 'following' && userId) {
      const following = await this.prisma.follow.findMany({
        where: {
          followerId: userId,
        },
        select: { following: true },
      });

      whereClause.userId = {
        in: [...following.map((f) => f.following.id), userId],
      };
    }

    const posts = await this.prisma.post.findMany({
      take: take + 1,
      skip: cursor ? 1 : 0,
      cursor: cursor ? { id: cursor } : undefined,
      where: whereClause,
      orderBy: [{ isPinned: 'desc' }, { createdAt: 'desc' }],
      include: {
        user: {
          select: {
            id: true,
            username: true,
            displayName: true,
            bio: true,
            avatarUrl: true,
            followersCount: true,
            following: true,
          },
        },
        media: {
          orderBy: { createdAt: 'desc' },
        },
        ...(userId && {
          likes: {
            where: { userId },
            select: { id: true },
          },
          reposts: {
            where: { userId },
            select: { id: true },
          },
          bookmarks: {
            where: { userId },
            select: { id: true },
          },
        }),
        parentPost: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                displayName: true,
                avatarUrl: true,
                verified: true,
                followersCount: true,
                following: true,
              },
            },
            media: true,
          },
        },
      },
    });

    // Check if there are more posts
    const hasMore = posts.length > limit;
    const postsToReturn = hasMore ? posts.slice(0, -1) : posts;

    // Format response
    const formattedPosts = postsToReturn.map((post) => ({
      id: post.id,
      content: post.content,
      createdAt: post.createdAt,
      isPinned: post.isPinned,

      // Counters
      stats: {
        replies: post.replyCount,
        likes: post.likeCount,
        reposts: post.repostCount,
        bookmarks: post.bookmarkCount,
        views: post.viewCount,
      },

      // User info
      author: post.user,

      // Media
      media: post.media,

      // Current user interactions
      ...(userId && {
        isLiked: post.likes.length > 0,
        isReposted: post.reposts.length > 0,
        isBookmarked: post.bookmarks.length > 0,
      }),

      // Parent post (if reply or quote)
      parentPost: post.parentPost,
    }));

    return {
      posts: formattedPosts,
      pagination: {
        hasMore,
        nextCursor: hasMore
          ? String(postsToReturn[postsToReturn.length - 1].id)
          : null,
      },
    };
  }

  async getUserPosts(
    username: string,
    cursor?: string,
    filter: string = 'posts',
    limit: number = 20,
  ) {
    // cap limit
    const take = Math.min(Math.max(limit, 1), 100); // 1..100

    const user = await this.prisma.user.findUnique({
      where: { username },
      select: { id: true },
    });

    if (!user) throw new NotFoundException('User not found');

    // Build where clause
    let whereClause: any = {
      isDeleted: false,
      userId: user.id,
    };

    if (filter === 'posts') {
      whereClause.parentPostId = null;
    } else if (filter === 'replies') {
      whereClause.parentPostId = { not: null };
    } else if (filter === 'media') {
      whereClause.media = { some: {} };
    }

    const prismaCursor = cursor ? { id: cursor } : undefined;

    const posts = await this.prisma.post.findMany({
      take: take + 1,
      cursor: prismaCursor,
      skip: cursor ? 1 : 0,
      where: whereClause,
      orderBy: { id: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatarUrl: true,
          },
        },
        media: true,
      },
    });

    const hasMore = posts.length > take;
    const postsToReturn = hasMore ? posts.slice(0, -1) : posts;

    return {
      posts: postsToReturn,
      pagination: {
        hasMore,
        nextCursor: hasMore
          ? String(postsToReturn[postsToReturn.length - 1].id)
          : null,
      },
    };
  }

  // Get post by ID
  async findOne(postId: string) {
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
      include: {
        media: { orderBy: { orderIndex: 'asc' } },
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

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    return post;
  }

  // Schedule cleanup job
  private async scheduleCleanup(
    keys: string[],
    reason: CleanupJobData['reason'],
  ) {
    await this.cleanupQueue.add(
      JOB_NAMES.CLEANUP_FAILED_UPLOAD,
      { keys, reason },
      {
        attempts: 5,
        backoff: {
          type: 'exponential',
          delay: 5000,
        },
        delay: 1000, // Delay 1s before cleanup
      },
    );
  }

  private extractKeyFromUrl(url: string): string {
    try {
      const urlObj = new URL(url);
      return urlObj.pathname.substring(1);
    } catch {
      return url;
    }
  }
}
