import { PostService } from "@/services/post/post.service";
import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

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
    avatarUrl: string;
    verified: boolean;
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
  });

  // Flatten all pages into single array
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

      // Optimistically update
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
    onError: (_error, _context, context) => {
      // Rollback on error
      if (context?.previousData) {
        context.previousData.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
    },
    onSettled: () => {
      // Refetch after mutation
      queryClient.invalidateQueries({ queryKey: ["newsfeed"] });
    },
  });
}

// ============================================
// REPOST MUTATION
// ============================================

export function useRepost() {
  const queryClient = useQueryClient();

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
    onError: (_error, _variables, context) => {
      if (context?.previousData) {
        context.previousData.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["newsfeed"] });
    },
  });
}

// // ============================================
// // BOOKMARK MUTATION
// // ============================================

// export function useBookmark() {
//   const queryClient = useQueryClient();

//   return useMutation({
//     mutationFn: async (postId: string) => {
//       return await postAPI.toggleBookmark(postId);
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
//     onError: (err, postId, context) => {
//       if (context?.previousData) {
//         context.previousData.forEach(([queryKey, data]) => {
//           queryClient.setQueryData(queryKey, data);
//         });
//       }
//     },
//     onSettled: () => {
//       queryClient.invalidateQueries({ queryKey: ["newsfeed"] });
//     },
//   });
// }
