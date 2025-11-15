import { Controller, Post, Body, Delete, Get, Param } from '@nestjs/common';
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

  @Post(':followingId/follow')
  @Post()
  async toggleFollow(
    @Param('followingId') followingId: string,
    @CurrentUser('id') followerId: string,
  ) {
    return this.followsService.toggleFollow(followerId, followingId);
  }
}
