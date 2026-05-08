interface MapDashboardLoadingProps {
  sidebarCards: number;
}

export function MapDashboardLoading({
  sidebarCards,
}: MapDashboardLoadingProps) {
  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      <div className="h-16 lg:h-20 bg-card border-b border-border animate-pulse" />

      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="px-4 py-3 border-b border-border bg-card/50">
          <div className="flex items-center gap-3">
            <div className="h-9 w-48 bg-muted rounded-lg" />
            <div className="h-9 w-36 bg-muted rounded-lg" />
            <div className="h-9 w-36 bg-muted rounded-lg" />
          </div>
        </div>

        <div className="flex-1 flex overflow-hidden mx-2 mb-2 rounded-xl border border-border bg-card/50">
          <div className="flex-1 bg-muted animate-pulse" />
          <div className="hidden lg:block w-80 border-l border-border p-4 space-y-3">
            {Array.from({ length: sidebarCards }).map((_, index) => (
              <div
                key={index}
                className="h-24 bg-muted rounded-xl animate-pulse"
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

interface MapLazySectionSkeletonProps {
  sidebarCardHeights?: string[];
}

export function MapLazySectionSkeleton({
  sidebarCardHeights = ["h-40", "h-40", "h-40"],
}: MapLazySectionSkeletonProps) {
  return (
    <div className="min-h-screen bg-background">
      <div className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8 animate-pulse">
            <div className="h-8 w-32 bg-muted rounded-full mx-auto mb-4" />
            <div className="h-10 w-64 bg-muted rounded mx-auto mb-4" />
            <div className="h-6 w-96 bg-muted rounded mx-auto" />
          </div>
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 h-[500px] bg-muted rounded-2xl animate-pulse" />
            <div className="space-y-4 animate-pulse">
              {sidebarCardHeights.map((heightClass, index) => (
                <div
                  key={index}
                  className={`${heightClass} bg-muted rounded-2xl`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function InformasiPageSkeleton() {
  return (
    <div className="min-h-screen bg-background animate-pulse">
      <div className="h-16 bg-muted" />
      <div className="container mx-auto px-4 py-24">
        <div className="h-8 bg-muted rounded w-1/3 mx-auto mb-4" />
        <div className="h-4 bg-muted rounded w-2/3 mx-auto mb-12" />
        <div className="grid md:grid-cols-3 gap-6">
          {[1, 2, 3].map((item) => (
            <div key={item} className="h-48 bg-muted rounded-2xl" />
          ))}
        </div>
      </div>
    </div>
  );
}

export function BeritaDetailSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <div className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="animate-pulse">
            <div className="h-8 w-24 bg-muted rounded mb-6" />
            <div className="aspect-video bg-muted rounded-2xl mb-6" />
            <div className="h-10 w-3/4 bg-muted rounded mb-4" />
            <div className="h-6 w-1/2 bg-muted rounded mb-6" />
            <div className="space-y-3">
              {[1, 2, 3, 4].map((item) => (
                <div key={item} className="h-4 bg-muted rounded w-full" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function BankDesainPageSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <div className="h-16 lg:h-20 bg-card border-b border-border animate-pulse" />

      <div className="container mx-auto px-4 py-24">
        <div className="text-center mb-12">
          <div className="h-8 w-44 bg-muted rounded-full mx-auto mb-4 animate-pulse" />
          <div className="h-10 w-72 bg-muted rounded mx-auto mb-4 animate-pulse" />
          <div className="h-5 w-80 bg-muted rounded mx-auto animate-pulse" />
        </div>

        <div className="flex gap-3 mb-8 justify-center">
          <div className="h-10 w-40 bg-muted rounded-xl animate-pulse" />
          <div className="h-10 w-40 bg-muted rounded-xl animate-pulse" />
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <div
              key={item}
              className="rounded-2xl border border-border overflow-hidden animate-pulse"
            >
              <div className="h-52 bg-muted" />
              <div className="p-4 space-y-3">
                <div className="h-5 bg-muted rounded w-3/4" />
                <div className="h-4 bg-muted rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function FaqPageSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <div className="h-16 lg:h-20 bg-card border-b border-border animate-pulse" />

      <div className="container mx-auto px-4 py-24">
        <div className="mx-auto max-w-4xl">
          <div className="mb-5 flex items-center gap-3">
            <div className="h-11 w-11 rounded-lg bg-muted animate-pulse" />
            <div className="space-y-2">
              <div className="h-4 w-32 rounded bg-muted animate-pulse" />
              <div className="h-9 w-56 rounded bg-muted animate-pulse" />
            </div>
          </div>
          <div className="h-5 w-full max-w-3xl rounded bg-muted animate-pulse" />
          <div className="mt-2 h-5 w-2/3 rounded bg-muted animate-pulse" />
        </div>

        <div className="mx-auto mt-8 max-w-4xl rounded-lg border border-border bg-card p-5 shadow-sm">
          <div className="h-5 w-32 rounded bg-muted animate-pulse" />
          <div className="mt-3 h-12 w-full rounded-lg bg-muted animate-pulse" />
          <div className="mt-4 flex gap-2 overflow-hidden">
            {Array.from({ length: 5 }).map((_, index) => (
              <div
                key={index}
                className="h-11 w-24 shrink-0 rounded-lg bg-muted animate-pulse"
              />
            ))}
          </div>
        </div>

        <div className="mx-auto mt-8 max-w-4xl space-y-3">
          {Array.from({ length: 5 }).map((_, index) => (
            <div
              key={index}
              className="rounded-lg border border-border bg-card p-5 shadow-sm"
            >
              <div className="h-5 w-3/4 rounded bg-muted animate-pulse" />
              <div className="mt-4 h-4 w-full rounded bg-muted animate-pulse" />
              <div className="mt-2 h-4 w-5/6 rounded bg-muted animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function LokasiKlinikPageSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <div className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 animate-pulse">
            <div className="h-8 w-32 bg-muted rounded-full mx-auto mb-4" />
            <div className="h-10 w-64 bg-muted rounded mx-auto mb-4" />
            <div className="h-6 w-96 bg-muted rounded mx-auto" />
          </div>
          <div className="grid lg:grid-cols-2 gap-8">
            <div className="space-y-6 animate-pulse">
              <div className="h-[350px] bg-muted rounded-2xl" />
              <div className="h-12 bg-muted rounded-xl" />
              <div className="aspect-video bg-muted rounded-2xl" />
            </div>
            <div className="space-y-6 animate-pulse">
              <div className="h-32 bg-muted rounded-2xl" />
              <div className="h-48 bg-muted rounded-2xl" />
              <div className="h-32 bg-muted rounded-2xl" />
              <div className="h-40 bg-muted rounded-2xl" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function SosialisasiPageSkeleton() {
  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      <div className="h-16 lg:h-20 bg-card border-b border-border animate-pulse" />

      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="px-4 py-3 border-b border-border bg-card/50">
          <div className="flex items-center gap-3">
            <div className="h-9 w-48 bg-muted rounded-lg" />
            <div className="h-9 w-28 bg-muted rounded-lg" />
            <div className="h-9 w-36 bg-muted rounded-lg" />
          </div>
        </div>

        <div className="flex-1 flex overflow-hidden mx-2 mb-2 rounded-xl border border-border bg-card/50">
          <div className="flex-[3] bg-muted animate-pulse" />
          <div className="hidden lg:block flex-[2] border-l border-border p-4 space-y-3">
            <div className="h-40 bg-muted rounded-xl animate-pulse" />
            <div className="h-40 bg-muted rounded-xl animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
}

interface AuthCardSkeletonProps {
  titleWidthClass: string;
  subtitleWidthClass: string;
  fieldCount: number;
}

export function AuthCardSkeleton({
  titleWidthClass,
  subtitleWidthClass,
  fieldCount,
}: AuthCardSkeletonProps) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-pulse">
        <div className="bg-card/90 rounded-2xl border border-border px-6 py-5 sm:px-8 sm:py-6">
          <div className="h-4 w-28 bg-muted rounded mb-4" />
          <div className="flex flex-col items-center mb-5">
            <div className="w-14 h-14 bg-muted rounded-xl mb-2.5" />
            <div className={`h-5 ${titleWidthClass} bg-muted rounded mb-1.5`} />
            <div className={`h-3 ${subtitleWidthClass} bg-muted rounded`} />
          </div>
          <div className="space-y-3.5">
            {Array.from({ length: fieldCount }).map((_, index) => (
              <div
                key={index}
                className={`h-10 bg-muted rounded ${index === fieldCount - 1 ? "mt-2" : ""}`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
