import { io, Socket } from "socket.io-client";
import { SOCKET_CONFIG } from "./socket.config";

class SocketService {
  private messageSocket: Socket | null = null;
  private notificationSocket: Socket | null = null;

  // Init Message Socket
  initMessageSocket(userId: string, token?: string): Socket {
    if (this.messageSocket?.connected) {
      return this.messageSocket;
    }

    const { url, namespace, options } = SOCKET_CONFIG.MESSAGES;

    this.messageSocket = io(`${url}${namespace}`, {
      ...options,
      query: { userId },
      auth: token ? { token } : undefined,
    });

    this.setupMessageSocketListeners();

    return this.messageSocket;
  }

  // Init Notification Socket
  initNotificationSocket(userId: string, token?: string): Socket {
    if (this.notificationSocket?.connected) {
      return this.notificationSocket;
    }

    const { url, namespace, options } = SOCKET_CONFIG.NOTIFICATIONS;

    this.notificationSocket = io(`${url}${namespace}`, {
      ...options,
      query: { userId },
      auth: token ? { token } : undefined,
    });

    this.setupNotificationSocketListeners();

    return this.notificationSocket;
  }

  private setupMessageSocketListeners() {
    if (!this.messageSocket) return;

    this.messageSocket.on("connect", () => {
      console.log("Message socket connected:", this.messageSocket?.id);
    });

    this.messageSocket.on("disconnect", (reason) => {
      console.log("Message socket disconnected:", reason);
    });

    this.messageSocket.on("connect_error", (error) => {
      console.error("Message socket error:", error);
    });
  }

  private setupNotificationSocketListeners() {
    if (!this.notificationSocket) return;

    this.notificationSocket.on("connect", () => {
      console.log(
        "Notification socket connected:",
        this.notificationSocket?.id
      );
    });

    this.notificationSocket.on("disconnect", (reason) => {
      console.log("Notification socket disconnected:", reason);
    });

    this.notificationSocket.on("connect_error", (error) => {
      console.error("Notification socket error:", error);
    });
  }

  // Getters
  getMessageSocket(): Socket | null {
    return this.messageSocket;
  }

  getNotificationSocket(): Socket | null {
    return this.notificationSocket;
  }

  // Connect
  connectMessageSocket() {
    this.messageSocket?.connect();
  }

  connectNotificationSocket() {
    this.notificationSocket?.connect();
  }

  // Disconnect
  disconnectMessageSocket() {
    if (this.messageSocket) {
      this.messageSocket.disconnect();
      this.messageSocket = null;
    }
  }

  disconnectNotificationSocket() {
    if (this.notificationSocket) {
      this.notificationSocket.disconnect();
      this.notificationSocket = null;
    }
  }

  disconnectAll() {
    this.disconnectMessageSocket();
    this.disconnectNotificationSocket();
  }
}

export default new SocketService();
