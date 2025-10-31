import type { Socket } from "socket.io-client";

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  chatId: string;
  createdAt: Date;
  read: boolean;
}

export interface Chat {
  id: string;
  participants: string[];
  lastMessage?: Message;
  unreadCount: number;
}

export interface MessageSocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  onlineUsers: string[];
  sendMessage: (receiverId: string, content: string, chatId: string) => void;
  joinChat: (chatId: string) => void;
  leaveChat: (chatId: string) => void;
  emitTyping: (receiverId: string, chatId: string) => void;
  emitStopTyping: (receiverId: string, chatId: string) => void;
  markAsRead: (messageIds: string[]) => void;
}
