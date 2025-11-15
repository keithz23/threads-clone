import { PartialType } from '@nestjs/mapped-types';
import { LikeDto } from './create-like.dto';

export class UpdateLikeDto extends PartialType(LikeDto) {}
