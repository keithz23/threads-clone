import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { RepostsService } from './reposts.service';
import { CreateRepostDto } from './dto/create-repost.dto';
import { UpdateRepostDto } from './dto/update-repost.dto';

@Controller('reposts')
export class RepostsController {
  constructor(private readonly repostsService: RepostsService) {}

  @Post()
  create(@Body() createRepostDto: CreateRepostDto) {
    return this.repostsService.create(createRepostDto);
  }

  @Get()
  findAll() {
    return this.repostsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.repostsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateRepostDto: UpdateRepostDto) {
    return this.repostsService.update(+id, updateRepostDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.repostsService.remove(+id);
  }
}
