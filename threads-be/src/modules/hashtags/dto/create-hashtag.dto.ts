import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateHashtagDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  hashtagName: string;
}
