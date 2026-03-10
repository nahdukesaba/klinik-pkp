/**
 * Loading state untuk /bank-desain.
 * Skeleton untuk halaman bank desain rumah.
 */

export default function BankDesainLoading() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navbar skeleton */}
      <div className="h-16 lg:h-20 bg-card border-b border-border animate-pulse" />

      <div className="container mx-auto px-4 py-24">
        {/* Title skeleton */}
        <div className="text-center mb-12">
          <div className="h-8 w-44 bg-muted rounded-full mx-auto mb-4 animate-pulse" />
          <div className="h-10 w-72 bg-muted rounded mx-auto mb-4 animate-pulse" />
          <div className="h-5 w-80 bg-muted rounded mx-auto animate-pulse" />
        </div>

        {/* Filter bar skeleton */}
        <div className="flex gap-3 mb-8 justify-center">
          <div className="h-10 w-40 bg-muted rounded-xl animate-pulse" />
          <div className="h-10 w-40 bg-muted rounded-xl animate-pulse" />
        </div>

        {/* Grid cards skeleton */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="rounded-2xl border border-border overflow-hidden animate-pulse">
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
