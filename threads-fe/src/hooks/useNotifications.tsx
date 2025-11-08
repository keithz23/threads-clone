import { useSocketContext } from "@/contexts/SocketContext";
import { useEffect, useState, useCallback } from "react";

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

  useEffect(() => {
    if (!socket) return;

    setIsConnected(socket.connected);

    const handleInitial = (
      list: Notification[] | { notifications: Notification[] }
    ) => {
      const notificationList = Array.isArray(list)
        ? list
        : list.notifications || [];
      setNotifications(notificationList);
      setUnreadCount(notificationList.filter((n) => !n.isRead).length);
    };

    const handleNew = (notif: Notification) => {
      setNotifications((prev) => [notif, ...prev]);
      if (!notif.isRead) setUnreadCount((prev) => prev + 1);
    };

    const handleUnreadCount = ({ count }: { count: number }) => {
      setUnreadCount(count);
    };

    const handleConnect = () => {
      setIsConnected(true);
      socket.emit("get-notifications");
    };

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
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
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
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
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
      return false;
    }
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
