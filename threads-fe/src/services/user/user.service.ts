import { User } from "@/constants/user/user.constant";
import type { User as IUser } from "@/interfaces/auth/user.inteface";
import { instance } from "@/libs/api/axios";

export const UserService = {
  getProfile: (userId: string) => {
    return instance.get<IUser>(`${User.PROFILE}/${userId}`);
  },

  getProfileByUsername: (username: string) => {
    return instance.get<IUser>(`${User.PROFILE}/${username}`);
  },
};
