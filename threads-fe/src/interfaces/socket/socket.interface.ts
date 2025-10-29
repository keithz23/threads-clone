import { Socket } from "socket.io-client";

export interface SocketContextType {
  messageSocket: Socket | null;
  notificationSocket: Socket | null;
  isMessageConnected: boolean;
  isNotificationConnected: boolean;
  connectSockets: () => void;
  disconnectSockets: () => void;
}
