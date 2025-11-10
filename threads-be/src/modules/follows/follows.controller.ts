import { Controller, Post, Body, Delete, Get } from '@nestjs/common';
import { FollowsService } from './follows.service';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { FollowDto, UnFollowDto } from './dto/follow.dto';
@Controller('follows')
export class FollowsController {
  constructor(private readonly followsService: FollowsService) {}

  @Get('get-following')
  async getFollowingList(@CurrentUser('id') followerId: string) {
    return this.followsService.getFollowingList(followerId);
  }

  @Get('get-follower')
  async getFollowerList(@CurrentUser('id') followerId: string) {
    return this.followsService.getFollowerList(followerId);
  }

  @Post()
  async follow(
    @CurrentUser('id') followerId: string,
    @Body() followDto: FollowDto,
  ) {
    return this.followsService.follow(followerId, followDto.followingId);
  }

  @Post('unfollow')
  async unFollow(
    @CurrentUser('id') followerId: string,
    @Body() unFollowDto: UnFollowDto,
  ) {
    return this.followsService.unFollow(followerId, unFollowDto.followingId);
  }
}
