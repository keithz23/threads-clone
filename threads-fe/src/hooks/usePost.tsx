import { useToast } from "@/components/Toast";
import type { CreatePostDto } from "@/interfaces/post/post.interface";
import { PostService } from "@/services/post/post.service";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

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

    onMutate: async () => {
      // Cancel outgoing refetches
      await qc.cancelQueries({ queryKey: ["posts"] });

      // Snapshot previous value
      const previousPosts = qc.getQueryData<[]>(["posts"]);

      return { previousPosts };
    },

    onSuccess: () => {
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

  const getPostsByUser = useQuery({
    queryKey: ["posts"],
    queryFn: async () => {
      const res = await PostService.getPostsByUser();
      return res.data;
    },
  });

  return {
    // Query
    postsByUser: getPostsByUser.data || [],
    // Mutations
    createPost,

    // Loading states
    isLoading: getPostsByUser.isLoading,
    isCreating: createPost.isPending,
  };
}
