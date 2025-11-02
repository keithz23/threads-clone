export class ProfileUpdatedEvent {
  constructor(
    public readonly actorUserId: string,
    public readonly profile: import('../realtime/realtime.types').ProfilePayload,
  ) {}
}
