import useNotificationsFromProvider from "@/hooks/useNotifications";
import { Heart, MessageCircle, UserPlus, Repeat2, AtSign } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";

export default function Activity() {
  const notifications = useNotificationsFromProvider();

  const {
    notifications: notificationList,
    unreadCount,
    isConnected,
  } = notifications;

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "LIKE":
        return <Heart className="size-5 text-red-500" fill="currentColor" />;
      case "COMMENT":
        return <MessageCircle className="size-5 text-blue-500" />;
      case "FOLLOW":
        return <UserPlus className="size-5 text-green-500" />;
      case "REPOST":
        return <Repeat2 className="size-5 text-purple-500" />;
      case "MENTION":
        return <AtSign className="size-5 text-orange-500" />;
      default:
        return <Heart className="size-5 text-gray-500" />;
    }
  };

  const getNotificationMessage = (notif: any) => {
    const actorName = notif.actor.displayName || "Someone";
    switch (notif.type) {
      case "LIKE":
        return `${actorName} liked your post`;
      case "COMMENT":
        return `${actorName} commented on your post`;
      case "FOLLOW":
        return `${actorName} started following you`;
      case "REPOST":
        return `${actorName} reposted your post`;
      case "MENTION":
        return `${actorName} mentioned you in a post`;
      default:
        return notif.message || "New notification";
    }
  };

  // Handle notification click
  const handleNotificationClick = (notif: any) => {
    // Mark as read
    if (!notif.read) {
      notifications.markAsRead(notif.id);
    }

    // Navigate to post if exists
    if (notif.postId) {
      // window.location.href = `/posts/${notif.postId}`;
      console.log("Navigate to post:", notif.postId);
    } else if (notif.type === "FOLLOW") {
      // Navigate to actor profile
      console.log("Navigate to profile:", notif.actorId);
    }
  };

  // Handle mark all as read
  const handleMarkAllRead = () => {
    notifications.markAllRead();
  };

  return (
    <div
      className="
        w-full md:w-1/2 flex-1 md:border border-gray-300
        md:pt-0 pt-[calc(5rem+env(safe-area-inset-top))]
        rounded-none md:rounded-3xl mx-auto
        h-full overflow-y-auto custom-scroll bg-white
      "
    >
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white p-4">
        <div className="flex items-center justify-between">
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="text-sm text-blue-600 hover:underline"
            >
              Mark all as read
            </button>
          )}
        </div>

        {/* Connection status */}
        {!isConnected && (
          <div className="mt-2 text-xs text-red-500 flex items-center gap-1">
            <span className="inline-block w-2 h-2 rounded-full bg-red-500"></span>
            Disconnected
          </div>
        )}
      </div>

      {/* Notifications List */}
      <div className="divide-y divide-gray-200">
        {notificationList.length === 0 ? (
          // Empty state
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
              <Heart className="size-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No notifications yet
            </h3>
            <p className="text-sm text-gray-500 max-w-xs">
              When someone likes, comments, or follows you, you'll see it here.
            </p>
          </div>
        ) : (
          // Notifications
          notificationList.map((notif) => (
            <div
              key={notif.id}
              onClick={() => handleNotificationClick(notif)}
              className={`
                flex items-start gap-3 p-4 cursor-pointer
                hover:bg-gray-50 transition-colors
                ${!notif.isRead ? "bg-blue-50" : "bg-white"}
              `}
            >
              {/* Actor Avatar */}
              <div className="relative flex-shrink-0">
                {notif.actorAvatar ? (
                  <img
                    src={notif.actorAvatar}
                    alt={notif.actorName || "User"}
                    className="w-10 h-10 rounded-full object-cover border border-gray-200"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                    <span className="text-sm font-medium text-gray-600">
                      {notif.actorName?.[0]?.toUpperCase() || "?"}
                    </span>
                  </div>
                )}

                {/* Notification type icon */}
                <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow-sm">
                  {getNotificationIcon(notif.type)}
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-900">
                  {getNotificationMessage(notif)}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {formatDistanceToNow(new Date(notif.createdAt), {
                    addSuffix: true,
                    locale: vi,
                  })}
                </p>
              </div>

              {/* Unread indicator */}
              {!notif.isRead && (
                <div className="flex-shrink-0">
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
