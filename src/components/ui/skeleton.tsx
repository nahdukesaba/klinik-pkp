/**
 * Skeleton Components
 * 
 * Reusable skeleton loader components untuk loading states.
 */

import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
}

/**
 * Base Skeleton component
 */
export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-muted/50",
        className
      )}
    />
  );
}

/**
 * Map Skeleton - untuk loading map container
 */
export function MapSkeleton({ className }: SkeletonProps) {
  return (
    <div className={cn("relative rounded-xl overflow-hidden", className)}>
      <Skeleton className="w-full h-full min-h-[400px]" />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    </div>
  );
}
