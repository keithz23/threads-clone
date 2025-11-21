import { useFollow } from "@/hooks/useFollow";
import { useLikePost, useRepost } from "@/hooks/useNewsfeed";
import type { Post } from "@/interfaces/post/post.interface";
import { formatDistanceToNow } from "date-fns";
import { useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "../ui/hover-card";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import { Carousel, CarouselContent, CarouselItem } from "../ui/carousel";
import { cn } from "@/lib/utils";
import {
  BadgeCheckIcon,
  Bookmark,
  Heart,
  MessageCircle,
  Repeat,
  Send,
} from "lucide-react";
import { Button } from "../ui/button";
import { enUS } from "date-fns/locale";
import type { Group } from "@/interfaces/profile/profile.interface";
import PostDropdown from "./PostDropdown";
import ReadMore from "../Readmore";
import { useAuth } from "@/hooks/useAuth";
import { Badge } from "../ui/badge";

interface PostCardProps {
  post: Post;
  groups: Group[];
}

export default function PostCard({ post, groups }: PostCardProps) {
  const navigate = useNavigate();
  const likeMutation = useLikePost();
  const repostMutation = useRepost();
  const { user: me } = useAuth();
  const currentUserId = me?.data?.id;

  const { toggleFollow } = useFollow(currentUserId);

  const isFollowing = useMemo(
    () =>
      post.author.following?.some((f) => f.followerId === currentUserId) ??
      false,
    [post.author.following, currentUserId]
  );

  const followersCount = useMemo(
    () => post.author.followersCount || 0,
    [post.author.followersCount]
  );

  const handleLike = useCallback(() => {
    likeMutation.mutate(post.id);
  }, [likeMutation, post.id]);

  const handleRepost = useCallback(() => {
    repostMutation.mutate(post.id);
  }, [repostMutation, post.id]);

  const handleNavigate = useCallback(() => {
    navigate(`@${post.author.username}`);
  }, [navigate, post.author.username]);

  const handleToggleFollow = useCallback(() => {
    toggleFollow.mutate({ followingId: post.author.id });
  }, [toggleFollow, post.author.id]);

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

  return (
    <div className="p-5 gap-x-3 border-b border-gray-200 w-full hover:bg-gray-50/50 transition-colors">
      {/* Pinned Badge */}
      {post.isPinned && (
        <div className="flex items-center gap-2 text-gray-500 text-sm mb-2 ml-12">
          Pinned post
        </div>
      )}

      <div className="flex items-start justify-between">
        <div className="flex items-start gap-x-3 flex-1">
          {/* Avatar */}
          <Avatar className="h-10 w-10 md:h-12 md:w-12">
            <AvatarImage
              src={post.author.avatarUrl}
              alt={post.author.username}
            />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            {/* User Info */}
            <div className="flex items-center gap-x-2 flex-wrap">
              <HoverCard openDelay={200} closeDelay={100}>
                <HoverCardTrigger asChild>
                  <span
                    className="font-semibold text-sm hover:underline cursor-pointer"
                    onClick={handleNavigate}
                  >
                    {displayName}
                  </span>
                </HoverCardTrigger>

                <HoverCardContent
                  className="w-80 p-0"
                  side="bottom"
                  align="start"
                >
                  <div className="p-4 space-y-3">
                    <div
                      className="flex items-start gap-3 cursor-pointer"
                      onClick={handleNavigate}
                    >
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-base leading-tight">
                          {post.author.displayName}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          @{post.author.username}
                        </p>
                      </div>
                      <Avatar className="h-16 w-16">
                        <AvatarImage
                          src={post.author.avatarUrl}
                          alt={post.author.displayName}
                        />
                        <AvatarFallback className="text-lg">
                          {post.author.displayName?.charAt(0) || "A"}
                        </AvatarFallback>
                      </Avatar>
                    </div>

                    {/* Bio */}
                    {post.author.bio && (
                      <p className="text-sm leading-relaxed">
                        {post.author.bio}
                      </p>
                    )}

                    <div className="flex gap-3 text-sm">
                      <div>
                        <span className="font-semibold">
                          {followersCount.toLocaleString()}
                        </span>
                        <span className="text-muted-foreground ml-1">
                          followers
                        </span>
                      </div>
                    </div>

                    <Button
                      onClick={handleToggleFollow}
                      variant={isFollowing ? "outline" : "default"}
                      className="w-full cursor-pointer"
                      disabled={toggleFollow.isPending}
                    >
                      {toggleFollow.isPending ? (
                        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      ) : isFollowing ? (
                        "Following"
                      ) : (
                        "Follow"
                      )}
                    </Button>
                  </div>
                </HoverCardContent>
              </HoverCard>

              {post.author.verified && (
                <Badge
                  variant="secondary"
                  className="bg-blue-500 text-white dark:bg-blue-600 p-0.5"
                >
                  <BadgeCheckIcon />
                </Badge>
              )}

              <span className="text-gray-500 text-sm">
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
              <ReadMore lines={3}>{post.content}</ReadMore>

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
                <button className="cursor-pointer group flex items-center gap-x-1.5 rounded-full transition-all duration-200 px-3 py-2 hover:bg-blue-50 active:scale-95">
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
                      : "hover:bg-green-50"
                  )}
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
                      : "hover:bg-pink-50"
                  )}
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
                <button
                  className={cn(
                    "cursor-pointer group rounded-full transition-all duration-200 p-2 active:scale-95",
                    post.isBookmarked
                      ? "bg-blue-50 hover:bg-blue-100"
                      : "hover:bg-blue-50"
                  )}
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
                </button>

                {/* Share */}
                <button className="cursor-pointer group rounded-full transition-all duration-200 p-2 hover:bg-blue-50 active:scale-95">
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
        <PostDropdown groups={groups} />
      </div>
    </div>
  );
}
