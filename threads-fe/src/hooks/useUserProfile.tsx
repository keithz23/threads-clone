// hooks/useUserProfile.ts
import { useQuery } from "@tanstack/react-query";
import { UserService } from "../services/user/user.service";

interface UseUserProfileOptions {
  userId?: string;
  username?: string;
}

export function useUserProfile({ userId, username }: UseUserProfileOptions) {
  const identifier = userId || username;

  return useQuery({
    queryKey: username
      ? ["user-profile", "username", username]
      : ["user-profile", "id", userId],
    queryFn: async () => {
      if (!identifier) throw new Error("User ID or username is required");

      // Gọi API tương ứng
      const { data } = username
        ? await UserService.getProfileByUsername(username)
        : await UserService.getProfile(userId!);

      return data;
    },
    enabled: !!identifier,
    staleTime: 2 * 60_000,
    gcTime: 10 * 60_000,
    refetchOnWindowFocus: false,
  });
}
