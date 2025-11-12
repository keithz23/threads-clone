import { Injectable, Logger } from '@nestjs/common';
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  DeleteObjectsCommand,
} from '@aws-sdk/client-s3';
import { ConfigService } from '@nestjs/config';
import * as sharp from 'sharp';
import { UploadResult } from 'src/common/interfaces/file-upload.interface';

@Injectable()
export class S3Service {
  private readonly logger = new Logger(S3Service.name);
  private s3Client: S3Client;
  private bucketName: string;
  private region: string;

  constructor(private configService: ConfigService) {
    this.region = this.configService.get<string>('config.aws.region') ?? '';
    this.bucketName = this.configService.get<string>('config.aws.bucket') ?? '';
    this.s3Client = new S3Client({
      region: this.region,
      credentials: {
        accessKeyId: this.configService.get('config.aws.accessKey') ?? '',
        secretAccessKey:
          this.configService.get('config.aws.secretAccessKey') ?? '',
      },
    });
  }

  // Upload single image with optimization
  async uploadImage(
    file: Express.Multer.File,
    folder: string,
    options?: { resize?: boolean; quality?: number },
  ): Promise<UploadResult> {
    try {
      let buffer = file.buffer;
      let mimetype = file.mimetype;

      // Resize and optimize
      if (options?.resize) {
        buffer = await sharp(file.buffer)
          .resize(1920, 1080, {
            fit: 'inside',
            withoutEnlargement: true,
          })
          .jpeg({ quality: options.quality || 85 })
          .toBuffer();
        mimetype = 'image/jpeg';
      }

      const key = this.generateKey(file.originalname, folder);

      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: key,
        Body: buffer,
        ContentType: mimetype,
        // ACL: 'public-read',
      });

      await this.s3Client.send(command);

      return {
        url: this.getFileUrl(key),
        key,
        size: buffer.length,
        mimetype,
      };
    } catch (error) {
      this.logger.error(`Upload failed: ${error.message}`);
      throw error;
    }
  }

  // Upload multiple images
  async uploadImages(
    files: Express.Multer.File[],
    folder: string,
    options?: { resize?: boolean; quality?: number },
  ): Promise<UploadResult[]> {
    const uploadPromises = files.map((file) =>
      this.uploadImage(file, folder, options),
    );
    return Promise.all(uploadPromises);
  }

  // Generate thumbnail
  async generateThumbnail(
    file: Express.Multer.File,
    folder: string,
  ): Promise<UploadResult> {
    const buffer = await sharp(file.buffer)
      .resize(300, 300, { fit: 'cover' })
      .jpeg({ quality: 80 })
      .toBuffer();

    const key = this.generateKey(`thumb-${file.originalname}`, folder);

    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: key,
      Body: buffer,
      ContentType: 'image/gif',
      ACL: 'public-read',
    });

    await this.s3Client.send(command);

    return {
      url: this.getFileUrl(key),
      key,
      size: buffer.length,
      mimetype: 'image/jpeg',
    };
  }

  // Delete single file
  async deleteFile(key: string): Promise<void> {
    try {
      const command = new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });
      await this.s3Client.send(command);
      this.logger.log(`Deleted file: ${key}`);
    } catch (error) {
      this.logger.error(`Delete failed: ${error.message}`);
      throw error;
    }
  }

  // Delete multiple files
  async deleteFiles(keys: string[]): Promise<void> {
    if (keys.length === 0) return;

    try {
      const command = new DeleteObjectsCommand({
        Bucket: this.bucketName,
        Delete: {
          Objects: keys.map((key) => ({ Key: key })),
        },
      });
      await this.s3Client.send(command);
      this.logger.log(`Deleted ${keys.length} files`);
    } catch (error) {
      this.logger.error(`Batch delete failed: ${error.message}`);
      throw error;
    }
  }

  // Generate unique key
  private generateKey(originalname: string, folder: string): string {
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const ext = originalname.split('.').pop();
    const filename = `${timestamp}-${randomString}.${ext}`;
    return folder ? `${folder}/${filename}` : filename;
  }

  // Get file URL
  private getFileUrl(key: string): string {
    return `https://${this.bucketName}.s3.${this.region}.amazonaws.com/${key}`;
  }

  // Extract key from URL
  extractKeyFromUrl(url: string): string {
    try {
      const urlObj = new URL(url);
      return urlObj.pathname.substring(1);
    } catch {
      return url;
    }
  }
}
