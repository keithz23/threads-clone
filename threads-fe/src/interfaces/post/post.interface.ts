import type { User } from "../auth/user.inteface";

export interface CreatePostDto {
  content: string;
  parentPostId?: string;
  rootPostId?: string;
  replyPolicy?: string;
  reviewApprove: boolean;
}

export interface PostMedia {
  id: string;
  postId: string;
  mediaUrl: string;
  thumbnailUrl: string;
  storageKey: string;
  mediaType: string;
}

export interface Post {
  id: string;
  content: string;
  media: PostMedia[];
  replyCount: number;
  repostCount: number;
  bookmarkCount: number;
  viewCount: number;
  likeCount: number;
  isDeleted: boolean;
  isPinned: boolean;
  replyPolicy: string;
  reviewApprove: boolean;
  user: User;
  _count: {
    like: number;
    replies: number;
    reposts: number;
  };
  createdAt: string;
}
