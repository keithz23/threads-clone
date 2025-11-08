import { MESSAGE_EVENTS } from "@/services/socket/socket.config";
import socketService from "@/services/socket/socket.service";
import { createContext, useContext, useEffect, useRef, useState } from "react";
import type { Socket } from "socket.io-client";

// ============================================
// Types
// ============================================
interface SocketContextValue {
  messageSocket: Socket | null;
  realtimeSocket: Socket | null;
  notificationSocket: Socket | null;
  isConnected: boolean;
  onlineUsers: string[];
}

interface SocketProviderProps {
  children: React.ReactNode;
  userId?: string;
  profileId?: string;
  token?: string;
}

// ============================================
// Context
// ============================================
const SocketContext = createContext<SocketContextValue>({
  messageSocket: null,
  realtimeSocket: null,
  notificationSocket: null,
  isConnected: false,
  onlineUsers: [],
});

export const useSocketContext = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocketContext must be used within SocketProvider");
  }
  return context;
};

// ============================================
// Provider Component
// ============================================
export const SocketProvider: React.FC<SocketProviderProps> = ({
  children,
  userId,
  profileId,
  token,
}) => {
  const messageRef = useRef<Socket | null>(null);
  const realtimeRef = useRef<Socket | null>(null);
  const notificationRef = useRef<Socket | null>(null);

  const joinedProfileRef = useRef<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);

  useEffect(() => {
    if (!userId) return;

    if (!messageRef.current) {
      messageRef.current = socketService.initMessageSocket(userId);
    }
    if (!realtimeRef.current) {
      realtimeRef.current = socketService.initRealtimeSocket(userId, token, {
        profileId: profileId || "",
      });
    }
    if (!notificationRef.current) {
      notificationRef.current = socketService.initNotificationSocket(userId);
    }

    const msg = messageRef.current!;
    const rtm = realtimeRef.current!;
    const noti = notificationRef.current!;

    // Connect sockets
    msg.connect();
    rtm.connect?.();
    noti.connect?.();

    // Realtime socket handlers
    const onRealtimeConnect = () => {
      setIsConnected(true);
    };
    const onRealtimeDisconnect = () => {
      setIsConnected(false);
    };
    const onRealtimeError = (err: any) => console.error(err?.message || err);

    rtm.on("connect", onRealtimeConnect);
    rtm.on("disconnect", onRealtimeDisconnect);
    rtm.on("connect_error", onRealtimeError);

    // Message socket handlers
    const onMsgConnect = () => {};
    const onOnlineUsers = (users: string[]) => {
      setOnlineUsers(users);
    };

    msg.on("connect", onMsgConnect);
    msg.on(MESSAGE_EVENTS.ONLINE_USERS, onOnlineUsers);

    // Notification socket handlers
    const onNotiConnect = () => {};
    const onNotiDisconnect = () => {
      console.log("🔌 Notification socket disconnected");
    };

    noti.on("connect", onNotiConnect);
    noti.on("disconnect", onNotiDisconnect);

    // Cleanup
    return () => {
      // Remove listeners
      rtm.off("connect", onRealtimeConnect);
      rtm.off("disconnect", onRealtimeDisconnect);
      rtm.off("connect_error", onRealtimeError);

      msg.off("connect", onMsgConnect);
      msg.off(MESSAGE_EVENTS.ONLINE_USERS, onOnlineUsers);

      noti.off("connect", onNotiConnect);
      noti.off("disconnect", onNotiDisconnect);

      // Disconnect sockets
      msg.disconnect();
      rtm.disconnect();
      noti.disconnect();

      // Clear refs
      messageRef.current = null;
      realtimeRef.current = null;
      notificationRef.current = null;
      joinedProfileRef.current = null;
    };
  }, [userId, token]);

  useEffect(() => {
    const rtm = realtimeRef.current;
    if (!rtm || !profileId) return;

    if (joinedProfileRef.current !== profileId) {
      // Leave old profile room
      if (joinedProfileRef.current) {
        rtm.emit("profile.leave", { id: joinedProfileRef.current });
      }

      // Join new profile room
      rtm.emit("profile.join", { id: profileId });
      joinedProfileRef.current = profileId;
    }

    return () => {
      // Leave profile room on cleanup
      if (joinedProfileRef.current) {
        rtm.emit("profile.leave", { id: joinedProfileRef.current });
        joinedProfileRef.current = null;
      }
    };
  }, [profileId]);

  const contextValue: SocketContextValue = {
    messageSocket: messageRef.current,
    realtimeSocket: realtimeRef.current,
    notificationSocket: notificationRef.current,
    isConnected,
    onlineUsers,
  };

  return (
    <SocketContext.Provider value={contextValue}>
      {children}
    </SocketContext.Provider>
  );
};

// ============================================
// Export context for direct usage
// ============================================
export { SocketContext };
