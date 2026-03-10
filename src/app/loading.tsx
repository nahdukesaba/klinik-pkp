/**
 * Root Loading State — Suspense boundary untuk navigasi antar halaman.
 *
 * File ini otomatis digunakan Next.js sebagai fallback saat:
 * - User navigasi antar halaman (client-side)
 * - Halaman sedang di-compile (dev mode)
 *
 * Tanpa file ini, user melihat blank screen saat pindah halaman.
 * Ref: nextjs-app-router-patterns/file-conventions
 */

export default function Loading() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <div className="w-12 h-12 rounded-full border-4 border-primary/20" />
          <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin absolute inset-0" />
        </div>
        <p className="text-muted-foreground text-sm">Memuat halaman...</p>
      </div>
    </div>
  );
}
