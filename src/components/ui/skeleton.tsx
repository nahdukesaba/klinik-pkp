/**
 * Skeleton Components
 * 
 * Reusable skeleton loader components untuk loading states.
 * Meningkatkan UX dengan menampilkan placeholder saat data loading.
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
 * Card Skeleton - untuk loading card content
 */
export function CardSkeleton({ className }: SkeletonProps) {
  return (
    <div className={cn("rounded-2xl border border-border overflow-hidden", className)}>
      {/* Image placeholder */}
      <Skeleton className="h-44 w-full rounded-none" />
      
      {/* Content placeholder */}
      <div className="p-5 space-y-3">
        <Skeleton className="h-5 w-3/4" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      </div>
    </div>
  );
}

/**
 * Grid Card Skeleton - untuk loading grid of cards
 */
interface GridSkeletonProps {
  count?: number;
  columns?: "2" | "3" | "4";
  className?: string;
}

export function GridCardSkeleton({ 
  count = 6, 
  columns = "3",
  className 
}: GridSkeletonProps) {
  const colsClass = {
    "2": "md:grid-cols-2",
    "3": "md:grid-cols-2 lg:grid-cols-3",
    "4": "md:grid-cols-2 lg:grid-cols-4",
  };

  return (
    <div className={cn(`grid gap-6 ${colsClass[columns]}`, className)}>
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}

/**
 * Step Card Skeleton - untuk loading building steps
 */
export function StepCardSkeleton({ className }: SkeletonProps) {
  return (
    <div className={cn("rounded-2xl border border-border p-5", className)}>
      <div className="flex items-center gap-3 mb-3">
        <Skeleton className="w-12 h-12 rounded-xl" />
        <div className="space-y-1">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-5 w-24" />
        </div>
      </div>
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-3/4 mt-2" />
    </div>
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

/**
 * Table Row Skeleton - untuk loading table data
 */
export function TableRowSkeleton({ columns = 4 }: { columns?: number }) {
  return (
    <tr>
      {Array.from({ length: columns }).map((_, i) => (
        <td key={i} className="p-4">
          <Skeleton className="h-4 w-full" />
        </td>
      ))}
    </tr>
  );
}

/**
 * Sidebar List Skeleton - untuk loading sidebar items
 */
export function SidebarListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-lg border border-border p-3 space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      ))}
    </div>
  );
}
