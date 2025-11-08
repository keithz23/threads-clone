import { useToast } from "@/components/Toast";
import { FollowService } from "@/services/follow/follow.service";
import { useMutation, useQueryClient } from "@tanstack/react-query";

function extractErrMsg(err: unknown): string {
  const anyErr = err as any;
  const raw =
    anyErr?.response?.data?.message ||
    anyErr?.message ||
    "Something went wrong.";
  return Array.isArray(raw) ? raw.join(", ") : String(raw);
}

export function useFollow() {
  const qc = useQueryClient();
  const toast = useToast();

  const follow = useMutation({
    mutationFn: async ({ followingId }: { followingId: string }) => {
      const res = await FollowService.follow(followingId);
      return res.data;
    },
    onSuccess: async () => {
      await qc.invalidateQueries();
      toast.success("Followed successfully.");
    },
    onError: (err: unknown) => {
      toast.error(extractErrMsg(err));
    },
  });

  const unfollow = useMutation({
    mutationFn: async ({ followingId }: { followingId: string }) => {
      const res = await FollowService.unfollow(followingId);
      return res.data;
    },
    onSuccess: async () => {
      await qc.invalidateQueries();
      toast.success("Unfollowed successfully.");
    },
    onError: (err: unknown) => {
      toast.error(extractErrMsg(err));
    },
  });

  return {
    follow,
    unfollow,
  };
}
