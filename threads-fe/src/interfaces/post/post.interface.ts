export interface CreatePostDto {
  content: string;
  parentPostId?: string;
  rootPostId?: string;
  replyPolicy?: string;
  reviewApprove: boolean;
  hashtags?: string[];
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
    following: Array<{
      id: string;
      followerId: string;
      followingId: string;
      createdAt: string;
    }>;
  };
  media: Array<{
    id: string;
    mediaUrl: string;
    type: string;
  }>;
  hashtags: Array<{
    id: string;
    name: string;
  }>;
  isLiked?: boolean;
  isReposted?: boolean;
  isBookmarked?: boolean;
}

export interface PostResponse {
  success: boolean;
  data: {
    posts: Post[];
    pagination: {
      hasMore: boolean;
      nextCursor: string | null;
    };
  };
}
