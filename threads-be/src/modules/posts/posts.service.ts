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
