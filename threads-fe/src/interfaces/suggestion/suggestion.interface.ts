interface Count {
  followers: number;
}
export interface Suggestion {
  id: string;
  displayName: string;
  username: string;
  email: string;
  bio: string;
  avatarUrl: string;
  _count: Count;
  mutualConnections: number;
}
