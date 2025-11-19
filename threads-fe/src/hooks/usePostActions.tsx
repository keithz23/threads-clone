import { useToast } from "@/components/Toast";
import { PostService } from "@/services/post/post.service";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useDeletePost() {
  const queryClient = useQueryClient();
  const toast = useToast();

  const deleteMutation = useMutation({
    mutationFn: (postId: string) => PostService.deletePost(postId),
    onMutate: async (postId) => {
      await queryClient.cancelQueries({ queryKey: ["newsfeed"] });
      const previousData = queryClient.getQueryData(["newsfeed"]);

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

      return { previousData };
    },
    onError: (error, _postId, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(["newsfeed"], context.previousData);
      }
      toast.error("Failed to delete post permanently");
      console.error("Delete error:", error);
    },
    onSuccess: () => {
      toast.success("Post deleted");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["newsfeed"] });
    },
  });

  return {
    delete: deleteMutation.mutate,
    isHardDeleting: deleteMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}
