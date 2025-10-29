import type { Socket } from "socket.io-client";

export type NotificationType =
  | "new_message"
  | "new_like"
  | "new_comment"
  | "new_follower"
  | "mention";

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  content: any;
  read: boolean;
  createdAt: Date;
}

export interface NotificationSocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
  getNotifications: () => void;
}
