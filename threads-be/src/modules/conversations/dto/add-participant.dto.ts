import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class AddParticipantDto {
  @ApiProperty()
  @IsString()
  userId!: string;
}
