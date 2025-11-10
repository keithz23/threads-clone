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
    onMutate: async ({ followingId }) => {
      await qc.cancelQueries({ queryKey: ["suggestions"] });

      const previousSuggestions = qc.getQueryData(["suggestions"]);

      qc.setQueryData(["suggestions"], (old: any) => {
        if (!old) return old;
        return old.filter((sug: any) => sug.id !== followingId);
      });

      return { previousSuggestions };
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["suggestions"] });
      qc.invalidateQueries({ queryKey: ["following"] });

      toast.success("Followed successfully.");
    },
    onError: (err: unknown, variables, context) => {
      if (context?.previousSuggestions) {
        qc.setQueryData(["suggestions"], context.previousSuggestions);
      }

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
