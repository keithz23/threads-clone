const URL = import.meta.env.DEV
  ? import.meta.env.VITE_BACKEND_LOCAL
  : import.meta.env.VITE_BACKEND_PROD;

export const SOCKET_CONFIG = {
  MESSAGES: {
    url: URL,
    namespace: "/messages",
    options: {
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
      autoConnect: false,
    },
  },
  NOTIFICATIONS: {
    url: URL,
    namespace: "/notifications",
    options: {
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
      autoConnect: false,
    },
  },
  REALTIME: {
    url: URL,
    namespace: "/rt",
    options: {
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
      autoConnect: false,
    },
  },
};

export const MESSAGE_EVENTS = {
  JOIN_CONVERSATION: "conversation:join",
  LEAVE_CONVERSATION: "conversation:leave",
  SEND_MESSAGE: "message:send",
  UPDATE_MESSAGE: "message:update",
  DELETE_MESSAGE: "message:delete",
  TYPING: "message:typing",
  MARK_AS_READ: "message:read",

  NEW_MESSAGE: "message:new",
  MESSAGE_UPDATED: "message:updated",
  MESSAGE_DELETED: "message:deleted",
  MESSAGE_READ: "message:read:ack",
  ONLINE_USERS: "users:online",
  ERROR: "error",
} as const;

export const NOTIFICATION_EVENTS = {
  // Emit
  GET_NOTIFICATIONS: "get-notifications",
  MARK_READ: "mark-notification-read",
  MARK_ALL_READ: "mark-all-read",

  // Listen
  NEW_NOTIFICATION: "new-notification",
  UNREAD_COUNT: "unread-count",
} as const;
