import { useInView } from "react-intersection-observer";
import type { Post } from "@/interfaces/post/post.interface";
import PostSkeleton from "@/components/posts/PostSkeleton";
import PostCard from "@/components/posts/PostCard";
import { useNewsfeed } from "@/hooks/useNewsfeed";
import {
  Bookmark,
  EyeOff,
  Link,
  MessageSquareWarning,
  UserMinus,
  UserRoundX,
  UserX,
} from "lucide-react";

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

  const groups = [
    {
      id: "primary",
      items: [
        { id: "save", label: "Save", icon: <Bookmark /> },
        { id: "not_interested", label: "Not interested", icon: <EyeOff /> },
      ],
    },
    {
      id: "secondary",
      items: [
        { id: "mute", label: "Mute", icon: <UserMinus /> },
        { id: "restrict", label: "Restrict", icon: <UserX /> },
        {
          id: "block",
          label: "Block",
          icon: <UserRoundX className="text-red-500" />,
          dangerous: true,
        },
        {
          id: "report",
          label: "Report",
          icon: <MessageSquareWarning className="text-red-500" />,
          dangerous: true,
        },
      ],
    },
    {
      id: "third",
      items: [{ id: "copy", label: "Copy link", icon: <Link /> }],
    },
  ];

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
        <PostCard groups={groups} key={post.id} post={post} />
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
