import { Skeleton } from '@/components/ui/skeleton';
import { DEFAULT_PAGE_SIZE } from '@/shared/constants';

export function IncidentSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: DEFAULT_PAGE_SIZE }).map((_, i) => (
        <div key={i} className="bg-card rounded-lg border border-border p-4">
          <div className="flex items-center justify-between gap-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-24" />
          </div>
          <Skeleton className="h-4 w-3/4 mt-3" />
          <Skeleton className="h-3 w-28 mt-2" />
          <div className="space-y-1.5 mt-3">
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-2/3" />
          </div>
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="size-6" />
          </div>
        </div>
      ))}
    </div>
  );
}
