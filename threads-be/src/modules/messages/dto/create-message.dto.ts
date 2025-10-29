import { ApiProperty } from '@nestjs/swagger';
import { $Enums } from '@prisma/client';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export class CreateMessageDto {
  @ApiProperty()
  @IsString()
  senderId!: string;

  @ApiProperty()
  @IsString()
  conversationId!: string;

  @ApiProperty()
  @IsString()
  content!: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  replyToId?: string;

  @ApiProperty()
  @IsOptional()
  @IsEnum($Enums.MessageType)
  messageType?: $Enums.MessageType;

  @ApiProperty()
  @IsOptional()
  @IsString()
  mediaUrl?: string;
}
