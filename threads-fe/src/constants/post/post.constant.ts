export const Post = {
  GET_POST: "/posts",
  GET_POST_BY_ID: "/posts",
  GET_POSTS_BY_USER: "/posts/get-posts-by-user",
  GET_NEWSFEED_POST: "/posts/get-newsfeed-post",
  GET_USER_POSTS: "/posts/get-user-posts",
  TOGGLE_LIKE: (id: string) => `/posts/${encodeURIComponent(id)}/like`,
  TOGGLE_REPOST: (id: string) => `/posts/${encodeURIComponent(id)}/repost`,
  CREATE_POST: "/posts/create-post",
  UPDATE_POST: "/posts/update-post",
  DELETE_POST: (id: string) => `/posts/${encodeURIComponent(id)}/delete`,
};

export const ReplyPolicy = {
  ANYONE: "ANYONE",
  FOLLOWERS: "FOLLOWERS",
  FOLLOWING: "FOLLOWING",
  METION: "METION",
};
