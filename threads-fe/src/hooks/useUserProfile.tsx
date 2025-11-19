import { useQuery } from "@tanstack/react-query";
import { UserService } from "../services/user/user.service";
import type { UserProfile } from "@/interfaces/user/user.interface";

export function useUserProfile(username?: string) {
  const query = useQuery<UserProfile, Error>({
    queryKey: ["profile", username],
    queryFn: async () => {
      if (!username) throw new Error("Username is required");
      const res = await UserService.getProfile(username);
      const maybeData = (res as any)?.data ?? res;
      return maybeData.data;
    },
    enabled: !!username,
    staleTime: 0,
    refetchOnWindowFocus: false,
    gcTime: 5 * 60 * 1000, // Cache 5 phút (cacheTime renamed to gcTime in v5)
    refetchOnMount: 'always', // ✅ Luôn refetch khi mount
  });

  return {
    profileData: query.data ?? null,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    error: query.error ?? null,
    refetch: query.refetch,
  };
}
