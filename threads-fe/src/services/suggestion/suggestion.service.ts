import { Suggestion } from "@/constants/suggestion/suggestion.constant";
import { instance } from "@/libs/api/axios";

export const SuggestionService = {
  getSuggestions: () => {
    return instance.get(Suggestion.GET_SUGGESTIONS);
  },
};
