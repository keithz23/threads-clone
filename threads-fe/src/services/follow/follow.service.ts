import { Follow } from "@/constants/follow/follow.contants";
import { instance } from "@/libs/api/axios";

export const FollowService = {
  toggleFollow: (followingId: string) => {
    return instance.post(`${Follow.TOGGLE_FOLLOW(followingId)}`);
  },
};
