import { useToast } from "@/components/Toast";
import type {
  CreatePostDto,
  PostResponse,
} from "@/interfaces/post/post.interface";
import { PostService } from "@/services/post/post.service";
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

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
      qc.invalidateQueries({ queryKey: ["newsfeed"] });
      qc.invalidateQueries({ queryKey: ["user-posts"] });

      toast.success("Post created successfully!");
    },

    onError: (error: any, _variables, context) => {
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

export function useGetUserPosts(
  username: string,
  filter: "posts" | "replies" | "media" | "reposts",
  limit = 20
) {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    error,
    refetch,
  } = useInfiniteQuery({
    queryKey: ["user-posts", filter],
    queryFn: async ({ pageParam }) => {
      const response = await PostService.getUserPosts(
        username,
        filter,
        limit,
        pageParam
      );
      return response.data as PostResponse;
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => {
      return lastPage.data.pagination.hasMore
        ? lastPage.data.pagination.nextCursor
        : undefined;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
    refetchOnWindowFocus: false,
    refetchOnReconnect: true, // Refetch
    enabled: !!username,
  });

  const posts = data?.pages.flatMap((page) => page.data.posts) ?? [];

  return {
    posts,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    error,
    refetch,
  };
}
