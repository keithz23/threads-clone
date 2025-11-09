import { useSocketContext } from "@/contexts/SocketContext";
import type { User } from "@/interfaces/auth/user.inteface";
import { useEffect, useState, useCallback, useRef } from "react";
import { playNotificationSound } from "@/utils/sound";

// ============================================
// Type Definitions
// ============================================
export type NotificationType =
  | "LIKE"
  | "COMMENT"
  | "FOLLOW"
  | "MENTION"
  | "REPOST"
  | "REPLY";

export interface Notification {
  id: string;
  type: NotificationType;
  actorId: string;
  actorName?: string;
  actor: User;
  actorAvatar?: string;
  message: string;
  postId?: string;
  isRead: boolean;
  createdAt: string;
}

export interface SendNotificationPayload {
  targetUserId: string;
  type: NotificationType;
  postId?: string;
}

// ============================================
// Main Hook - Uses Socket Context
// ============================================
export default function useNotificationsFromProvider() {
  const { notificationSocket: socket } = useSocketContext();

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isConnected, setIsConnected] = useState(socket?.connected ?? false);

  const isInitialLoadRef = useRef(true);
  const lastNotificationTimeRef = useRef<number>(0);
  const SOUND_COOLDOWN = 500; // ms

  useEffect(() => {
    if (!socket) return;

    setIsConnected(socket.connected);

    // ============================================
    // Handle initial notifications from server
    // ============================================
    const handleInitial = (
      list: Notification[] | { notifications: Notification[] }
    ) => {
      const notificationList = Array.isArray(list)
        ? list
        : list.notifications || [];

      setNotifications(notificationList);
      setUnreadCount(notificationList.filter((n) => !n.isRead).length);

      isInitialLoadRef.current = false;
    };

    // ============================================
    // Handle new incoming notification
    // ============================================
    const handleNew = (notif: Notification) => {
      const now = Date.now();
      const shouldPlaySound =
        !isInitialLoadRef.current &&
        now - lastNotificationTimeRef.current > SOUND_COOLDOWN;

      setNotifications((prev) => [notif, ...prev]);
      if (!notif.isRead) setUnreadCount((prev) => prev + 1);

      if (shouldPlaySound) {
        playNotificationSound();
        lastNotificationTimeRef.current = now;
      }
    };

    // ============================================
    // Handle unread count updates
    // ============================================
    const handleUnreadCount = ({ count }: { count: number }) => {
      setUnreadCount(count);
    };

    // ============================================
    // Handle socket connection
    // ============================================
    const handleConnect = () => {
      setIsConnected(true);
      isInitialLoadRef.current = true;
      socket.emit("get-notifications");
    };

    // ============================================
    // Handle socket disconnection
    // ============================================
    const handleDisconnect = () => {
      setIsConnected(false);
    };

    socket.on("notifications:initial", handleInitial);
    socket.on("new-notification", handleNew);
    socket.on("unread-count", handleUnreadCount);
    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);

    if (socket.connected) {
      socket.emit("get-notifications");
    }

    // Cleanup
    return () => {
      socket.off("notifications:initial", handleInitial);
      socket.off("new-notification", handleNew);
      socket.off("unread-count", handleUnreadCount);
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
    };
  }, [socket]);

  // ============================================
  // Mark single notification as read
  // ============================================
  const markAsRead = useCallback(
    (id: string) => {
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );

      // Update unread count
      setUnreadCount((prev) => Math.max(0, prev - 1));

      if (socket?.connected) {
        socket.emit("mark-notification-read", { notificationId: id });
      }
    },
    [socket]
  );

  // ============================================
  // Mark all notifications as read
  // ============================================
  const markAllRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);

    if (socket?.connected) {
      socket.emit("mark-all-read");
    }
  }, [socket]);

  // ============================================
  // Remove notification from list
  // ============================================
  const removeNotification = useCallback(
    (id: string) => {
      setNotifications((prev) => {
        const notification = prev.find((n) => n.id === id);
        if (notification && !notification.isRead) {
          setUnreadCount((count) => Math.max(0, count - 1));
        }
        return prev.filter((n) => n.id !== id);
      });

      // Optionally emit delete event to backend
      if (socket?.connected) {
        socket.emit("delete-notification", { notificationId: id });
      }
    },
    [socket]
  );

  // ============================================
  // Send notification
  // ============================================
  const sendNotification = useCallback(
    (payload: SendNotificationPayload) => {
      if (!socket?.connected) {
        console.warn("Cannot send notification: socket not connected");
        return false;
      }

      socket.emit("send-notification", payload);
      return true;
    },
    [socket]
  );

  // ============================================
  // Generic emit for custom events
  // ============================================
  const emit = useCallback(
    (event: string, payload?: any) => {
      if (!socket?.connected) {
        console.warn(`Cannot emit ${event}: socket not connected`);
        return false;
      }
      socket.emit(event, payload);
      return true;
    },
    [socket]
  );

  // ============================================
  // Clear all notifications (local only)
  // ============================================
  const clearAll = useCallback(() => {
    setNotifications([]);
    setUnreadCount(0);
  }, []);

  // ============================================
  // Get notification by ID
  // ============================================
  const getNotification = useCallback(
    (id: string) => {
      return notifications.find((n) => n.id === id);
    },
    [notifications]
  );

  // ============================================
  // Refresh notifications from server
  // ============================================
  const refresh = useCallback(() => {
    if (!socket?.connected) {
      console.warn("Cannot refresh: socket not connected");
      return false;
    }
    // Reset initial load flag to prevent sound on refresh
    isInitialLoadRef.current = true;
    socket.emit("get-notifications");
    return true;
  }, [socket]);

  return {
    // State
    notifications,
    unreadCount,
    isConnected,

    // Actions
    markAsRead,
    markAllRead,
    removeNotification,
    sendNotification,
    clearAll,
    refresh,

    // Utilities
    getNotification,
    emit,
  } as const;
}

// ============================================
// Helper hook for easier usage
// ============================================
export function useSendNotification() {
  const { sendNotification, isConnected } = useNotificationsFromProvider();

  const send = useCallback(
    (payload: SendNotificationPayload) => {
      if (!isConnected) {
        console.warn("Cannot send notification: not connected");
        return false;
      }
      return sendNotification(payload);
    },
    [sendNotification, isConnected]
  );

  return {
    sendNotification: send,
    isConnected,
  };
}
