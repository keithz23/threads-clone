import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { RepostsService } from './reposts.service';
import { CreateRepostDto } from './dto/create-repost.dto';
import { UpdateRepostDto } from './dto/update-repost.dto';

@Controller('reposts')
export class RepostsController {
  constructor(private readonly repostsService: RepostsService) {}
}
