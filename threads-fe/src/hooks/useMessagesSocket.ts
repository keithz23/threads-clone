import { useEffect, useCallback, useRef } from "react";
import socketService from "@/services/socket/socket.service";
import { MESSAGE_EVENTS } from "@/services/socket/socket.config";
import type { Socket } from "socket.io-client";

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  type: "text" | "image" | "file" | "video" | "audio";
  createdAt: string;
  updatedAt?: string;
  metadata?: Record<string, any>;
}

export interface SendMessagePayload {
  conversationId: string;
  content: string;
  type?: Message["type"];
  metadata?: Record<string, any>;
}

export interface TypingIndicator {
  conversationId: string;
  userId: string;
  isTyping: boolean;
}

export interface MessageReadPayload {
  conversationId: string;
  messageId: string;
  userId: string;
}

// Hook options
interface UseMessageSocketOptions {
  onNewMessage?: (message: Message) => void;
  onMessageUpdated?: (message: Message) => void;
  onMessageDeleted?: (messageId: string) => void;
  onTyping?: (data: TypingIndicator) => void;
  onMessageRead?: (data: MessageReadPayload) => void;
  onError?: (error: any) => void;
  enabled?: boolean;
}

export const useMessageSocket = (options: UseMessageSocketOptions = {}) => {
  const {
    onNewMessage,
    onMessageUpdated,
    onMessageDeleted,
    onTyping,
    onMessageRead,
    onError,
    enabled = true,
  } = options;

  const socketRef = useRef<Socket | null>(null);

  // Setup socket listeners
  useEffect(() => {
    if (!enabled) return;

    const socket = socketService.getMessageSocket();
    if (!socket) {
      console.warn("Message socket not initialized");
      return;
    }

    socketRef.current = socket;

    const handleNewMessage = (message: Message) => {
      console.log("[useMessageSocket] New message:", message);
      onNewMessage?.(message);
    };

    const handleMessageUpdated = (message: Message) => {
      console.log("[useMessageSocket] Message updated:", message);
      onMessageUpdated?.(message);
    };

    const handleMessageDeleted = (data: { messageId: string }) => {
      console.log("[useMessageSocket] Message deleted:", data.messageId);
      onMessageDeleted?.(data.messageId);
    };

    const handleTyping = (data: TypingIndicator) => {
      onTyping?.(data);
    };

    const handleMessageRead = (data: MessageReadPayload) => {
      console.log("[useMessageSocket] Message read:", data);
      onMessageRead?.(data);
    };

    const handleError = (error: any) => {
      console.error("[useMessageSocket] Error:", error);
      onError?.(error);
    };

    socket.on(MESSAGE_EVENTS.NEW_MESSAGE, handleNewMessage);
    socket.on(MESSAGE_EVENTS.MESSAGE_UPDATED, handleMessageUpdated);
    socket.on(MESSAGE_EVENTS.MESSAGE_DELETED, handleMessageDeleted);
    socket.on(MESSAGE_EVENTS.TYPING, handleTyping);
    socket.on(MESSAGE_EVENTS.MESSAGE_READ, handleMessageRead);
    socket.on(MESSAGE_EVENTS.ERROR, handleError);

    // Cleanup
    return () => {
      socket.off(MESSAGE_EVENTS.NEW_MESSAGE, handleNewMessage);
      socket.off(MESSAGE_EVENTS.MESSAGE_UPDATED, handleMessageUpdated);
      socket.off(MESSAGE_EVENTS.MESSAGE_DELETED, handleMessageDeleted);
      socket.off(MESSAGE_EVENTS.TYPING, handleTyping);
      socket.off(MESSAGE_EVENTS.MESSAGE_READ, handleMessageRead);
      socket.off(MESSAGE_EVENTS.ERROR, handleError);
    };
  }, [
    enabled,
    onNewMessage,
    onMessageUpdated,
    onMessageDeleted,
    onTyping,
    onMessageRead,
    onError,
  ]);

  // ===== Message Actions =====

  // Join conversation room
  const joinConversation = useCallback((conversationId: string) => {
    const socket = socketRef.current;
    if (!socket?.connected) {
      console.warn("Socket not connected");
      return;
    }

    console.log("[useMessageSocket] Joining conversation:", conversationId);
    socket.emit(MESSAGE_EVENTS.JOIN_CONVERSATION, { conversationId });
  }, []);

  // Leave conversation room
  const leaveConversation = useCallback((conversationId: string) => {
    const socket = socketRef.current;
    if (!socket?.connected) {
      console.warn("Socket not connected");
      return;
    }

    console.log("[useMessageSocket] Leaving conversation:", conversationId);
    socket.emit(MESSAGE_EVENTS.LEAVE_CONVERSATION, { conversationId });
  }, []);

  // Send message
  const sendMessage = useCallback(
    (payload: SendMessagePayload, callback?: (response: any) => void) => {
      const socket = socketRef.current;
      if (!socket?.connected) {
        console.warn("Socket not connected");
        callback?.({ success: false, error: "Socket not connected" });
        return;
      }

      console.log("[useMessageSocket] Sending message:", payload);
      socket.emit(MESSAGE_EVENTS.SEND_MESSAGE, payload, (response: any) => {
        if (response?.success) {
          console.log("[useMessageSocket] Message sent successfully");
        } else {
          console.error("[useMessageSocket] Failed to send message:", response);
        }
        callback?.(response);
      });
    },
    []
  );

  // Update message
  const updateMessage = useCallback(
    (
      messageId: string,
      updates: Partial<Pick<Message, "content" | "metadata">>,
      callback?: (response: any) => void
    ) => {
      const socket = socketRef.current;
      if (!socket?.connected) {
        console.warn("Socket not connected");
        return;
      }

      socket.emit(
        MESSAGE_EVENTS.UPDATE_MESSAGE,
        { messageId, ...updates },
        callback
      );
    },
    []
  );

  // Delete message
  const deleteMessage = useCallback(
    (messageId: string, callback?: (response: any) => void) => {
      const socket = socketRef.current;
      if (!socket?.connected) {
        console.warn("Socket not connected");
        return;
      }

      socket.emit(MESSAGE_EVENTS.DELETE_MESSAGE, { messageId }, callback);
    },
    []
  );

  // Send typing indicator
  const sendTyping = useCallback(
    (conversationId: string, isTyping: boolean) => {
      const socket = socketRef.current;
      if (!socket?.connected) return;

      socket.emit(MESSAGE_EVENTS.TYPING, {
        conversationId,
        isTyping,
      });
    },
    []
  );

  // Mark message as read
  const markAsRead = useCallback(
    (conversationId: string, messageId: string) => {
      const socket = socketRef.current;
      if (!socket?.connected) return;

      socket.emit(MESSAGE_EVENTS.MARK_AS_READ, {
        conversationId,
        messageId,
      });
    },
    []
  );

  // Get connection status
  const isConnected = socketRef.current?.connected ?? false;

  return {
    // Connection status
    isConnected,
    socket: socketRef.current,

    // Actions
    joinConversation,
    leaveConversation,
    sendMessage,
    updateMessage,
    deleteMessage,
    sendTyping,
    markAsRead,
  };
};

// ===== Helper Hook for Typing Indicator =====
export const useTypingIndicator = (
  conversationId: string,
  delay: number = 2000
) => {
  const { sendTyping } = useMessageSocket();
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const startTyping = useCallback(() => {
    if (!conversationId) return;

    // Send typing indicator
    sendTyping(conversationId, true);

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set timeout to stop typing
    timeoutRef.current = setTimeout(() => {
      sendTyping(conversationId, false);
    }, delay);
  }, [conversationId, delay, sendTyping]);

  const stopTyping = useCallback(() => {
    if (!conversationId) return;

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    sendTyping(conversationId, false);
  }, [conversationId, sendTyping]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return { startTyping, stopTyping };
};
