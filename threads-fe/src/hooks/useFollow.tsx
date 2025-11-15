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

  const toggleFollow = useMutation({
    mutationFn: async ({ followingId }: { followingId: string }) => {
      const res = await FollowService.toggleFollow(followingId);
      return res.data;
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["suggestions"] });
      await qc.invalidateQueries({ queryKey: ["following"] });
      await qc.invalidateQueries({ queryKey: ["user-profile"] });
    },
    onError: (err: unknown) => {
      toast.error(extractErrMsg(err));
    },
  });

  return {
    toggleFollow,
  };
}
