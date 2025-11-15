import { Hashtag } from "@/constants/hashtag/hashtag.constant";
import type { CreateHashtagDto } from "@/interfaces/hashtag/create-hashtag.dto";
import { instance } from "@/libs/api/axios";

export const HashtagService = {
  createHashtag: (createHashtagDto: CreateHashtagDto) => {
    return instance.post(`${Hashtag.CREATE_HASHTAG}`, createHashtagDto);
  },

  getAllHashtags: () => {
    return instance.get(Hashtag.GET_ALL_HASHTAGS);
  },

  searchHashtags: (query: string) => {
    return instance.get(`${Hashtag.SEARCH_HASTAGS}?query=${query}`);
  },
};
