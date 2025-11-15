import type { CreatePostDto } from "@/interfaces/post/post.interface";
import { instance } from "@/libs/api/axios";
import { Post } from "@/constants/post/post.constant";

export const PostService = {
  createPost: (createPostDto: CreatePostDto, images?: File[]) => {
    const form = new FormData();

    Object.entries(createPostDto).forEach(([key, val]) => {
      if (val === undefined || val === null) return;

      if (typeof val === "boolean") {
        if (val === true) {
          form.append(key, "true");
        }
        return;
      }

      if (typeof val === "number") {
        form.append(key, String(val));
      } else {
        form.append(key, String(val));
      }
    });

    if (images && images.length > 0) {
      images.forEach((file) => {
        form.append("images", file);
      });
    }

    return instance.post(Post.CREATE_POST, form);
  },

  getPostsByUser: () => {
    return instance.get(Post.GET_POSTS_BY_USER);
  },

  getNewsFeedPost: (filter: string, limit = 10, cursor?: string) => {
    const params = new URLSearchParams();
    if (filter) params.append("filter", filter);
    if (limit) params.append("limit", String(limit));
    if (cursor) params.append("cursor", cursor);
    return instance.get(`${Post.GET_NEWSFEED_POST}?${params.toString()}`);
  },

  getUserPosts: (
    username: string,
    filter: string,
    limit = 10,
    cursor?: string
  ) => {
    const params = new URLSearchParams();
    if (username) params.append("username", username);
    if (filter) params.append("filter", filter);
    if (limit) params.append("limit", String(limit));
    if (cursor) params.append("cursor", cursor);
    return instance.get(`${Post.GET_USER_POSTS}?${params.toString()}`);
  },

  toggleLike: (postId: string) => {
    return instance.post(`${Post.TOGGLE_LIKE(postId)}`);
  },

  toggleRepost: (postId: string) => {
    return instance.post(`${Post.TOGGLE_REPOST(postId)}`);
  },
};
