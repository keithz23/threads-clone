import type { TabProps } from "@/constants/item/profileMenu";
import { useConfirmDialog } from "@/hooks/useConfirmDialog";
import { useDeletePost } from "@/hooks/usePostActions";
import type { Group } from "@/interfaces/profile/profile.interface";
import {
  Bookmark,
  ChevronRight,
  HeartOff,
  Link,
  Pin,
  Trash,
} from "lucide-react";
import { useCallback } from "react";
import { useInView } from "react-intersection-observer";
import PostSkeleton from "../posts/PostSkeleton";
import type { Post } from "@/interfaces/post/post.interface";
import PostProfileCard from "../posts/PostProfileCard";

export default function Media({
  posts,
  fetchNextPage,
  hasNextPage,
  isFetchingNextPage,
  isLoading,
}: TabProps) {
  const { delete: deletePost } = useDeletePost();
  const { confirm, ConfirmDialog } = useConfirmDialog();

  const { ref } = useInView({
    onChange: (inView) => {
      if (inView && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    },
    threshold: 0.5,
  });

  const handleAction = useCallback(
    async (postId: string, actionId: string) => {
      switch (actionId) {
        case "delete":
          const isConfirmed = await confirm({
            title: "Delete post?",
            description:
              "This action cannot be undone. Your post will be permanently deleted.",
            confirmText: "Delete",
            cancelText: "Cancel",
            variant: "destructive",
          });

          if (!isConfirmed) return;
          await deletePost(postId);
          break;
      }
    },
    [deletePost, confirm]
  );

  const groups: Group[] = [
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
        { id: "reply_opts", label: "Reply options", icon: <ChevronRight /> },
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
      <div className="flex flex-col gap-4">
        {[...Array(5)].map((_, index) => (
          <PostSkeleton key={index} />
        ))}
      </div>
    );
  }

  if (!posts || posts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-gray-500">
        <p>No posts yet</p>
      </div>
    );
  }

  return (
    <>
      <ConfirmDialog />
      <div className="flex flex-col">
        {/* Posts */}
        {posts.map((post: Post) => (
          <PostProfileCard
            key={post.id}
            post={post}
            groups={groups}
            onAction={handleAction}
          />
        ))}

        {/* Infinite Scroll Trigger */}
        {hasNextPage && (
          <div ref={ref} className="py-4 text-center">
            {isFetchingNextPage ? (
              <div className="text-gray-500">Loading more...</div>
            ) : (
              <div className="text-gray-400">Scroll to load more</div>
            )}
          </div>
        )}

        {/* End of Feed */}
        {!hasNextPage && posts.length > 0 && (
          <div className="py-8 text-center text-gray-400">
            You've reached the end
          </div>
        )}
      </div>
    </>
  );
}
