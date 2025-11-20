import { useToast } from "@/components/Toast";
import { PostService } from "@/services/post/post.service";
import { useMutation, useQueryClient } from "@tanstack/react-query";

type PreviousCache = {
  previousNewsfeed?: unknown;
  previousProfile?: unknown;
};

export function useDeletePost() {
  const queryClient = useQueryClient();
  const toast = useToast();

  const deleteMutation = useMutation({
    mutationFn: (postId: string) => PostService.deletePost(postId),

    onMutate: async (postId: string) => {
      await queryClient.cancelQueries({ queryKey: ["newsfeed"] });
      await queryClient.cancelQueries({ queryKey: ["profile"] });

      const previousNewsfeed = queryClient.getQueryData(["newsfeed"]);
      const previousProfile = queryClient.getQueryData(["profile"]);

      queryClient.setQueriesData({ queryKey: ["newsfeed"] }, (old: any) => {
        if (!old) return old;
        return {
          ...old,
          pages: old.pages.map((page: any) => ({
            ...page,
            data: {
              ...page.data,
              posts: page.data.posts.filter((post: any) => post.id !== postId),
            },
          })),
        };
      });

      return {
        previousNewsfeed,
        previousProfile,
      } as PreviousCache;
    },

    onError: (error, _postId, context: PreviousCache | undefined) => {
      // rollback
      if (context?.previousNewsfeed) {
        queryClient.setQueryData(["newsfeed"], context.previousNewsfeed);
      }
      if (context?.previousProfile) {
        queryClient.setQueryData(["profile"], context.previousProfile);
      }

      toast.error("Failed to delete post permanently");
      console.error("Delete error:", error);
    },

    onSuccess: () => {
      toast.success("Post deleted");
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["newsfeed"] });
      queryClient.invalidateQueries({ queryKey: ["user-posts"] });
    },
  });

  return {
    delete: deleteMutation.mutate,
    deleteAsync: deleteMutation.mutateAsync,
    isHardDeleting: deleteMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}
