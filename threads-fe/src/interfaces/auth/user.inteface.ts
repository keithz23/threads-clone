export interface User {
  id: string;
  username: string;
  email: string;
  displayName: string;
  bio: string;
  avatarUrl: string;
  coverUrl: string;
  website: string;
  location: string;
  verified: boolean;
  isPrivate: boolean;
  followersCount: number;
  followingsCount: number;
  postsCount: number;
}
