import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class LikeDto {
  @ApiProperty()
  @IsString()
  postId: string;

  @ApiProperty()
  @IsString()
  postOwnerId: string;
}
