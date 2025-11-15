import { Injectable } from '@nestjs/common';
import { CreateHashtagDto } from './dto/create-hashtag.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class HashtagsService {
  constructor(private readonly prisma: PrismaService) {}
  async create(createHashtagDto: CreateHashtagDto) {
    const { hashtagName } = createHashtagDto;

    const hashtag = await this.prisma.hashtag.upsert({
      where: { name: hashtagName },
      update: {},
      create: { name: hashtagName },
    });

    return hashtag;
  }

  async findAll() {
    const hashtags = await this.prisma.hashtag.findMany({
      orderBy: { createdAt: 'desc' },
      take: 1000,
    });

    return hashtags;
  }

  async searchHashtags(query: string) {
    return this.prisma.hashtag.findMany({
      where: {
        name: {
          startsWith: query,
          mode: 'insensitive',
        },
      },
    });
  }
}
