import useNotificationsFromProvider from "@/hooks/useNotifications";
import { Heart, MessageCircle, UserPlus, Repeat2, AtSign } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { enUS, vi } from "date-fns/locale";

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
        return <Heart className="size-4 text-red-500" fill="currentColor" />;
      case "COMMENT":
        return <MessageCircle className="size-4 text-blue-500" />;
      case "FOLLOW":
        return <UserPlus className="size-4 text-green-500" />;
      case "REPOST":
        return <Repeat2 className="size-4 text-purple-500" />;
      case "MENTION":
        return <AtSign className="size-4 text-orange-500" />;
      default:
        return <Heart className="size-4 text-gray-500" />;
    }
  };

  const getNotificationMessage = (notif: any) => {
    switch (notif.type) {
      case "LIKE":
        return `liked your post`;
      case "COMMENT":
        return `commented on your post`;
      case "FOLLOW":
        return `started following you`;
      case "REPOST":
        return `reposted your post`;
      case "MENTION":
        return `mentioned you`;
      default:
        return notif.message || "sent you a notification";
    }
  };

  const handleNotificationClick = (notif: any) => {
    if (!notif.isRead) {
      notifications.markAsRead(notif.id);
    }

    if (notif.postId) {
      console.log("Navigate to post:", notif.postId);
    } else if (notif.type === "FOLLOW") {
      console.log("Navigate to profile:", notif.actorId);
    }
  };

  const handleMarkAllRead = () => {
    notifications.markAllRead();
  };

  return (
    <div className="w-full md:w-1/2 flex-1 md:border border-gray-200 md:pt-0 pt-[calc(4rem+env(safe-area-inset-top))] rounded-none md:rounded-3xl mx-auto h-full overflow-y-auto bg-white">
      {/* Notifications List */}
      <div className="">
        {notificationList.length === 0 ? (
          // Empty state
          <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
            <div className="w-20 h-20 rounded-full bg-gray-50 flex items-center justify-center mb-4 ring-1 ring-gray-100">
              <Heart className="size-10 text-gray-300" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No activity yet
            </h3>
            <p className="text-sm text-gray-500 max-w-sm leading-relaxed">
              When someone likes, comments, or follows you, their activity will
              show up here.
            </p>
          </div>
        ) : (
          // Notifications
          <div className="divide-y divide-gray-100">
            {notificationList.map((notif) => {
              const actorName =
                notif.actor.displayName || notif.actorName || "Someone";

              return (
                <div
                  key={notif.id}
                  onClick={() => handleNotificationClick(notif)}
                  className={`
                    relative flex items-center gap-3 px-6 py-4 cursor-pointer
                    transition-all duration-200
                    hover:bg-gray-50
                    ${!notif.isRead ? "bg-blue-50/30" : "bg-white"}
                  `}
                >
                  {/* Unread indicator bar */}
                  {!notif.isRead && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500"></div>
                  )}

                  {/* Actor Avatar */}
                  <div className="relative flex-shrink-0 mt-0.5">
                    {notif.actorAvatar ? (
                      <img
                        src={notif.actorAvatar}
                        alt={actorName}
                        className="w-11 h-11 rounded-full object-cover ring-2 ring-white"
                      />
                    ) : (
                      <div className="w-11 h-11 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center ring-2 ring-white">
                        <span className="text-base font-semibold text-gray-600">
                          {actorName[0]?.toUpperCase() || "?"}
                        </span>
                      </div>
                    )}

                    {/* Notification type icon badge */}
                    <div className="absolute -bottom-0.5 -right-0.5 bg-white rounded-full p-1 shadow-sm ring-2 ring-white">
                      {getNotificationIcon(notif.type)}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0 pt-0.5">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm text-gray-900 leading-snug">
                        <span className="font-semibold">{actorName}</span>{" "}
                        <span className="text-gray-600">
                          {getNotificationMessage(notif)}
                        </span>
                      </p>

                      <span className="text-xs text-gray-400 whitespace-nowrap flex-shrink-0">
                        {formatDistanceToNow(new Date(notif.createdAt), {
                          addSuffix: false,
                          locale: enUS,
                        }).replace("khoảng ", "")}
                      </span>
                    </div>

                    {/* {notif.postContent && (
                      <div className="mt-2 text-sm text-gray-500 line-clamp-2 bg-gray-50 rounded-lg px-3 py-2 border border-gray-100">
                        {notif.postContent}
                      </div>
                    )} */}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Load more indicator */}
      {notificationList.length > 0 && (
        <div className="py-8 text-center">
          <p className="text-sm text-gray-400">You're all caught up!</p>
        </div>
      )}
    </div>
  );
}
