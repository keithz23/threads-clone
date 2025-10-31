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
      autoConnect: false, // Connect manually
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
};

export const MESSAGE_EVENTS = {
  // Emit
  SEND_MESSAGE: "send-message",
  TYPING: "typing",
  STOP_TYPING: "stop-typing",
  JOIN_CHAT: "join-chat",
  LEAVE_CHAT: "leave-chat",
  MARK_READ: "mark-read",

  // Listen
  RECEIVE_MESSAGE: "receive-message",
  USER_TYPING: "user-typing",
  USER_STOP_TYPING: "user-stop-typing",
  ONLINE_USERS: "online-users",
  MESSAGE_READ: "message-read",
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
