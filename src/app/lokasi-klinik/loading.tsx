/**
 * Loading state untuk /lokasi-klinik.
 * Skeleton untuk halaman lokasi klinik PKP.
 */

export default function LokasiKlinikLoading() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navbar skeleton */}
      <div className="h-16 lg:h-20 bg-card border-b border-border animate-pulse" />

      <div className="container mx-auto px-4 py-24">
        {/* Title skeleton */}
        <div className="text-center mb-12">
          <div className="h-8 w-40 bg-muted rounded-full mx-auto mb-4 animate-pulse" />
          <div className="h-10 w-72 bg-muted rounded mx-auto mb-4 animate-pulse" />
          <div className="h-5 w-96 bg-muted rounded mx-auto animate-pulse" />
        </div>

        {/* Content skeleton */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <div className="h-64 bg-muted rounded-2xl animate-pulse" />
          <div className="space-y-4">
            <div className="h-6 bg-muted rounded w-3/4 animate-pulse" />
            <div className="h-4 bg-muted rounded w-full animate-pulse" />
            <div className="h-4 bg-muted rounded w-5/6 animate-pulse" />
            <div className="h-4 bg-muted rounded w-2/3 animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
}
