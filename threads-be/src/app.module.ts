import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { ScheduleModule } from '@nestjs/schedule';
import { BullModule } from '@nestjs/bullmq';
import appConfig from './config/app.config';
import { validationSchema } from './config/validation.schema';
// Common
import { CommonModule } from './common/common.module';

// Feature modules
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { PostsModule } from './modules/posts/posts.module';
import { CommentsModule } from './modules/comments/comments.module';
import { LikesModule } from './modules/likes/likes.module';
import { FriendshipsModule } from './modules/friendships/friendships.module';
import { MessagesModule } from './modules/messages/messages.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { MediaModule } from './modules/media/media.module';
import { StoriesModule } from './modules/stories/stories.module';
import { GroupsModule } from './modules/groups/groups.module';
import { SearchModule } from './modules/search/search.module';
import { FeedModule } from './modules/feed/feed.module';
import { CacheModule } from './modules/cache/cache.module';
import { TasksModule } from './tasks/tasks.module';

// Guards
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { CustomThrottlerGuard } from './common/guards/throttle.guard';
import { FollowsModule } from './modules/follows/follows.module';
import { RepostsModule } from './modules/reposts/reposts.module';
import { BlocksModule } from './modules/blocks/blocks.module';
import { MailModule } from './mail/mail.module';
import { ConversationsModule } from './modules/conversations/conversations.module';
import { RealtimeModule } from './realtime/realtime.module';
import { EventEmitterModule } from '@nestjs/event-emitter';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.development', '.env.production'],
      load: [appConfig],
      validationSchema,
      validationOptions: {
        allowUnknown: true,
        abortEarly: true,
      },
    }),
    MailModule,

    // Redis Cache
    CacheModule,

    // Bull Queue (for background jobs)
    BullModule.forRoot({
      connection: {
        host: process.env.REDIS_HOST,
        port: parseInt(process.env.REDIS_PORT || ''),
        password: process.env.REDIS_PASSWORD,
      },
    }),

    // Rate limiting
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 1 minute
        limit: 100, // 100 requests
      },
    ]),

    // Scheduled tasks
    ScheduleModule.forRoot(),

    // Common module
    CommonModule,

    // Feature modules
    AuthModule,
    UsersModule,
    PostsModule,
    CommentsModule,
    LikesModule,
    FriendshipsModule,
    MessagesModule,
    NotificationsModule,
    MediaModule,
    StoriesModule,
    GroupsModule,
    SearchModule,
    FeedModule,
    TasksModule,
    FollowsModule,
    RepostsModule,
    ConversationsModule,
    BlocksModule,
    EventEmitterModule.forRoot(),
    RealtimeModule,
  ],
  providers: [
    // Global guards
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: CustomThrottlerGuard,
    },
  ],
})
export class AppModule {}
