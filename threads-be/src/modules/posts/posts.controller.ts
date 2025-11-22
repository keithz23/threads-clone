import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseInterceptors,
  UploadedFiles,
  Param,
  Delete,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { ImageValidationPipe } from 'src/common/pipes/file-validation.pipe';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { LikesService } from '../likes/likes.service';
import { RepostsService } from '../reposts/reposts.service';

@Controller('posts')
export class PostsController {
  constructor(
    private readonly postsService: PostsService,
    private readonly likesService: LikesService,
    private readonly repostsService: RepostsService,
  ) {}

  @Post('create-post')
  @UseInterceptors(FilesInterceptor('images', 10)) // Max 10 images
  async create(
    @Body() createPostDto: CreatePostDto,
    @UploadedFiles(new ImageValidationPipe()) images: Express.Multer.File[],
    @CurrentUser('id') userId: string,
  ) {
    const post = await this.postsService.createSync(
      userId,
      createPostDto,
      images,
    );

    return {
      message: 'Post created successfully',
      data: post,
    };
  }

  @Post(':postId/like')
  async toggleLike(
    @Param('postId') postId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.likesService.toggleLike(userId, { postId });
  }

  @Get('get-newsfeed-post')
  async getNewsFeedPost(
    @CurrentUser('id') userId: string,
    @Query('cursor') cursor?: string,
    @Query('filter') filter?: string,
    @Query('limit') limit?: number,
  ) {
    return await this.postsService.getNewsFeedPost(
      userId,
      cursor,
      filter,
      limit,
    );
  }

  @Post(':postId/repost')
  async toggleRepost(
    @Param('postId') postId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.repostsService.toggleRepost(postId, userId);
  }

  @Get('get-posts-by-user')
  async getPostsByUser(@CurrentUser('id') userId: string) {
    return await this.postsService.getPostsByUser(userId);
  }

  @Get('get-user-posts')
  async getUserPosts(
    @Query('username') username: string,
    @Query('filter') filter?: string,
    @Query('cursor') cursor?: string,
    @Query('limit') limit?: string,
  ) {
    const parsedLimit = limit ? parseInt(limit, 10) : undefined;
    return this.postsService.getUserPosts(
      username,
      cursor,
      filter,
      parsedLimit,
    );
  }

  @Delete(':postId/soft-delete')
  async softDelete(
    @Param('postId') postId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.postsService.softDelete(postId, userId);
  }

  @Delete(':postId/delete')
  async delete(
    @Param('postId') postId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.postsService.delete(postId, userId);
  }
}
