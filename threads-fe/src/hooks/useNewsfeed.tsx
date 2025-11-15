import { PostService } from "@/services/post/post.service";
import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { useToast } from "@/components/Toast";
import type { PostResponse } from "@/interfaces/post/post.interface";

// ============================================
// MAIN HOOK - INFINITE SCROLL NEWSFEED
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
    refetchOnReconnect: true,
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
// USER POSTS HOOK - INFINITE SCROLL
// ============================================

export function useUserPosts(
  username: string,
  filter: "posts" | "replies" | "media" = "posts",
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
    queryKey: ["user-posts", username, filter],
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
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
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
      // Cancel outgoing refetches for both newsfeed and user-posts
      await queryClient.cancelQueries({
        queryKey: ["newsfeed"],
      });
      await queryClient.cancelQueries({
        queryKey: ["user-posts"],
      });

      // Snapshot previous values
      const previousNewsfeed = queryClient.getQueriesData({
        queryKey: ["newsfeed"],
      });
      const previousUserPosts = queryClient.getQueriesData({
        queryKey: ["user-posts"],
      });

      // Optimistically update newsfeed
      queryClient.setQueriesData<{
        pages: PostResponse[];
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

      // Optimistically update user-posts
      queryClient.setQueriesData<{
        pages: PostResponse[];
        pageParams: (string | undefined)[];
      }>({ queryKey: ["user-posts"] }, (old) => {
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

      return { previousNewsfeed, previousUserPosts };
    },
    onError: (error, _postId, context) => {
      // Rollback on error
      if (context?.previousNewsfeed) {
        context.previousNewsfeed.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
      if (context?.previousUserPosts) {
        context.previousUserPosts.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }

      // Show error toast
      const errorMsg =
        (error as any)?.response?.data?.message || "Failed to like post";
      toast.error(errorMsg);
    },
    onSettled: () => {
      // Invalidate both queries after mutation
      setTimeout(() => {
        queryClient.invalidateQueries({
          queryKey: ["newsfeed"],
          refetchType: "none",
        });
        queryClient.invalidateQueries({
          queryKey: ["user-posts"],
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
      await queryClient.cancelQueries({ queryKey: ["user-posts"] });

      const previousNewsfeed = queryClient.getQueriesData({
        queryKey: ["newsfeed"],
      });
      const previousUserPosts = queryClient.getQueriesData({
        queryKey: ["user-posts"],
      });

      // Update newsfeed
      queryClient.setQueriesData<{
        pages: PostResponse[];
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

      // Update user-posts
      queryClient.setQueriesData<{
        pages: PostResponse[];
        pageParams: (string | undefined)[];
      }>({ queryKey: ["user-posts"] }, (old) => {
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

      return { previousNewsfeed, previousUserPosts };
    },
    onError: (error, _postId, context) => {
      if (context?.previousNewsfeed) {
        context.previousNewsfeed.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
      if (context?.previousUserPosts) {
        context.previousUserPosts.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }

      const errorMsg =
        (error as any)?.response?.data?.message || "Failed to repost";
      toast.error(errorMsg);
    },
    onSuccess: (data) => {
      // Show success message based on action
      const message = (data as any)?.data?.message || "Success";
      if (message.includes("removed") || message.includes("Unrepost")) {
        toast.success("Repost removed");
      } else {
        toast.success("Reposted successfully");
      }
    },
    onSettled: () => {
      setTimeout(() => {
        queryClient.invalidateQueries({
          queryKey: ["newsfeed"],
          refetchType: "none",
        });
        queryClient.invalidateQueries({
          queryKey: ["user-posts"],
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
//       await queryClient.cancelQueries({ queryKey: ["user-posts"] });
//       await queryClient.cancelQueries({ queryKey: ["bookmarks"] });

//       const previousNewsfeed = queryClient.getQueriesData({
//         queryKey: ["newsfeed"],
//       });
//       const previousUserPosts = queryClient.getQueriesData({
//         queryKey: ["user-posts"],
//       });
//       const previousBookmarks = queryClient.getQueriesData({
//         queryKey: ["bookmarks"],
//       });

//       // Update newsfeed
//       queryClient.setQueriesData<{
//         pages: PostResponse[];
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

//       // Update user-posts
//       queryClient.setQueriesData<{
//         pages: PostResponse[];
//         pageParams: (string | undefined)[];
//       }>({ queryKey: ["user-posts"] }, (old) => {
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

//       return { previousNewsfeed, previousUserPosts, previousBookmarks };
//     },
//     onError: (error, _postId, context) => {
//       if (context?.previousNewsfeed) {
//         context.previousNewsfeed.forEach(([queryKey, data]) => {
//           queryClient.setQueryData(queryKey, data);
//         });
//       }
//       if (context?.previousUserPosts) {
//         context.previousUserPosts.forEach(([queryKey, data]) => {
//           queryClient.setQueryData(queryKey, data);
//         });
//       }
//       if (context?.previousBookmarks) {
//         context.previousBookmarks.forEach(([queryKey, data]) => {
//           queryClient.setQueryData(queryKey, data);
//         });
//       }

//       const errorMsg =
//         (error as any)?.response?.data?.message || "Failed to bookmark";
//       toast.error(errorMsg);
//     },
//     onSuccess: (data) => {
//       const message = (data as any)?.data?.message || "Success";
//       if (message.includes("removed") || message.includes("Unbookmark")) {
//         toast.success("Bookmark removed");
//       } else {
//         toast.success("Bookmarked successfully");
//       }
//     },
//     onSettled: () => {
//       setTimeout(() => {
//         queryClient.invalidateQueries({
//           queryKey: ["newsfeed"],
//           refetchType: "none",
//         });
//         queryClient.invalidateQueries({
//           queryKey: ["user-posts"],
//           refetchType: "none",
//         });
//         queryClient.invalidateQueries({
//           queryKey: ["bookmarks"],
//           refetchType: "none",
//         });
//       }, 1000);
//     },
//   });
// }
