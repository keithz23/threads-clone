import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class SocketRedisService implements OnModuleInit, OnModuleDestroy {
  private pubClient: Redis;
  private subClient: Redis;
  private logger = new Logger(SocketRedisService.name);

  constructor(private configService: ConfigService) {}

  async onModuleInit() {
    const url = this.configService.get<string>('config.redis.url');
    if (!url) {
      throw new Error('Redis URL is not configured for Socket.IO');
    }

    this.pubClient = new Redis(url, {
      retryStrategy: (times: number) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
    });

    this.subClient = new Redis(url, {
      retryStrategy: (times: number) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
    });

    this.pubClient.on('connect', () => {
      this.logger.log('Socket.IO Redis Pub Client connected');
    });

    this.subClient.on('connect', () => {
      this.logger.log('Socket.IO Redis Sub Client connected');
    });

    this.pubClient.on('error', (err) => {
      this.logger.error('Socket.IO Redis Pub error:', err);
    });

    this.subClient.on('error', (err) => {
      this.logger.error('Socket.IO Redis Sub error:', err);
    });
  }

  getPubClient(): Redis {
    return this.pubClient;
  }

  getSubClient(): Redis {
    return this.subClient;
  }

  async onModuleDestroy() {
    await this.pubClient?.quit();
    await this.subClient?.quit();
    this.logger.log('Socket.IO Redis clients disconnected');
  }
}
