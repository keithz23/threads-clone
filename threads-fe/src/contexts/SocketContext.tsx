import { MESSAGE_EVENTS } from "@/services/socket/socket.config";
import socketService from "@/services/socket/socket.service";
import { useEffect, useRef, useState } from "react";
import type { Socket } from "socket.io-client";

interface SocketProviderProps {
  children: React.ReactNode;
  userId?: string;
  profileId?: string;
  token?: string;
}

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

    msg.connect();
    rtm.connect?.();
    noti.connect?.();

    const onRealtimeConnect = () => setIsConnected(true);
    const onRealtimeDisconnect = () => setIsConnected(false);
    const onRealtimeError = (err: any) =>
      console.error("Realtime connect_error:", err?.message || err);

    rtm.on("connect", onRealtimeConnect);
    rtm.on("disconnect", onRealtimeDisconnect);
    rtm.on("connect_error", onRealtimeError);

    const onMsgConnect = () => {};
    const onOnlineUsers = (users: string[]) => setOnlineUsers(users);

    msg.on("connect", onMsgConnect);
    msg.on(MESSAGE_EVENTS.ONLINE_USERS, onOnlineUsers);

    return () => {
      rtm.off("connect", onRealtimeConnect);
      rtm.off("disconnect", onRealtimeDisconnect);
      rtm.off("connect_error", onRealtimeError);

      msg.off("connect", onMsgConnect);
      msg.off(MESSAGE_EVENTS.ONLINE_USERS, onOnlineUsers);

      msg.disconnect();
      rtm.disconnect();
      noti.disconnect();
      messageRef.current = null;
      realtimeRef.current = null;
      notificationRef.current = null;
      joinedProfileRef.current = null;
    };
  }, [userId]);

  useEffect(() => {
    const rtm = realtimeRef.current;
    if (!rtm || !profileId) return;
    if (joinedProfileRef.current !== profileId) {
      rtm.emit("profile.join", { id: profileId });
      joinedProfileRef.current = profileId;
    }
  }, [profileId]);

  return (
    <>
      {children}
      {/*  isConnected/onlineUsers */}
    </>
  );
};
