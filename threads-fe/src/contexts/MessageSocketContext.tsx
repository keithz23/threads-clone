import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { Socket } from "socket.io-client";
import type { MessageSocketContextType } from "../interfaces/messages/message.interface";
import socketService from "../services/socket/socket.service";
import { MESSAGE_EVENTS } from "../services/socket/socket.config";

const MessageSocketContext = createContext<
  MessageSocketContextType | undefined
>(undefined);

export const useMessageSocket = () => {
  const context = useContext(MessageSocketContext);
  if (!context) {
    throw new Error(
      "useMessageSocket must be used within MessageSocketProvider"
    );
  }
  return context;
};

interface MessageSocketProviderProps {
  children: React.ReactNode;
  userId?: string;
  token?: string;
}

export const MessageSocketProvider: React.FC<MessageSocketProviderProps> = ({
  children,
  userId,
  token,
}) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);

  // Khởi tạo socket
  useEffect(() => {
    if (!userId)  return;

    const messageSocket = socketService.initMessageSocket(userId, token);
    setSocket(messageSocket);

    // Connect
    messageSocket.connect();

    // Listeners
    messageSocket.on("connect", () => {
      setIsConnected(true);
    });

    messageSocket.on("disconnect", () => {
      setIsConnected(false);
    });

    messageSocket.on(MESSAGE_EVENTS.ONLINE_USERS, (users: string[]) => {
      setOnlineUsers(users);
    });

    // Cleanup
    return () => {
      socketService.disconnectMessageSocket();
      setSocket(null);
      setIsConnected(false);
    };
  }, [userId, token]);

  // Send message
  const sendMessage = useCallback(
    (receiverId: string, content: string, chatId: string) => {
      if (socket?.connected) {
        socket.emit(MESSAGE_EVENTS.SEND_MESSAGE, {
          receiverId,
          content,
          chatId,
        });
      }
    },
    [socket]
  );

  // Join chat
  const joinChat = useCallback(
    (chatId: string) => {
      if (socket?.connected) {
        socket.emit(MESSAGE_EVENTS.JOIN_CHAT, { chatId });
      }
    },
    [socket]
  );

  // Leave chat
  const leaveChat = useCallback(
    (chatId: string) => {
      if (socket?.connected) {
        socket.emit(MESSAGE_EVENTS.LEAVE_CHAT, { chatId });
      }
    },
    [socket]
  );

  // Emit typing
  const emitTyping = useCallback(
    (receiverId: string, chatId: string) => {
      if (socket?.connected) {
        socket.emit(MESSAGE_EVENTS.TYPING, { receiverId, chatId });
      }
    },
    [socket]
  );

  // Emit stop typing
  const emitStopTyping = useCallback(
    (receiverId: string, chatId: string) => {
      if (socket?.connected) {
        socket.emit(MESSAGE_EVENTS.STOP_TYPING, { receiverId, chatId });
      }
    },
    [socket]
  );

  // Mark as read
  const markAsRead = useCallback(
    (messageIds: string[]) => {
      if (socket?.connected) {
        socket.emit(MESSAGE_EVENTS.MARK_READ, { messageIds });
      }
    },
    [socket]
  );

  const value: MessageSocketContextType = {
    socket,
    isConnected,
    onlineUsers,
    sendMessage,
    joinChat,
    leaveChat,
    emitTyping,
    emitStopTyping,
    markAsRead,
  };

  return (
    <MessageSocketContext.Provider value={value}>
      {children}
    </MessageSocketContext.Provider>
  );
};
