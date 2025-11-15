import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsOptional } from 'class-validator';

export class ToggleMuteDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  mutedUntil?: string;
}
