import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseInterceptors,
  UploadedFiles,
  Req,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { ImageValidationPipe } from 'src/common/pipes/file-validation.pipe';
import { UpdatePostDto } from './dto/update-post.dto';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

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

  @Get('get-posts-by-user')
  async getPostsByUser(@CurrentUser('id') userId: string) {
    return await this.postsService.getPostsByUser(userId);
  }
}
