import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';
import 'multer';

@Injectable()
export class FileValidationPipe implements PipeTransform {
  constructor(
    private readonly allowedMimeTypes: string[],
    private readonly maxSize: number = 5 * 1024 * 1024, // 5MB default
  ) {}

  transform(file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('File is required');
    }

    if (!this.allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        `Invalid file type. Allowed types: ${this.allowedMimeTypes.join(', ')}`,
      );
    }

    if (file.size > this.maxSize) {
      throw new BadRequestException(
        `File too large. Maximum size: ${this.maxSize / (1024 * 1024)}MB`,
      );
    }

    return file;
  }
}
