import { PostService } from "@/services/post/post.service";
import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { useToast } from "@/components/Toast";

// ============================================
// TYPES
// ============================================

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
    displayName: string;
    bio: string;
    avatarUrl: string;
    verified: boolean;
    followersCount: number;
    following: {
      id: string;
      followerId: string;
      followingId: string;
    } | null;
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

interface NewsfeedResponse {
  success: boolean;
  data: {
    posts: Post[];
    pagination: {
      hasMore: boolean;
      nextCursor: string | null;
    };
  };
}

// ============================================
// MAIN HOOK - INFINITE SCROLL
// ============================================

export function useNewsfeed(
  filter: "all" | "following" | "trending" = "all",
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
    queryKey: ["newsfeed", filter],
    queryFn: async ({ pageParam }) => {
      const response = await PostService.getNewsFeedPost(
        filter,
        limit,
        pageParam
      );
      return response.data as NewsfeedResponse;
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

// ============================================
// LIKE MUTATION
// ============================================

export function useLikePost() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: async (postId: string) => {
      return await PostService.toggleLike(postId);
    },
    onMutate: async (postId) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["newsfeed"] });

      // Snapshot previous value
      const previousData = queryClient.getQueriesData({
        queryKey: ["newsfeed"],
      });

      queryClient.setQueriesData<{
        pages: NewsfeedResponse[];
        pageParams: (string | undefined)[];
      }>({ queryKey: ["newsfeed"] }, (old) => {
        if (!old) return old;

        return {
          ...old,
          pages: old.pages.map((page) => ({
            ...page,
            data: {
              ...page.data,
              posts: page.data.posts.map((post) =>
                post.id === postId
                  ? {
                      ...post,
                      isLiked: !post.isLiked,
                      stats: {
                        ...post.stats,
                        likes: post.stats.likes + (post.isLiked ? -1 : 1),
                      },
                    }
                  : post
              ),
            },
          })),
        };
      });

      return { previousData };
    },
    onError: (error, _postId, context) => {
      // Rollback on error
      if (context?.previousData) {
        context.previousData.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }

      // Show error toast
      const errorMsg =
        (error as any)?.response?.data?.message || "Failed to like post";
      toast.error(errorMsg);
    },
    onSettled: () => {
      setTimeout(() => {
        queryClient.invalidateQueries({
          queryKey: ["newsfeed"],
          refetchType: "none",
        });
      }, 1000);
    },
  });
}

// ============================================
// REPOST MUTATION
// ============================================

export function useRepost() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: async (postId: string) => {
      return await PostService.toggleRepost(postId);
    },
    onMutate: async (postId) => {
      await queryClient.cancelQueries({ queryKey: ["newsfeed"] });

      const previousData = queryClient.getQueriesData({
        queryKey: ["newsfeed"],
      });

      queryClient.setQueriesData<{
        pages: NewsfeedResponse[];
        pageParams: (string | undefined)[];
      }>({ queryKey: ["newsfeed"] }, (old) => {
        if (!old) return old;

        return {
          ...old,
          pages: old.pages.map((page) => ({
            ...page,
            data: {
              ...page.data,
              posts: page.data.posts.map((post) =>
                post.id === postId
                  ? {
                      ...post,
                      isReposted: !post.isReposted,
                      stats: {
                        ...post.stats,
                        reposts:
                          post.stats.reposts + (post.isReposted ? -1 : 1),
                      },
                    }
                  : post
              ),
            },
          })),
        };
      });

      return { previousData };
    },
    onError: (error, _postId, context) => {
      if (context?.previousData) {
        context.previousData.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }

      const errorMsg =
        (error as any)?.response?.data?.message || "Failed to repost";
      toast.error(errorMsg);
    },

    onSettled: () => {
      setTimeout(() => {
        queryClient.invalidateQueries({
          queryKey: ["newsfeed"],
          refetchType: "none",
        });
      }, 1000);
    },
  });
}

// ============================================
// BOOKMARK MUTATION
// ============================================

// export function useBookmark() {
//   const queryClient = useQueryClient();
//   const toast = useToast();

//   return useMutation({
//     mutationFn: async (postId: string) => {
//       return await PostService.toggleBookmark(postId);
//     },
//     onMutate: async (postId) => {
//       await queryClient.cancelQueries({ queryKey: ["newsfeed"] });

//       const previousData = queryClient.getQueriesData({
//         queryKey: ["newsfeed"],
//       });

//       queryClient.setQueriesData<{
//         pages: NewsfeedResponse[];
//         pageParams: (string | undefined)[];
//       }>({ queryKey: ["newsfeed"] }, (old) => {
//         if (!old) return old;

//         return {
//           ...old,
//           pages: old.pages.map((page) => ({
//             ...page,
//             data: {
//               ...page.data,
//               posts: page.data.posts.map((post) =>
//                 post.id === postId
//                   ? {
//                       ...post,
//                       isBookmarked: !post.isBookmarked,
//                       stats: {
//                         ...post.stats,
//                         bookmarks:
//                           post.stats.bookmarks + (post.isBookmarked ? -1 : 1),
//                       },
//                     }
//                   : post
//               ),
//             },
//           })),
//         };
//       });

//       return { previousData };
//     },
//     onError: (error, _postId, context) => {
//       if (context?.previousData) {
//         context.previousData.forEach(([queryKey, data]) => {
//           queryClient.setQueryData(queryKey, data);
//         });
//       }

//       const errorMsg =
//         (error as any)?.response?.data?.message || "Failed to bookmark";
//       toast.error(errorMsg);
//     },
//     onSettled: () => {
//       setTimeout(() => {
//         queryClient.invalidateQueries({
//           queryKey: ["newsfeed"],
//           refetchType: "none",
//         });
//       }, 1000);
//     },
//   });
// }
