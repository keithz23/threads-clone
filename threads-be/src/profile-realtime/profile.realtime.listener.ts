import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { ProfileUpdatedEvent } from './profile-updated.event';
import { RealtimeService } from 'src/realtime/realtime.service';
import { EV } from 'src/realtime/realtime.types';

@Injectable()
export class ProfileRealtimeListener {
  constructor(private readonly rt: RealtimeService) {}

  @OnEvent('profile.updated')
  handle(e: ProfileUpdatedEvent) {
    this.rt.emitToUser(e.actorUserId, EV.PROFILE_UPDATED, {
      profile: e.profile,
    });
    this.rt.emitToRoom(`profile:${e.profile.id}`, EV.PROFILE_UPDATED, {
      profile: e.profile,
    });
  }
}
