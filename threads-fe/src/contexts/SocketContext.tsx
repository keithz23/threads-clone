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
  // Helper methods
  joinRoom: (
    namespace: "REALTIME" | "MESSAGES" | "NOTIFICATIONS",
    room: string
  ) => void;
  leaveRoom: (
    namespace: "REALTIME" | "MESSAGES" | "NOTIFICATIONS",
    room: string
  ) => void;
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
  joinRoom: () => {},
  leaveRoom: () => {},
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

  // Setup token provider
  useEffect(() => {
    if (token) {
      socketService.setTokenProvider(async () => token);
    }
  }, [token]);

  // Initialize sockets when userId available
  useEffect(() => {
    if (!userId) {
      // Disconnect all
      if (messageRef.current) {
        messageRef.current.disconnect();
        messageRef.current = null;
      }
      if (realtimeRef.current) {
        realtimeRef.current.disconnect();
        realtimeRef.current = null;
      }
      if (notificationRef.current) {
        notificationRef.current.disconnect();
        notificationRef.current = null;
      }

      setIsConnected(false);
      setOnlineUsers([]);
      return;
    }

    // Initialize message socket
    if (!messageRef.current) {
      messageRef.current = socketService.initMessageSocket(userId, token);
    }

    // Initialize realtime socket with profileId context
    if (!realtimeRef.current) {
      realtimeRef.current = socketService.initRealtimeSocket(userId, token, {
        profileId: profileId || "",
      });
    }

    // Initialize notification socket
    if (!notificationRef.current) {
      notificationRef.current = socketService.initNotificationSocket(
        userId,
        token
      );
    }

    const msg = messageRef.current;
    const rtm = realtimeRef.current;
    const noti = notificationRef.current;

    // Realtime socket handlers
    const onRealtimeConnect = () => {
      setIsConnected(true);

      // Auto-join profile room if profileId exists
      if (profileId && joinedProfileRef.current !== profileId) {
        rtm.emit("room:join", {
          profileId,
          room: `profile:${profileId}`,
        });
        joinedProfileRef.current = profileId;
      }
    };

    const onRealtimeDisconnect = () => {
      setIsConnected(false);
    };

    const onRealtimeError = (err: any) => {
      console.error("Realtime socket error:", err?.message || err);
    };

    // Room join confirmation
    const onRoomJoined = () => {};

    rtm.on("connect", onRealtimeConnect);
    rtm.on("disconnect", onRealtimeDisconnect);
    rtm.on("connect_error", onRealtimeError);
    rtm.on("room:joined", onRoomJoined);

    // Message socket handlers
    const onMsgConnect = () => {};

    const onOnlineUsers = (users: string[]) => {
      setOnlineUsers(users);
    };

    msg.on("connect", onMsgConnect);
    msg.on(MESSAGE_EVENTS.ONLINE_USERS, onOnlineUsers);

    // Notification socket handlers
    const onNotiConnect = () => {};

    const onNotiDisconnect = () => {};

    noti.on("connect", onNotiConnect);
    noti.on("disconnect", onNotiDisconnect);

    // Cleanup
    return () => {
      console.log("🧹 Cleaning up socket listeners");

      // Remove listeners
      rtm.off("connect", onRealtimeConnect);
      rtm.off("disconnect", onRealtimeDisconnect);
      rtm.off("connect_error", onRealtimeError);
      rtm.off("room:joined", onRoomJoined);

      msg.off("connect", onMsgConnect);
      msg.off(MESSAGE_EVENTS.ONLINE_USERS, onOnlineUsers);

      noti.off("connect", onNotiConnect);
      noti.off("disconnect", onNotiDisconnect);

      // Leave profile room if joined
      if (joinedProfileRef.current) {
        rtm.emit("room:leave", {
          profileId: joinedProfileRef.current,
          room: `profile:${joinedProfileRef.current}`,
        });
        joinedProfileRef.current = null;
      }
    };
  }, [userId, token, profileId]);

  // Handle profileId changes
  useEffect(() => {
    const rtm = realtimeRef.current;
    if (!rtm || !rtm.connected || !profileId) return;

    if (joinedProfileRef.current === profileId) {
      console.log(`Already in profile room: profile:${profileId}`);
      return;
    }

    // Leave old profile room
    if (joinedProfileRef.current) {
      rtm.emit("room:leave", {
        profileId: joinedProfileRef.current,
        room: `profile:${joinedProfileRef.current}`,
      });
    }

    // Join new profile room
    rtm.emit("room:join", {
      profileId,
      room: `profile:${profileId}`,
    });
    joinedProfileRef.current = profileId;
  }, [profileId]);

  // Helper methods
  const joinRoom = (
    namespace: "REALTIME" | "MESSAGES" | "NOTIFICATIONS",
    room: string
  ) => {
    const socket =
      namespace === "REALTIME"
        ? realtimeRef.current
        : namespace === "MESSAGES"
        ? messageRef.current
        : notificationRef.current;

    if (socket?.connected) {
      socket.emit("room:join", { room });
    } else {
      console.warn(`Cannot join room, ${namespace} socket not connected`);
    }
  };

  const leaveRoom = (
    namespace: "REALTIME" | "MESSAGES" | "NOTIFICATIONS",
    room: string
  ) => {
    const socket =
      namespace === "REALTIME"
        ? realtimeRef.current
        : namespace === "MESSAGES"
        ? messageRef.current
        : notificationRef.current;

    if (socket?.connected) {
      socket.emit("room:leave", { room });
    }
  };

  const contextValue: SocketContextValue = {
    messageSocket: messageRef.current,
    realtimeSocket: realtimeRef.current,
    notificationSocket: notificationRef.current,
    isConnected,
    onlineUsers,
    joinRoom,
    leaveRoom,
  };

  return (
    <SocketContext.Provider value={contextValue}>
      {children}
    </SocketContext.Provider>
  );
};

export { SocketContext };
