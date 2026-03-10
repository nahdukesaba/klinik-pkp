/**
 * Loading state untuk /sosialisasi-klinik-pkp.
 * Skeleton identik dengan layout halaman untuk transisi seamless.
 */

export default function SosialisasiLoading() {
  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      {/* Navbar skeleton */}
      <div className="h-16 lg:h-20 bg-card border-b border-border animate-pulse" />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header skeleton dengan tab navigation */}
        <div className="px-4 py-3 border-b border-border bg-card/50">
          <div className="flex items-center gap-3">
            <div className="h-9 w-48 bg-muted rounded-lg" />
            <div className="h-9 w-28 bg-muted rounded-lg" />
            <div className="h-9 w-36 bg-muted rounded-lg" />
          </div>
        </div>

        {/* Map + Content skeleton (5:2 grid) */}
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
