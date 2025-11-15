import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { HashtagsService } from './hashtags.service';
import { CreateHashtagDto } from './dto/create-hashtag.dto';

@Controller('hashtags')
export class HashtagsController {
  constructor(private readonly hashtagsService: HashtagsService) {}

  @Post('create-hashtag')
  create(@Body() createHashtagDto: CreateHashtagDto) {
    return this.hashtagsService.create(createHashtagDto);
  }

  @Get('get-all-hashtags')
  findAll() {
    return this.hashtagsService.findAll();
  }

  @Get('search-hashtags')
  searchHashtags(@Query('query') query: string) {
    return this.hashtagsService.searchHashtags(query);
  }
}
