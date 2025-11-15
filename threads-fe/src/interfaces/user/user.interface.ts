export interface UserProfile {
  id: string;
  username: string;
  email?: string;
  phoneNumber?: string;
  displayName: string | null;
  bio: string | null;
  avatarUrl: string | null;
  coverUrl: string | null;
  verified: boolean;
  isPrivate: boolean;
  isOwnProfile: boolean;
  followersCount: number;
  followingCount: number;
  postsCount: number;
  relationshipStatus?: {
    isFollowing: boolean;
    isFollower: boolean;
    isBlocked: boolean;
    isMuted: boolean;
    hasPendingRequest: boolean;
  };
  createdAt: string;
}
