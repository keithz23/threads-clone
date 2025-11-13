import { Controller, Post, Body } from '@nestjs/common';
import { LikesService } from './likes.service';
import { LikeDto } from './dto/create-like.dto';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';

@Controller('like-toggle')
export class LikesController {
  constructor(private readonly likesService: LikesService) {}

  @Post('like')
  like(@CurrentUser('id') userId: string, @Body() likeDto: LikeDto) {
    return this.likesService.toggleLike(userId, likeDto);
  }
}
