import { useToast } from "@/components/Toast";
import type { CreateHashtagDto } from "@/interfaces/hashtag/create-hashtag.dto";
import type { Hashtags } from "@/interfaces/hashtag/hashtag.interface";
import { HashtagService } from "@/services/hashtag/hashtag.service";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

function extractErrMsg(err: unknown): string {
  const anyErr = err as any;
  const raw =
    anyErr?.response?.data?.message ||
    anyErr?.message ||
    "Something went wrong.";
  return Array.isArray(raw) ? raw.join(", ") : String(raw);
}

export const HASHTAG_QUERY_KEYS = {
  all: ["hashtags"] as const,
  search: (query: string) => ["hashtags", "search", query] as const,
};

export function useHashtag() {
  const qc = useQueryClient();
  const toast = useToast();

  // Query: get all hashtags
  const allHashtags = useQuery({
    queryKey: HASHTAG_QUERY_KEYS.all,
    queryFn: async () => {
      const res = await HashtagService.getAllHashtags();
      return res.data.data;
    },
    select: (data) => data.map((h: Hashtags) => h.name),
    staleTime: 5 * 60 * 1000,
  });

  // Mutation: create new hashtag
  const createHashtag = useMutation({
    mutationFn: async ({
      createHashtagDto,
    }: {
      createHashtagDto: CreateHashtagDto;
    }) => {
      const res = await HashtagService.createHashtag(createHashtagDto);
      return res.data;
    },
    onSuccess: (data) => {
      qc.setQueryData(HASHTAG_QUERY_KEYS.all, (old: any) => {
        return old ? [...old, data] : [data];
      });

      toast.success("Hashtag created successfully");
    },
    onError: (err: unknown) => {
      toast.error(extractErrMsg(err));
    },
  });

  const searchHashtags = (query: string) => {
    return useQuery({
      queryKey: HASHTAG_QUERY_KEYS.search(query),
      queryFn: async () => {
        const res = await HashtagService.searchHashtags(query);
        return res.data;
      },
      enabled: query.trim().length > 0,
      staleTime: 30 * 1000,
    });
  };

  return {
    allHashtags,
    createHashtag,
    searchHashtags,
  };
}
