import { useToast } from "@/components/Toast";
import { SuggestionService } from "@/services/suggestion/suggestion.service";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo } from "react";

function extractErrMsg(err: unknown): string {
  const anyErr = err as any;
  const raw =
    anyErr?.response?.data?.message ||
    anyErr?.message ||
    "Something went wrong.";
  return Array.isArray(raw) ? raw.join(", ") : String(raw);
}

export function useSuggestion() {
  const toast = useToast();

  const getSuggestions = useQuery({
    queryKey: ["suggestions"],
    queryFn: async () => {
      const res = await SuggestionService.getSuggestions();
      return res.data?.data || [];
    },
  });

  const uniqueSuggestions = useMemo(() => {
    if (!getSuggestions.data) return [];
    const seen = new Set<string>();
    const unique = [];

    for (const s of getSuggestions.data) {
      if (!s?.id) {
        unique.push(s);
        continue;
      }
      if (!seen.has(s.id)) {
        seen.add(s.id);
        unique.push(s);
      }
    }

    return unique;
  }, [getSuggestions.data]);

  // Error toast
  useEffect(() => {
    if (getSuggestions.isError) {
      toast.error(extractErrMsg(getSuggestions.error));
    }
  }, [getSuggestions.isError, getSuggestions.error, toast]);

  return {
    suggestions: uniqueSuggestions,
    isLoading: getSuggestions.isLoading,
    isError: getSuggestions.isError,
    error: getSuggestions.error,
    refetch: getSuggestions.refetch,
  };
}
