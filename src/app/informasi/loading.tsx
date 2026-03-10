/**
 * Loading state untuk /informasi/[slug].
 * Skeleton untuk halaman informasi (konten teks).
 */

export default function InformasiLoading() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navbar skeleton */}
      <div className="h-16 lg:h-20 bg-card border-b border-border animate-pulse" />

      <div className="container mx-auto px-4 py-24">
        {/* Title skeleton */}
        <div className="text-center mb-12">
          <div className="h-8 w-48 bg-muted rounded-full mx-auto mb-4 animate-pulse" />
          <div className="h-10 w-72 bg-muted rounded mx-auto mb-4 animate-pulse" />
          <div className="h-5 w-96 bg-muted rounded mx-auto animate-pulse" />
        </div>

        {/* Content skeleton */}
        <div className="max-w-4xl mx-auto space-y-4">
          <div className="h-4 bg-muted rounded w-full animate-pulse" />
          <div className="h-4 bg-muted rounded w-5/6 animate-pulse" />
          <div className="h-4 bg-muted rounded w-4/6 animate-pulse" />
          <div className="h-32 bg-muted rounded-2xl animate-pulse mt-8" />
          <div className="h-4 bg-muted rounded w-full animate-pulse" />
          <div className="h-4 bg-muted rounded w-3/4 animate-pulse" />
        </div>
      </div>
    </div>
  );
}
