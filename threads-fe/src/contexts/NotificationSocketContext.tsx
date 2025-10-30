import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { Socket } from "socket.io-client";
import type {
  NotificationSocketContextType,
  Notification,
} from "../interfaces/notification/notification.interface";
import socketService from "../services/socket/socket.service";
import { NOTIFICATION_EVENTS } from "../services/socket/socket.config";
import toast from "react-hot-toast";

const NotificationSocketContext = createContext<
  NotificationSocketContextType | undefined
>(undefined);

export const useNotificationSocket = () => {
  const context = useContext(NotificationSocketContext);
  if (!context) {
    throw new Error(
      "useNotificationSocket must be used within NotificationSocketProvider"
    );
  }
  return context;
};

interface NotificationSocketProviderProps {
  children: React.ReactNode;
  userId?: string;
  token?: string;
}

export const NotificationSocketProvider: React.FC<
  NotificationSocketProviderProps
> = ({ children, userId, token }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [notifications, setNotifications] = useState<Notification[] | []>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Init socket
  useEffect(() => {
    if (!userId) return;

    const notificationSocket = socketService.initNotificationSocket(
      userId,
      token
    );
    setSocket(notificationSocket);

    // Connect
    notificationSocket.connect();

    // Listeners
    notificationSocket.on("connect", () => {
      setIsConnected(true);
      // Get notifications first
      notificationSocket.emit(NOTIFICATION_EVENTS.GET_NOTIFICATIONS);
    });

    notificationSocket.on("disconnect", () => {
      setIsConnected(false);
    });

    // new notification
    notificationSocket.on(
      NOTIFICATION_EVENTS.NEW_NOTIFICATION,
      (notification: Notification) => {
        setNotifications((prev) => [notification, ...prev]);

        // Play sound or show toast
        playNotificationSound();
        showNotificationToast(notification);
      }
    );

    // Update unread count
    notificationSocket.on(
      NOTIFICATION_EVENTS.UNREAD_COUNT,
      ({ count }: { count: number }) => {
        setUnreadCount(count);
      }
    );

    // Cleanup
    return () => {
      socketService.disconnectNotificationSocket();
      setSocket(null);
      setIsConnected(false);
    };
  }, [userId, token]);

  // Get notifications
  const getNotifications = useCallback(() => {
    if (socket?.connected) {
      socket.emit(
        NOTIFICATION_EVENTS.GET_NOTIFICATIONS,
        (response: { notifications: Notification[] }) => {
          setNotifications(response.notifications);
        }
      );
    }
  }, [socket]);

  // Mark as read
  const markAsRead = useCallback(
    (notificationId: string) => {
      if (socket?.connected) {
        socket.emit(NOTIFICATION_EVENTS.MARK_READ, { notificationId });

        // Update local state
        setNotifications((prev) =>
          prev.map((notif) =>
            notif.id === notificationId ? { ...notif, read: true } : notif
          )
        );
      }
    },
    [socket]
  );

  // Mark all as read
  const markAllAsRead = useCallback(() => {
    if (socket?.connected) {
      socket.emit(NOTIFICATION_EVENTS.MARK_ALL_READ);

      // Update local state
      setNotifications((prev) =>
        prev.map((notif) => ({ ...notif, read: true }))
      );
      setUnreadCount(0);
    }
  }, [socket]);

  const value: NotificationSocketContextType = {
    socket,
    isConnected,
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    getNotifications,
  };

  return (
    <NotificationSocketContext.Provider value={value}>
      {children}
    </NotificationSocketContext.Provider>
  );
};

// Helper functions
function playNotificationSound() {
  const audio = new Audio("/notification-sound.mp3");
  audio.play().catch((err) => console.log("Cannot play sound:", err));
}

function showNotificationToast(notification: Notification) {
  console.log("New notification:", notification);
  toast.success(notification.content.message);
}
