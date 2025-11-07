import { User } from "@/constants/user/user.constant";
import type { User as IUser } from "@/interfaces/auth/user.inteface";
import { instance } from "@/libs/api/axios";

export const UserService = {
  getProfile: (username: string) => {
    return instance.get<IUser>(`${User.PROFILE}/${username}`);
  },
};
