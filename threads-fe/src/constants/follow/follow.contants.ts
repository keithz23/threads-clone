export const Follow = {
  TOGGLE_FOLLOW: (followingId: string) =>
    `/follows/${encodeURIComponent(followingId)}/follow`,
};
