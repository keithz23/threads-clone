import {
  IsOptional,
  IsString,
  MaxLength,
  IsEnum,
  IsBoolean,
} from 'class-validator';
import { ReplyPolicy } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePostDto {
  @IsOptional()
  @IsString()
  @MaxLength(5000)
  content?: string;

  @IsOptional()
  @IsString()
  parentPostId?: string;

  @IsOptional()
  @IsString()
  rootPostId?: string;

  @IsOptional()
  @IsEnum(ReplyPolicy)
  replyPolicy?: ReplyPolicy;

  @IsOptional()
  @IsBoolean()
  reviewApprove?: boolean;
}
