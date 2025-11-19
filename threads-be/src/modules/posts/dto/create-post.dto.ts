import {
  IsOptional,
  IsString,
  MaxLength,
  IsEnum,
  IsBoolean,
  IsArray,
} from 'class-validator';
import { ReplyPolicy } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePostDto {
  @ApiProperty()
  @IsOptional()
  @IsString()
  @MaxLength(5000)
  content?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  parentPostId?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  rootPostId?: string;

  @ApiProperty()
  @IsOptional()
  @IsEnum(ReplyPolicy)
  replyPolicy?: ReplyPolicy;

  @ApiProperty()
  @IsOptional()
  @IsBoolean()
  reviewApprove?: boolean;

  @ApiProperty()
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  hashtags?: string[];
}
