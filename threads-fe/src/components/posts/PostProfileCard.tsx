import { useLikePost, useRepost } from "@/hooks/useNewsfeed";
import type { Post } from "@/interfaces/post/post.interface";
import { formatDistanceToNow } from "date-fns";
import { useCallback, useMemo } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import { Carousel, CarouselContent, CarouselItem } from "../ui/carousel";
import { cn } from "@/lib/utils";
import {
  Bookmark,
  Ellipsis,
  Heart,
  MessageCircle,
  Repeat,
  Send,
} from "lucide-react";
import { enUS } from "date-fns/locale";
import { useNavigate } from "react-router-dom";

export default function PostProfileCard({ post }: { post: Post }) {
  const navigate = useNavigate();
  const likeMutation = useLikePost();
  const repostMutation = useRepost();
  //   const bookmarkMutation = useBookmark();

  // Memoize callbacks
  const handleLike = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      likeMutation.mutate(post.id);
    },
    [likeMutation, post.id]
  );

  const handleRepost = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      repostMutation.mutate(post.id);
    },
    [repostMutation, post.id]
  );

  //   const handleBookmark = useCallback(
  //     (e: React.MouseEvent) => {
  //       e.stopPropagation();
  //       bookmarkMutation.mutate(post.id);
  //     },
  //     [bookmarkMutation, post.id]
  //   );

  const handleReply = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      navigate(`/post/${post.id}`);
    },
    [navigate, post.id]
  );

  const handleShare = useCallback(
    async (e: React.MouseEvent) => {
      e.stopPropagation();
      const url = `${window.location.origin}/post/${post.id}`;

      try {
        await navigator.clipboard.writeText(url);
        // toast.success('Link copied to clipboard'); // Uncomment if using toast
      } catch (err) {
        console.error("Failed to copy:", err);
      }
    },
    [post.id]
  );

  const handlePostClick = useCallback(() => {
    navigate(`/post/${post.id}`);
  }, [navigate, post.id]);

  const handleProfileClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      navigate(`/profile/${post.author.username}`);
    },
    [navigate, post.author.username]
  );

  const initials = useMemo(
    () => post.author.username.trim().slice(0, 2).toUpperCase() || "??",
    [post.author.username]
  );

  const displayName = useMemo(
    () => post.author.displayName || post.author.username || "Anonymous",
    [post.author.displayName, post.author.username]
  );

  const formattedDate = useMemo(
    () =>
      formatDistanceToNow(new Date(post.createdAt), {
        addSuffix: false,
        locale: enUS,
      }).replace(/^about\s/, ""),
    [post.createdAt]
  );

  const fullDate = useMemo(
    () =>
      new Date(post.createdAt).toLocaleString("en-US", {
        weekday: "short",
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
    [post.createdAt]
  );

  const avatarUrl = useMemo(
    () =>
      post.author.avatarUrl ||
      `https://ui-avatars.com/api/?name=${post.author.username}&background=random`,
    [post.author.avatarUrl, post.author.username]
  );

  return (
    <div
      className="gap-x-3 border-b border-gray-200 w-full hover:bg-gray-50/50 transition-colors cursor-pointer p-4"
      onClick={handlePostClick}
    >
      {/* Pinned Badge */}
      {post.isPinned && (
        <div className="flex items-center gap-2 text-gray-500 text-sm mb-2 ml-12">
          📌 Pinned post
        </div>
      )}

      <div className="flex items-start justify-between">
        <div className="flex items-start gap-x-3 flex-1">
          {/* Avatar */}
          <Avatar
            className="h-10 w-10 md:h-12 md:w-12 cursor-pointer flex-shrink-0"
            onClick={handleProfileClick}
          >
            <AvatarImage src={avatarUrl} alt={post.author.username} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            {/* User Info */}
            <div className="flex items-center gap-x-2 flex-wrap">
              <span
                className="font-semibold text-sm hover:underline cursor-pointer"
                onClick={handleProfileClick}
              >
                {displayName}
              </span>

              {post.author.verified && (
                <span className="text-blue-500" title="Verified">
                  ✓
                </span>
              )}

              <span
                className="text-gray-500 text-sm hover:underline cursor-pointer"
                onClick={handleProfileClick}
              >
                @{post.author.username}
              </span>

              <span className="text-gray-400">·</span>

              <Tooltip>
                <TooltipTrigger asChild>
                  <span
                    className="text-gray-500 text-sm cursor-pointer hover:underline"
                    suppressHydrationWarning
                  >
                    {formattedDate}
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  <p suppressHydrationWarning>{fullDate}</p>
                </TooltipContent>
              </Tooltip>
            </div>

            {/* Content */}
            <div className="mt-2 space-y-3">
              <p className="text-sm leading-relaxed whitespace-pre-wrap break-words text-left">
                {post.content}
              </p>

              {/* Media Carousel */}
              {post.media?.length > 0 && (
                <div className="mt-3">
                  <Carousel opts={{ align: "start" }} className="w-full">
                    <CarouselContent>
                      {post.media.map((media) => (
                        <CarouselItem
                          key={media.id}
                          className={cn(
                            post.media.length === 1
                              ? "basis-full"
                              : "basis-4/5 md:basis-1/2"
                          )}
                        >
                          <div className="relative aspect-square rounded-2xl overflow-hidden bg-gray-100">
                            <img
                              src={media.mediaUrl}
                              alt={`Media ${media.id}`}
                              className="w-full h-full object-cover cursor-pointer hover:opacity-95 transition-opacity"
                              onClick={(e) => {
                                e.stopPropagation();
                                // TODO: Open media lightbox
                              }}
                            />
                          </div>
                        </CarouselItem>
                      ))}
                    </CarouselContent>
                  </Carousel>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-2 max-w-md">
                {/* Reply */}
                <button
                  onClick={handleReply}
                  className="cursor-pointer group flex items-center gap-x-1.5 rounded-full transition-all duration-200 px-3 py-2 hover:bg-blue-50 active:scale-95"
                  aria-label="Reply"
                >
                  <MessageCircle
                    size={18}
                    className="text-gray-600 group-hover:text-blue-500 transition-colors"
                  />
                  <span className="text-sm text-gray-600 group-hover:text-blue-500 transition-colors">
                    {post.stats.replies || 0}
                  </span>
                </button>

                {/* Repost */}
                <button
                  onClick={handleRepost}
                  disabled={repostMutation.isPending}
                  className={cn(
                    "cursor-pointer group flex items-center gap-x-1.5 rounded-full transition-all duration-200 px-3 py-2 active:scale-95",
                    post.isReposted
                      ? "bg-green-50 hover:bg-green-100"
                      : "hover:bg-green-50",
                    repostMutation.isPending && "opacity-50 cursor-not-allowed"
                  )}
                  aria-label={post.isReposted ? "Unrepost" : "Repost"}
                >
                  <Repeat
                    size={18}
                    className={cn(
                      "transition-colors",
                      post.isReposted
                        ? "text-green-500"
                        : "text-gray-600 group-hover:text-green-500"
                    )}
                  />
                  <span
                    className={cn(
                      "text-sm transition-colors",
                      post.isReposted
                        ? "text-green-500"
                        : "text-gray-600 group-hover:text-green-500"
                    )}
                  >
                    {post.stats.reposts || 0}
                  </span>
                </button>

                {/* Like */}
                <button
                  onClick={handleLike}
                  disabled={likeMutation.isPending}
                  className={cn(
                    "cursor-pointer group flex items-center gap-x-1.5 rounded-full transition-all duration-200 px-3 py-2 active:scale-95",
                    post.isLiked
                      ? "bg-pink-50 hover:bg-pink-100"
                      : "hover:bg-pink-50",
                    likeMutation.isPending && "opacity-50 cursor-not-allowed"
                  )}
                  aria-label={post.isLiked ? "Unlike" : "Like"}
                >
                  <Heart
                    size={18}
                    className={cn(
                      "transition-colors",
                      post.isLiked
                        ? "text-pink-500 fill-pink-500"
                        : "text-gray-600 group-hover:text-pink-500"
                    )}
                  />
                  <span
                    className={cn(
                      "text-sm transition-colors",
                      post.isLiked
                        ? "text-pink-500"
                        : "text-gray-600 group-hover:text-pink-500"
                    )}
                  >
                    {post.stats.likes || 0}
                  </span>
                </button>

                {/* Bookmark */}
                {/* <button
                  onClick={handleBookmark}
                  disabled={bookmarkMutation.isPending}
                  className={cn(
                    "cursor-pointer group rounded-full transition-all duration-200 p-2 active:scale-95",
                    post.isBookmarked
                      ? "bg-blue-50 hover:bg-blue-100"
                      : "hover:bg-blue-50",
                    bookmarkMutation.isPending &&
                      "opacity-50 cursor-not-allowed"
                  )}
                  aria-label={
                    post.isBookmarked ? "Remove bookmark" : "Bookmark"
                  }
                >
                  <Bookmark
                    size={18}
                    className={cn(
                      "transition-colors",
                      post.isBookmarked
                        ? "text-blue-500 fill-blue-500"
                        : "text-gray-600 group-hover:text-blue-500"
                    )}
                  />
                </button> */}

                {/* Share */}
                <button
                  onClick={handleShare}
                  className="cursor-pointer group rounded-full transition-all duration-200 p-2 hover:bg-blue-50 active:scale-95"
                  aria-label="Share"
                >
                  <Send
                    size={18}
                    className="text-gray-600 group-hover:text-blue-500 transition-colors"
                  />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* More Options */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            // TODO: Open post options menu (edit, delete, report, etc.)
          }}
          className="cursor-pointer group rounded-full transition-all duration-200 p-2 hover:bg-gray-100 active:scale-95 flex-shrink-0"
          aria-label="More options"
        >
          <Ellipsis
            size={18}
            className="text-gray-500 group-hover:text-gray-900 transition-colors"
          />
        </button>
      </div>
    </div>
  );
}
