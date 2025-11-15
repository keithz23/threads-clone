import { usePost } from "@/hooks/usePost";
import { Skeleton } from "../ui/skeleton";
import type { Post } from "@/interfaces/post/post.interface";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import { formatDistanceToNow } from "date-fns";
import {
  Bookmark,
  ChevronRight,
  Ellipsis,
  Heart,
  HeartOff,
  Link,
  MessageCircle,
  Pin,
  Repeat,
  Send,
  Trash,
} from "lucide-react";
import { Carousel, CarouselContent, CarouselItem } from "../ui/carousel";
import { enUS } from "date-fns/locale";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

export default function Threads() {
  const { postsByUser: data, isLoading } = usePost();
  const post_btn = [
    { id: 1, name: "heart", icon: <Heart size={18} /> },
    { id: 2, name: "message", icon: <MessageCircle size={18} /> },
    { id: 3, name: "repeat", icon: <Repeat size={18} /> },
    { id: 4, name: "send", icon: <Send size={18} /> },
  ];

  const groups = [
    {
      id: "primary",
      items: [
        { id: "save", label: "Save", icon: <Bookmark /> },
        { id: "pin", label: "Pin to profile", icon: <Pin /> },
        {
          id: "hide_counts",
          label: "Hide like and share counts",
          icon: <HeartOff />,
        },
        {
          id: "reply_opts",
          label: "Reply options",
          icon: <ChevronRight />,
        },
      ],
    },
    {
      id: "secondary",
      items: [
        {
          id: "delete",
          label: "Delete",
          icon: <Trash className="text-red-500" />,
          dangerous: true,
        },
        { id: "copy", label: "Copy link", icon: <Link /> },
      ],
    },
  ];
  // Loading state
  if (isLoading) {
    return (
      <div className="w-full flex-1 md:border border-gray-300 md:pt-0 pt-[calc(5rem+env(safe-area-inset-top))] rounded-none md:rounded-3xl mx-auto h-full overflow-y-auto custom-scroll">
        <div className="space-y-0">
          {[...Array(5)].map((_, index) => (
            <div
              key={index}
              className="flex p-5 gap-x-3 border-b border-gray-200 w-full"
            >
              {/* Avatar skeleton */}
              <div className="flex-shrink-0">
                <Skeleton className="h-10 w-10 rounded-full" />
              </div>

              {/* Content skeleton */}
              <div className="flex-1 min-w-0">
                <div className="space-y-2 px-2">
                  {/* Username */}
                  <Skeleton className="h-4 w-32" />

                  {/* Post content - multiple lines */}
                  <div className="space-y-2">
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-3/4" />
                  </div>

                  {/* Action buttons */}
                  <div className="flex gap-x-5 pt-2">
                    {[...Array(4)].map((_, btnIndex) => (
                      <Skeleton
                        key={btnIndex}
                        className="h-8 w-12 rounded-full"
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* More options skeleton */}
              <div className="flex-shrink-0">
                <Skeleton className="h-8 w-8 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Empty state
  if (!data || data.length === 0) {
    return (
      <div className="w-full md:w-1/2 flex-1 md:border border-gray-300 md:pt-0 pt-[calc(5rem+env(safe-area-inset-top))] rounded-none md:rounded-3xl mx-auto h-full overflow-y-auto custom-scroll">
        <div className="flex items-center justify-center p-10">
          <p className="text-gray-500">No posts yet</p>
        </div>
      </div>
    );
  }
  return (
    <>
      {data?.data?.map((post: Post) => (
        <div
          key={post.id}
          className="p-2 gap-x-3 border-b border-gray-200 w-full"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-x-2">
              <img
                src={
                  post.user?.avatarUrl ||
                  `https://static.cdninstagram.com/rsrc.php/ye/r/lEu8iVizmNW.ico`
                }
                className="rounded-full w-10 h-10 object-cover"
                alt={post.user?.username || "User avatar"}
              />
              {post.user?.username || "Anonymous"}

              <Tooltip>
                <TooltipTrigger asChild>
                  <span
                    className="text-gray-400 text-sm cursor-pointer hover:text-gray-300 transition-colors"
                    suppressHydrationWarning
                  >
                    {formatDistanceToNow(new Date(post.createdAt), {
                      addSuffix: false,
                      locale: enUS,
                    }).replace(/^khoảng\s|^about\s/, "")}
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  <p suppressHydrationWarning>
                    {new Date(post.createdAt).toLocaleString("en-us", {
                      weekday: "short",
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </TooltipContent>
              </Tooltip>
            </div>

            <div className="">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="group cursor-pointer rounded-full transition-all duration-200 p-3 hover:bg-gray-100 active:scale-95 flex items-center gap-x-1.5 focus:outline-none">
                    <Ellipsis size={15} />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-60" align="start">
                  {groups.map((g, gi) => (
                    <span key={g.id}>
                      <DropdownMenuGroup>
                        {g.items.map((it) => (
                          <DropdownMenuItem
                            key={it.id}
                            className={
                              it.dangerous ? "text-red-600" : undefined
                            }
                          >
                            {it.label}
                            <DropdownMenuShortcut>
                              {it.dangerous ? (
                                <span className="text-red-500">{it.icon}</span>
                              ) : (
                                it.icon
                              )}
                            </DropdownMenuShortcut>
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuGroup>
                      {gi === 0 && <DropdownMenuSeparator />}
                    </span>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <div>
            <ul className="space-y-2">
              <li className="font-edium"></li>
              <li className="text-justify">{post.content}</li>

              {/* Media Carousel */}
              {post.media && post.media.length > 0 && (
                <li className="mt-3">
                  <Carousel
                    opts={{ align: "start" }}
                    className="w-full max-w-3xl"
                  >
                    <CarouselContent>
                      {post.media.map((media) => (
                        <CarouselItem
                          key={media.id}
                          className="md:basis-full lg:basis-1/3"
                        >
                          <div className="p-1">
                            <div className="relative aspect-square rounded-lg overflow-hidden bg-gray-100">
                              <img
                                src={media.mediaUrl}
                                alt={`Media ${media.id}`}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          </div>
                        </CarouselItem>
                      ))}
                    </CarouselContent>
                  </Carousel>
                </li>
              )}

              <li>
                <div className="flex gap-x-5">
                  {post_btn.map((btn) => (
                    <button
                      key={btn.id}
                      className="group cursor-pointer rounded-full transition-all duration-200 px-3 py-2 hover:bg-gray-100 active:scale-95 flex items-center gap-x-1.5"
                    >
                      <span className="text-gray-600 group-hover:text-gray-900 transition-colors duration-200">
                        {btn.icon}
                      </span>
                      <span className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors duration-200">
                        {btn.name === "heart" && (post.likeCount || 0)}
                        {btn.name === "message" && (post.replyCount || 0)}
                        {btn.name === "repeat" && (post.repostCount || 0)}
                        {btn.name === "send" && (post.viewCount || 0)}
                      </span>
                    </button>
                  ))}
                </div>
              </li>
            </ul>
          </div>
        </div>
      ))}
    </>
  );
}
