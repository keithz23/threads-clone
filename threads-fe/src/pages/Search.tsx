import { SearchIcon, SlidersHorizontal } from "lucide-react";
import { useSuggestion } from "@/hooks/useSuggestion";
import { useFollow } from "@/hooks/useFollow";
import { useNavigate } from "react-router-dom";
import type { Suggestion } from "@/interfaces/suggestion/suggestion.interface";
import { Skeleton } from "@/components/ui/skeleton";

export default function Search() {
  const navigate = useNavigate();
  const { suggestions, isLoading } = useSuggestion();
  const { follow } = useFollow();

  const handleFollow = async (id: string) => {
    try {
      await follow.mutateAsync({ followingId: id });
    } catch (error) {
      console.error("Follow failed:", error);
    }
  };

  return (
    <div
      className="
        w-full md:w-1/2 flex-1 md:border border-gray-300
        md:pt-0 pt-[calc(5rem+env(safe-area-inset-top))]
        rounded-none md:rounded-3xl mx-auto
        h-full overflow-y-auto custom-scroll
      "
    >
      {/* Search input */}
      <div className="px-5 pt-5">
        <div className="flex items-center justify-between rounded-full p-3 border-2 border-gray-200 bg-gray-100 gap-3">
          <SearchIcon className="text-gray-400" />
          <input
            type="text"
            className="focus:outline-none w-full px-2 bg-transparent"
            placeholder="Search"
            aria-label="Search"
          />
          <SlidersHorizontal className="text-gray-400" />
        </div>

        {/* Follow suggestions */}
        <div className="px-2 py-5">
          <h3 className="text-gray-400 mb-3">Follow suggestions</h3>

          {/* Loading state */}
          {isLoading ? (
            <div className="space-y-5">
              {/* Render 3-5 skeleton items */}
              {[...Array(3)].map((_, index) => (
                <div
                  key={index}
                  className="flex items-start py-5 gap-x-3 border-b border-gray-200 w-full"
                >
                  {/* Avatar skeleton */}
                  <div className="flex-shrink-0">
                    <Skeleton className="h-10 w-10 rounded-full" />
                  </div>

                  {/* Content skeleton */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex-1 space-y-2">
                        {/* Display name */}
                        <Skeleton className="h-4 w-32" />
                        {/* Username */}
                        <Skeleton className="h-3 w-24" />
                      </div>
                      {/* Follow button */}
                      <Skeleton className="h-8 w-16 rounded-xl" />
                    </div>

                    {/* Bio lines */}
                    <div className="mt-2 space-y-2">
                      <Skeleton className="h-3 w-full" />
                      <Skeleton className="h-3 w-3/4" />
                    </div>

                    {/* Followers count */}
                    <Skeleton className="h-3 w-20 mt-2" />
                  </div>
                </div>
              ))}
            </div>
          ) : suggestions.length === 0 ? (
            <div className="text-sm text-gray-400">
              No suggestions right now.
            </div>
          ) : (
            suggestions.map((sug: Suggestion) => (
              <div
                className="flex items-start py-5 gap-x-3 border-b border-gray-200 w-full"
                key={sug.id}
              >
                {/* Avatar */}
                <div className="flex-shrink-0">
                  <img
                    src={
                      sug.avatarUrl ||
                      "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop"
                    }
                    className="rounded-full w-10 h-10 object-cover cursor-pointer"
                    alt={`${sug.displayName || sug.username} avatar`}
                    onClick={() => navigate(`/@${sug.username}`)}
                    onError={(e) => {
                      e.currentTarget.src =
                        "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop";
                    }}
                  />
                </div>

                {/* User info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <div
                      className="truncate cursor-pointer"
                      onClick={() => navigate(`/@${sug.username}`)}
                    >
                      <div className="font-medium truncate hover:underline transition-all duration-200">
                        {sug.displayName}
                      </div>
                      <div className="text-gray-400 text-xs truncate">
                        @{sug.username}
                      </div>
                    </div>

                    {/* Follow button */}
                    <button
                      type="button"
                      className="px-3 py-2 text-sm rounded-xl border border-black bg-black text-white hover:opacity-90 disabled:opacity-50 transition-opacity cursor-pointer"
                      aria-label={`Follow ${sug.username}`}
                      onClick={() => handleFollow(sug.id)}
                      disabled={follow.isPending}
                    >
                      {follow.isPending ? "..." : "Follow"}
                    </button>
                  </div>

                  {/* Bio */}
                  {sug.bio && (
                    <p className="text-sm text-gray-500 mt-2 line-clamp-3">
                      {sug.bio}
                    </p>
                  )}

                  {/* Followers count & mutual connections */}
                  <div className="text-xs text-gray-400 mt-2 flex items-center gap-2">
                    {sug._count?.followers !== undefined && (
                      <span>{sug._count.followers} followers</span>
                    )}
                    {sug.mutualConnections > 0 && (
                      <>
                        <span>•</span>
                        <span className="text-blue-500">
                          {sug.mutualConnections} mutual
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
