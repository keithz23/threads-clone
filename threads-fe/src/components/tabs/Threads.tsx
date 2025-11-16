import type { Post } from "@/interfaces/post/post.interface";
import {
  Bookmark,
  ChevronRight,
  Heart,
  HeartOff,
  Link,
  MessageCircle,
  Pin,
  Repeat,
  Send,
  Trash,
} from "lucide-react";
import { useInView } from "react-intersection-observer";
import PostSkeleton from "../posts/PostSkeleton";
import PostProfileCard from "../posts/PostProfileCard";
import type { TabProps } from "@/constants/item/profileMenu";

export default function Threads(
  {
    posts,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  }: TabProps,
  variant: string
) {
  const { ref } = useInView({
    onChange: (inView) => {
      if (inView && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    },
    threshold: 0.5,
  });
  const post_btn = [
    { id: 1, name: "heart", icon: <Heart size={18} /> },
    { id: 2, name: "message", icon: <MessageCircle size={18} /> },
    { id: 3, name: "repeat", icon: <Repeat size={18} /> },
    { id: 4, name: "send", icon: <Send size={18} /> },
  ];

  const groups = [
    {
      id: "primary",
      items: [
        { id: "save", label: "Save", icon: <Bookmark /> },
        { id: "pin", label: "Pin to profile", icon: <Pin /> },
        {
          id: "hide_counts",
          label: "Hide like and share counts",
          icon: <HeartOff />,
        },
        {
          id: "reply_opts",
          label: "Reply options",
          icon: <ChevronRight />,
        },
      ],
    },
    {
      id: "secondary",
      items: [
        {
          id: "delete",
          label: "Delete",
          icon: <Trash className="text-red-500" />,
          dangerous: true,
        },
        { id: "copy", label: "Copy link", icon: <Link /> },
      ],
    },
  ];
  // Loading state
  if (isLoading) {
    return (
      <div className="w-full rounded-none md:rounded-3xl mx-auto h-full overflow-y-auto custom-scroll">
        <div className="space-y-0">
          {[...Array(5)].map((_, index) => (
            <PostSkeleton key={index} />
          ))}
        </div>
      </div>
    );
  }

  if (!posts || posts.length === 0) {
    return (
      <div className=" rounded-none md:rounded-3xl mx-auto h-full overflow-y-auto custom-scroll">
        <div className="flex flex-col items-center justify-center p-10 gap-2">
          <p className="text-gray-700 text-lg font-semibold">No posts yet</p>
        </div>
      </div>
    );
  }
  return (
    <div className="w-full rounded-none md:rounded-3xl mx-auto h-full overflow-y-auto custom-scroll">
      {/* Posts */}
      {posts.map((post: Post) => (
        <PostProfileCard key={post.id} post={post} />
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
