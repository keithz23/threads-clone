import { Follow } from "@/constants/follow/follow.contants";
import { instance } from "@/libs/api/axios";

export const FollowService = {
  follow: (followingId: string) => {
    return instance.post(Follow.FOLLOW, { followingId });
  },

  unfollow: (followingId: string) => {
    return instance.post(Follow.UNFOLLOW, { followingId });
  },
};
