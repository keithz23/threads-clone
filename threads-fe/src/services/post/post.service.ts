import type { CreatePostDto } from "@/interfaces/post/post.interface";
import { instance } from "@/libs/api/axios";
import { Post } from "@/constants/post/post.constant";

export const PostService = {
  createPost: (createPostDto: CreatePostDto, images?: File[]) => {
    const form = new FormData();

    Object.entries(createPostDto).forEach(([key, val]) => {
      if (val === undefined || val === null) return;
      if (typeof val === "boolean" || typeof val === "number") {
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
};
