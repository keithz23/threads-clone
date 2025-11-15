export interface Profile {
  username?: string;
  displayName?: string;
  bio: string;
  isPrivate: boolean;
  link: string;
  linkTitle: string;
  interests: string[];
}
export interface UpdateProfileDto extends Profile {}
