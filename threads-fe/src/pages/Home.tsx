import { Skeleton } from "@/components/ui/skeleton";
import { useInView } from "react-intersection-observer";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import {
  Ellipsis,
  Heart,
  MessageCircle,
  Repeat,
  Send,
  Bookmark,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { enUS } from "date-fns/locale";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useLikePost, useNewsfeed, useRepost } from "@/hooks/useNewsfeed";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface Post {
  id: string;
  content: string;
  createdAt: string;
  isPinned: boolean;
  stats: {
    replies: number;
    likes: number;
    reposts: number;
    bookmarks: number;
    views: number;
  };
  author: {
    id: string;
    username: string;
    bio: string;
    displayName: string;
    avatarUrl: string;
    verified: boolean;
    followersCount: number;
    following: {
      id: string;
      followerId: string;
      followingId: string;
    };
  };
  media: Array<{
    id: string;
    mediaUrl: string;
    type: string;
  }>;
  isLiked?: boolean;
  isReposted?: boolean;
  isBookmarked?: boolean;
}

// ============================================
// POST SKELETON COMPONENT
// ============================================
function PostSkeleton() {
  return (
    <div className="flex p-5 gap-x-3 border-b border-gray-200 w-full">
      <div className="flex-shrink-0">
        <Skeleton className="h-10 w-10 rounded-full" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="space-y-2 px-2">
          <Skeleton className="h-4 w-32" />
          <div className="space-y-2">
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-3/4" />
          </div>
          <div className="flex gap-x-5 pt-2">
            {[...Array(4)].map((_, btnIndex) => (
              <Skeleton key={btnIndex} className="h-8 w-12 rounded-full" />
            ))}
          </div>
        </div>
      </div>
      <div className="flex-shrink-0">
        <Skeleton className="h-8 w-8 rounded-full" />
      </div>
    </div>
  );
}

// ============================================
// POST CARD COMPONENT
// ============================================
function PostCard({ post }: { post: Post }) {
  const initials = (name: string) =>
    name.trim().slice(0, 2).toUpperCase() || "??";
  const [isFollowing, setIsFollowing] = useState(false);
  const navigate = useNavigate();
  const likeMutation = useLikePost();
  const repostMutation = useRepost();
  // const bookmarkMutation = useBookmark();

  const handleLike = () => {
    likeMutation.mutate(post.id);
  };

  const handleRepost = () => {
    repostMutation.mutate(post.id);
  };

  const handleNavigate = () => {
    navigate(`@${post.author.username}`);
  };

  // const handleBookmark = () => {
  //   bookmarkMutation.mutate(post.id);
  // };
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
              src={
                post.author.avatarUrl ||
                `https://ui-avatars.com/api/?name=${post.author.username}&background=random`
              }
              alt={post.author?.username || "User avatar"}
            />
            <AvatarFallback>{initials(post.author.username)}</AvatarFallback>
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
                    {post.author.displayName ||
                      post.author?.username ||
                      "Anonymous"}
                  </span>
                </HoverCardTrigger>

                <HoverCardContent
                  className="w-80 p-0"
                  side="bottom"
                  align="start"
                >
                  <div className="p-4 space-y-3">
                    <div className="flex items-start gap-3">
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
                          {post.author.followersCount.toLocaleString()}
                        </span>
                        <span className="text-muted-foreground ml-1">
                          followers
                        </span>
                      </div>
                    </div>

                    <Button
                      // onClick={handleFollowToggle}
                      // variant={isFollowing ? "outline" : "default"}
                      className="w-full cursor-pointer"
                    >
                      {/* {isFollowing ? "Following" : "Follow"} */}
                      Follow
                    </Button>
                  </div>
                </HoverCardContent>
              </HoverCard>

              {post.author.verified && <span className="text-blue-500">✓</span>}

              <span className="text-gray-500 text-sm">
                @{post.author?.username}
              </span>

              <span className="text-gray-400">·</span>

              <Tooltip>
                <TooltipTrigger asChild>
                  <span
                    className="text-gray-500 text-sm cursor-pointer hover:underline"
                    suppressHydrationWarning
                  >
                    {formatDistanceToNow(new Date(post.createdAt), {
                      addSuffix: false,
                      locale: enUS,
                    }).replace(/^about\s/, "")}
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  <p suppressHydrationWarning>
                    {new Date(post.createdAt).toLocaleString("en-US", {
                      weekday: "short",
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </TooltipContent>
              </Tooltip>
            </div>

            {/* Content */}
            <div className="mt-2 space-y-3">
              <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                {post.content}
              </p>

              {/* Media Carousel */}
              {post.media && post.media.length > 0 && (
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
                  // onClick={handleBookmark}
                  // disabled={bookmarkMutation.isPending}
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
        <button className="cursor-pointer group rounded-full transition-all duration-200 p-2 hover:bg-gray-100 active:scale-95 flex-shrink-0">
          <Ellipsis
            size={18}
            className="text-gray-500 group-hover:text-gray-900 transition-colors"
          />
        </button>
      </div>
    </div>
  );
}

// ============================================
// MAIN NEWSFEED COMPONENT
// ============================================
export default function Home() {
  const {
    posts,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    error,
  } = useNewsfeed("all", 20);

  const { ref } = useInView({
    onChange: (inView) => {
      if (inView && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    },
    threshold: 0.5,
  });

  // Loading state
  if (isLoading) {
    return (
      <div className="w-full md:w-1/2 flex-1 md:border border-gray-300 md:pt-0 pt-[calc(5rem+env(safe-area-inset-top))] rounded-none md:rounded-3xl mx-auto h-full overflow-y-auto custom-scroll">
        <div className="space-y-0">
          {[...Array(5)].map((_, index) => (
            <PostSkeleton key={index} />
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="w-full md:w-1/2 flex-1 md:border border-gray-300 md:pt-0 pt-[calc(5rem+env(safe-area-inset-top))] rounded-none md:rounded-3xl mx-auto h-full overflow-y-auto custom-scroll">
        <div className="flex flex-col items-center justify-center p-10 gap-4">
          <p className="text-red-500 text-lg font-semibold">
            Error loading posts
          </p>
          <p className="text-gray-500 text-sm">
            {error?.message || "Something went wrong"}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Empty state
  if (!posts || posts.length === 0) {
    return (
      <div className="w-full md:w-1/2 flex-1 md:border border-gray-300 md:pt-0 pt-[calc(5rem+env(safe-area-inset-top))] rounded-none md:rounded-3xl mx-auto h-full overflow-y-auto custom-scroll">
        <div className="flex flex-col items-center justify-center p-10 gap-2">
          <p className="text-gray-700 text-lg font-semibold">No posts yet</p>
          <p className="text-gray-500 text-sm">
            Follow some users to see their posts
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full md:w-1/2 flex-1 md:border border-gray-300 md:pt-0 pt-[calc(5rem+env(safe-area-inset-top))] rounded-none md:rounded-3xl mx-auto h-full overflow-y-auto custom-scroll">
      {/* Posts */}
      {posts.map((post: Post) => (
        <PostCard key={post.id} post={post} />
      ))}

      {/* Infinite Scroll Trigger */}
      {hasNextPage && (
        <div ref={ref} className="py-8 flex justify-center">
          {isFetchingNextPage ? (
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 border-3 border-blue-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-gray-500 text-sm">Loading more...</span>
            </div>
          ) : (
            <span className="text-gray-400 text-sm">Scroll to load more</span>
          )}
        </div>
      )}

      {/* End of Feed */}
      {!hasNextPage && posts.length > 0 && (
        <div className="py-8 text-center text-gray-500 text-sm border-t border-gray-200">
          You've reached the end
        </div>
      )}
    </div>
  );
}
