import { cn } from "@/lib/utils";

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-md bg-[#F2F3F5]", className)} />;
}

// Generic list-style loading placeholder used by route loading.tsx files.
export function ListSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="px-5 py-6">
      <Skeleton className="mb-6 h-7 w-40" />
      <div className="space-y-3">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 rounded-2xl border border-[#E5E7EB] bg-white p-4">
            <Skeleton className="size-12 shrink-0 rounded-xl" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-3 w-1/3" />
            </div>
            <Skeleton className="size-10 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
