import { useQuery } from "@tanstack/react-query";
import { UserService } from "../services/user/user.service";
import type { UserProfile } from "@/interfaces/user/user.interface";

export function useUserProfile(username?: string) {
  const query = useQuery<UserProfile, Error>({
    queryKey: ["user-profile", username],
    queryFn: async () => {
      if (!username) throw new Error("Username is required");
      const res = await UserService.getProfile(username);
      const maybeData = (res as any)?.data ?? res;
      return maybeData.data;
    },
    enabled: !!username,
    staleTime: 2 * 60_000,
    refetchOnWindowFocus: false,
  });

  return {
    profileData: query.data ?? null,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    error: query.error ?? null,
    refetch: query.refetch,
  };
}
