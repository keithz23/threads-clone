import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class FollowDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  followingId: string;
}

export class UnFollowDto extends FollowDto {}
