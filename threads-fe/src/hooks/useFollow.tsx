import { useToast } from "@/components/Toast";
import type { Post } from "@/interfaces/post/post.interface";
import { FollowService } from "@/services/follow/follow.service";
import { useMutation, useQueryClient } from "@tanstack/react-query";

function extractErrMsg(err: unknown): string {
  const anyErr = err as any;
  const raw =
    anyErr?.response?.data?.message ||
    anyErr?.message ||
    "Something went wrong.";
  return Array.isArray(raw) ? raw.join(", ") : String(raw);
}

interface ToggleFollowResponse {
  isFollowing: boolean;
  followerId: string;
  followingId: string;
  followersCount: number;
  followingCount: number;
  followId?: string;
}

export function useFollow(currentUserId?: string) {
  const qc = useQueryClient();
  const toast = useToast();

  const toggleFollow = useMutation({
    mutationFn: async ({ followingId }: { followingId: string }) => {
      const res = await FollowService.toggleFollow(followingId);
      return res.data as ToggleFollowResponse;
    },
    onMutate: async ({ followingId }) => {
      if (!currentUserId) return;

      await qc.cancelQueries({ queryKey: ["newsfeed"] });

      const previousNewsfeed = qc.getQueryData(["newsfeed"]);

      qc.setQueryData(["newsfeed"], (old: any) => {
        return old?.map((post: Post) => {
          if (post.author.id === followingId) {
            const isCurrentlyFollowing =
              post.author.following?.some(
                (f: any) => f.followerId === currentUserId
              ) ?? false;

            let newFollowing;
            if (isCurrentlyFollowing) {
              newFollowing =
                post.author.following?.filter(
                  (f: any) => f.followerId !== currentUserId
                ) ?? [];
            } else {
              newFollowing = [
                ...(post.author.following || []),
                {
                  id: `temp-${Date.now()}`,
                  followerId: currentUserId,
                  followingId: followingId,
                  createdAt: new Date().toISOString(),
                },
              ];
            }

            return {
              ...post,
              author: {
                ...post.author,
                following: newFollowing,
                followersCount: isCurrentlyFollowing
                  ? Math.max(0, post.author.followersCount - 1)
                  : post.author.followersCount + 1,
              },
            };
          }
          return post;
        });
      });

      return { previousNewsfeed };
    },
    // Rollback on error
    onError: (err, _variables, context) => {
      if (context?.previousNewsfeed) {
        qc.setQueryData(["newsfeed"], context.previousNewsfeed);
      }
      toast.error(extractErrMsg(err));
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["newsfeed"] });
      await qc.invalidateQueries({ queryKey: ["suggestions"] });
      await qc.invalidateQueries({ queryKey: ["following"] });
      await qc.invalidateQueries({ queryKey: ["profile"] });
    },
  });

  return {
    toggleFollow,
  };
}
