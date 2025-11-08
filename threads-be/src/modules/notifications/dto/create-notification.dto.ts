import { $Enums, NotificationType } from '@prisma/client';

export class CreateNotificationDto {
  userId: string;
  actorId: string;
  postId?: string;
  type: $Enums.NotificationType;
}
