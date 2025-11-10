import { useToast } from "@/components/Toast";
import { SuggestionService } from "@/services/suggestion/suggestion.service";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";

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

  useEffect(() => {
    if (getSuggestions.isError) {
      toast.error(extractErrMsg(getSuggestions.error));
    }
  }, [getSuggestions.isError, getSuggestions.error, toast]);

  return {
    suggestions: getSuggestions.data || [],
    isLoading: getSuggestions.isLoading,
    isError: getSuggestions.isError,
    error: getSuggestions.error,
    refetch: getSuggestions.refetch,
  };
}
