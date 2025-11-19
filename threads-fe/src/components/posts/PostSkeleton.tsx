import { Skeleton } from "../ui/skeleton";

export default function PostSkeleton() {
  return (
    <div className="flex p-5 gap-x-3 border-b border-gray-200 w-full">
      <div className="flex-shrink-0">
        <Skeleton className="h-10 w-10 rounded-full" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="space-y-2 px-2">
          <Skeleton className="h-4 w-32" />
          <div className="space-y-2">
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-3/4" />
          </div>
          <div className="flex gap-x-5 pt-2">
            {[...Array(4)].map((_, btnIndex) => (
              <Skeleton key={btnIndex} className="h-8 w-12 rounded-full" />
            ))}
          </div>
        </div>
      </div>
      <div className="flex-shrink-0">
        <Skeleton className="h-8 w-8 rounded-full" />
      </div>
    </div>
  );
}
