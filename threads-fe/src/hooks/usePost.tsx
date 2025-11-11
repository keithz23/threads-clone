import { useToast } from "@/components/Toast";
import type { CreatePostDto } from "@/interfaces/post/post.interface";
import { PostService } from "@/services/post/post.service";
import { useMutation, useQueryClient } from "@tanstack/react-query";

function extractErrMsg(err: unknown): string {
  const anyErr = err as any;
  const raw =
    anyErr?.response?.data?.message ||
    anyErr?.message ||
    "Something went wrong.";
  return Array.isArray(raw) ? raw.join(", ") : String(raw);
}

export function usePost() {
  const qc = useQueryClient();
  const toast = useToast();

  // Create Post
  const createPost = useMutation({
    mutationFn: async ({
      createPostDto,
      images,
    }: {
      createPostDto: CreatePostDto;
      images?: File[];
    }) => {
      const res = await PostService.createPost(createPostDto, images);
      return res.data;
    },

    onMutate: async (variables) => {
      // Cancel outgoing refetches
      await qc.cancelQueries({ queryKey: ["posts"] });

      // Snapshot previous value
      const previousPosts = qc.getQueryData<[]>(["posts"]);

      return { previousPosts };
    },

    onSuccess: (data) => {
      // Invalidate và refetch
      qc.invalidateQueries({ queryKey: ["posts"] });
      qc.invalidateQueries({ queryKey: ["user-posts"] });

      toast.success("Post created successfully!");
    },

    onError: (error: any, variables, context) => {
      // Rollback optimistic update
      if (context?.previousPosts) {
        qc.setQueryData(["posts"], context.previousPosts);
      }

      toast.error(extractErrMsg(error));
    },
  });

  return {
    // Mutations
    createPost,

    // Loading states
    isCreating: createPost.isPending,
  };
}
