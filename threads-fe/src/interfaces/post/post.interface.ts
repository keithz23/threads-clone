import { ReplyPolicy } from "@/constants/post/post.constant";

export interface CreatePostDto {
  content: string;
  parentPostId?: string;
  rootPostId?: string;
  replyPolicy?: string;
  reviewApprove: boolean;
}
