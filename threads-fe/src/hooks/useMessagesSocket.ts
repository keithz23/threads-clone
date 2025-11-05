import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Socket } from "socket.io-client";
import socketService from "@/services/socket/socket.service";
import { MESSAGE_EVENTS as EV } from "@/services/socket/socket.config";

export type MessagePayload = {
  id: string;
  conversationId: string;
  fromUserId: string;
  text?: string;
  attachments?: Array<{
    id?: string;
    url: string;
    type: "image" | "video" | "file";
    name?: string;
    size?: number;
  }>;
  createdAt: string; // ISO
  updatedAt?: string; // ISO
  tempId?: string; // for optimistic UI
  metadata?: Record<string, any>;
};

type UseMessageSocketOptions = {
  currentUserId: string;
  conversationId?: string;
  autoJoin?: boolean;
  socketOverride?: Socket | null;
};

export function useMessageSocket(opts: UseMessageSocketOptions) {
  const {
    currentUserId,
    conversationId,
    autoJoin = true,
    socketOverride,
  } = opts;

  const socket: Socket | null =
    socketOverride ?? socketService.getMessageSocket();

  const [isConnected, setIsConnected] = useState<boolean>(!!socket?.connected);
  const [messages, setMessages] = useState<MessagePayload[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [typingUsers, setTypingUsers] = useState<Record<string, number>>({}); // userId -> lastSeen ms

  const joinedConversationRef = useRef<string | null>(null);

  const sortedMessages = useMemo(
    () =>
      [...messages].sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      ),
    [messages]
  );

  // ----- Handlers -----
  useEffect(() => {
    if (!socket) return;

    const onConnect = () => {
      setIsConnected(true);
      // re-join room nếu có
      if (joinedConversationRef.current) {
        socket.emit(EV.JOIN_CHAT, {
          conversationId: joinedConversationRef.current,
          userId: currentUserId,
        });
      }
    };
    const onDisconnect = () => setIsConnected(false);

    const onReceive = (msg: MessagePayload) => {
      setMessages((prev) => {
        // replace optimistic theo tempId nếu có
        if (msg.tempId) {
          const idx = prev.findIndex((m) => m.tempId === msg.tempId);
          if (idx !== -1) {
            const clone = [...prev];
            clone[idx] = { ...clone[idx], ...msg, tempId: undefined };
            return clone;
          }
        }
        // tránh trùng
        if (prev.some((m) => m.id === msg.id)) return prev;
        return [...prev, msg];
      });
    };

    const onUserTyping = (p: { userId: string; conversationId: string }) => {
      if (p.userId === currentUserId) return;
      setTypingUsers((prev) => ({ ...prev, [p.userId]: Date.now() }));
    };

    const onUserStopTyping = (p: {
      userId: string;
      conversationId: string;
    }) => {
      setTypingUsers((prev) => {
        const clone = { ...prev };
        delete clone[p.userId];
        return clone;
      });
    };

    const onOnlineUsers = (p: { users: string[] }) => {
      setOnlineUsers(p.users || []);
    };

    const onMessageRead = (p: {
      conversationId: string;
      messageIds?: string[];
      lastReadAt?: string;
    }) => {
      if (!p?.messageIds?.length) return;
      setMessages((prev) =>
        prev.map((m) =>
          p.messageIds!.includes(m.id)
            ? {
                ...m,
                metadata: {
                  ...(m.metadata || {}),
                  readAt: p.lastReadAt ?? new Date().toISOString(),
                },
              }
            : m
        )
      );
    };

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on(EV.RECEIVE_MESSAGE, onReceive);
    socket.on(EV.USER_TYPING, onUserTyping);
    socket.on(EV.USER_STOP_TYPING, onUserStopTyping);
    socket.on(EV.ONLINE_USERS, onOnlineUsers);
    socket.on(EV.MESSAGE_READ, onMessageRead);

    setIsConnected(socket.connected);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off(EV.RECEIVE_MESSAGE, onReceive);
      socket.off(EV.USER_TYPING, onUserTyping);
      socket.off(EV.USER_STOP_TYPING, onUserStopTyping);
      socket.off(EV.ONLINE_USERS, onOnlineUsers);
      socket.off(EV.MESSAGE_READ, onMessageRead);
    };
  }, [socket, currentUserId]);

  // Auto join/leave theo conversationId
  useEffect(() => {
    if (!socket || !autoJoin) return;

    if (conversationId) {
      socket.emit(EV.JOIN_CHAT, { conversationId, userId: currentUserId });
      joinedConversationRef.current = conversationId;
    }

    return () => {
      if (conversationId) {
        socket.emit(EV.LEAVE_CHAT, { conversationId });
        if (joinedConversationRef.current === conversationId) {
          joinedConversationRef.current = null;
        }
      }
    };
  }, [socket, autoJoin, conversationId, currentUserId]);

  // Auto-expire typing indicators (5s)
  useEffect(() => {
    const id = setInterval(() => {
      const now = Date.now();
      setTypingUsers((prev) => {
        const clone = { ...prev };
        for (const uid of Object.keys(clone)) {
          if (now - clone[uid] > 5000) delete clone[uid];
        }
        return clone;
      });
    }, 1500);
    return () => clearInterval(id);
  }, []);

  // ----- Public API -----
  const join = useCallback(
    (cid: string) => {
      if (!socket || !cid) return;
      socket.emit(EV.JOIN_CHAT, { conversationId: cid, userId: currentUserId });
      joinedConversationRef.current = cid;
    },
    [socket, currentUserId]
  );

  const leave = useCallback(
    (cid?: string) => {
      if (!socket) return;
      const rid = cid ?? joinedConversationRef.current ?? conversationId;
      if (!rid) return;
      socket.emit(EV.LEAVE_CHAT, { conversationId: rid });
      if (joinedConversationRef.current === rid)
        joinedConversationRef.current = null;
    },
    [socket, conversationId]
  );

  const sendText = useCallback(
    (text: string, extra?: Partial<MessagePayload>) => {
      if (!socket || !joinedConversationRef.current) return;
      const tempId = `tmp_${Date.now()}_${Math.random()
        .toString(36)
        .slice(2, 8)}`;
      const optimistic: MessagePayload = {
        id: tempId,
        tempId,
        conversationId: joinedConversationRef.current,
        fromUserId: currentUserId,
        text,
        createdAt: new Date().toISOString(),
        metadata: { optimistic: true, ...(extra?.metadata || {}) },
      };
      setMessages((prev) => [...prev, optimistic]);

      socket.emit(EV.SEND_MESSAGE, {
        conversationId: joinedConversationRef.current,
        text,
        metadata: extra?.metadata,
      });
      // Server sẽ emit lại RECEIVE_MESSAGE -> sẽ replace temp message
    },
    [socket, currentUserId]
  );

  const startTyping = useCallback(() => {
    if (!socket || !joinedConversationRef.current) return;
    socket.emit(EV.TYPING, {
      conversationId: joinedConversationRef.current,
      userId: currentUserId,
    });
  }, [socket, currentUserId]);

  const stopTyping = useCallback(() => {
    if (!socket || !joinedConversationRef.current) return;
    socket.emit(EV.STOP_TYPING, {
      conversationId: joinedConversationRef.current,
      userId: currentUserId,
    });
  }, [socket, currentUserId]);

  const markRead = useCallback(
    (messageIds?: string[]) => {
      if (!socket || !joinedConversationRef.current) return;
      socket.emit(EV.MARK_READ, {
        conversationId: joinedConversationRef.current,
        messageIds,
        lastReadAt: new Date().toISOString(),
      });
    },
    [socket]
  );

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  return {
    // state
    isConnected,
    socket,
    messages: sortedMessages,
    typingUsers: Object.keys(typingUsers),
    onlineUsers,

    // room
    join,
    leave,

    // actions
    sendText,
    startTyping,
    stopTyping,
    markRead,
    clearMessages,
  };
}
