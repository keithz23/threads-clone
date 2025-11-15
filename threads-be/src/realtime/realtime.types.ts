export const EV = {
  PROFILE_UPDATED: 'profile.updated',
} as const;

export type ProfilePayload = {
  id: string;
  displayName?: string;
  bio?: string;
  website?: string | null;
  location?: string | null;
  isPrivate?: boolean;
  linkTitle?: string | null;
  link?: string | null;
  interests?: string[];
  handle?: string;
  avatarUrl?: string | null;
};
