import {
  IsEmail,
  IsString,
  MinLength,
  MaxLength,
  Matches,
  IsNotEmpty,
  IsOptional,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Match } from '../../../common/decorators/match.decorator';

export class RegisterDto {
  @ApiProperty({
    example: 'johndoe',
    description:
      'Unique username (3-30 characters, alphanumeric and underscores only)',
  })
  @IsString()
  @MinLength(3)
  @MaxLength(30)
  @Matches(/^[a-zA-Z0-9_]+$/, {
    message: 'Username can only contain letters, numbers and underscores',
  })
  username: string;

  @ApiProperty({
    example: 'john.doe@example.com',
    description: 'Valid email address',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    example: 'StrongPass123!',
    description:
      'Password (min 8 chars, must contain uppercase, lowercase, number and special character)',
  })
  @IsString()
  @MinLength(8)
  @MaxLength(128)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, {
    message:
      'Password must contain uppercase, lowercase, number and special character',
  })
  password: string;

  @ApiProperty({ example: 'StrongPass123!' })
  @IsString()
  @Match('password', { message: 'Passwords do not match' })
  passwordConfirm: string;

  @ApiPropertyOptional({
    example: 'John Doe',
    description: 'Display name (optional, max 50 characters)',
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  displayName?: string;
}
