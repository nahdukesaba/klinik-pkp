import { Skeleton } from "@/components/ui/skeleton";

export default function AdminSosialisasiLoading() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
        <div className="space-y-3">
          <Skeleton className="h-8 w-72" />
          <Skeleton className="h-4 w-full max-w-2xl" />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="rounded-2xl border border-border bg-card p-4 shadow-sm"
          >
            <Skeleton className="h-8 w-20" />
            <Skeleton className="mt-3 h-3 w-24" />
          </div>
        ))}
      </div>

      <div className="rounded-3xl border border-border bg-card p-4 shadow-sm">
        <Skeleton className="h-10 w-72" />
        <div className="mt-4 space-y-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="h-14 w-full rounded-2xl" />
          ))}
        </div>
      </div>
    </div>
  );
}
