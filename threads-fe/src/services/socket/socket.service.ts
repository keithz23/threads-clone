import { io } from "socket.io-client";
import type { Socket, ManagerOptions, SocketOptions } from "socket.io-client";
import { SOCKET_CONFIG } from "./socket.config";

type NS = "MESSAGES" | "NOTIFICATIONS" | "REALTIME";

class SocketService {
  private sockets: Partial<Record<NS, Socket>> = {};
  private getToken?: () => Promise<string | null>;

  setTokenProvider(fn: () => Promise<string | null>) {
    this.getToken = fn;
  }

  private ensureSocket(ns: NS, userId: string, token?: string): Socket {
    const existing = this.sockets[ns];
    if (existing?.connected) {
      return existing;
    }

    const config = SOCKET_CONFIG[ns];
    if (!config) {
      console.error(`[${ns}] SOCKET_CONFIG missing for namespace`);
      return null as any;
    }

    const { url, namespace, options } = config;

    if (!url || !namespace) {
      console.error(`[${ns}] Invalid config:`, { url, namespace });
      return null as any;
    }

    const base: Partial<ManagerOptions & SocketOptions> = {
      ...(options || {}),
      transports: ["websocket", "polling"],
      autoConnect: true,
      withCredentials: true,
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 500,
      reconnectionDelayMax: 5000,
      auth: token ? { token } : undefined,
      query: { userId },
    };

    const fullUrl = `${url}${namespace}`;

    const sock = io(fullUrl, base);
    this.wireCommonListeners(sock, ns);
    this.sockets[ns] = sock;

    return sock;
  }

  private wireCommonListeners(socket: Socket, ns: NS) {
    socket.on("connect_error", async (err: any) => {
      console.error(`[${ns}] Connect error:`, err?.message || err);

      if (
        this.getToken &&
        (err?.message?.includes("Unauthorized") || err?.status === 401)
      ) {
        try {
          const newToken = await this.getToken();
          if (newToken) {
            (socket.io.opts as any).auth = {
              ...(socket.io.opts as any).auth,
              token: newToken,
            };
            if (!socket.connected) {
              console.log(`[${ns}] Reconnecting with new token...`);
              socket.connect();
            }
          }
        } catch (e) {
          console.warn(`[${ns}] Token refresh failed`, e);
        }
      }
    });

    socket.io.on("reconnect_attempt", async () => {
      if (this.getToken) {
        const newToken = await this.getToken();
        if (newToken) {
          (socket.io.opts as any).auth = {
            ...(socket.io.opts as any).auth,
            token: newToken,
          };
        }
      }
    });
  }

  // ===== Specific inits =====
  initMessageSocket(userId: string, token?: string): Socket {
    return this.ensureSocket("MESSAGES", userId, token);
  }

  initNotificationSocket(userId: string, token?: string): Socket {
    return this.ensureSocket("NOTIFICATIONS", userId, token);
  }

  initRealtimeSocket(
    userId: string,
    token?: string,
    ctx?: Record<string, string>
  ): Socket {
    const s = this.ensureSocket("REALTIME", userId, token);

    if (ctx) {
      s.io.opts.query = { ...(s.io.opts.query as any), ...ctx };

      if (s.connected) {
        s.emit("room:join", ctx);
      } else {
        s.once("connect", () => {
          s.emit("room:join", ctx);
        });
      }
    }

    return s;
  }

  // ===== Room helpers =====
  joinRoom(ns: NS, room: string) {
    const s = this.sockets[ns];
    if (s?.connected) {
      s.emit("room:join", { room });
    } else {
      console.warn(`[${ns}] Cannot join room, socket not connected`);
    }
  }

  leaveRoom(ns: NS, room: string) {
    const s = this.sockets[ns];
    if (s?.connected) {
      console.log(`[${ns}] Leaving room:`, room);
      s.emit("room:leave", { room });
    }
  }

  // ===== Getters =====
  getMessageSocket(): Socket | null {
    return this.sockets.MESSAGES ?? null;
  }

  getNotificationSocket(): Socket | null {
    return this.sockets.NOTIFICATIONS ?? null;
  }

  getRealtimeSocket(): Socket | null {
    return this.sockets.REALTIME ?? null;
  }

  // ===== Disconnect =====
  disconnect(ns: NS) {
    const s = this.sockets[ns];
    if (s) {
      s.disconnect();
      delete this.sockets[ns];
    }
  }

  disconnectAll() {
    (Object.keys(this.sockets) as NS[]).forEach((ns) => this.disconnect(ns));
  }
}

export default new SocketService();
