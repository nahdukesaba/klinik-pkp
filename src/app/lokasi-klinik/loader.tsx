/**
 * Client wrapper untuk lazy-load LokasiKlinikPage.
 * Dipisahkan karena `dynamic({ ssr: false })` hanya diizinkan di Client Component (Next.js 16+).
 */

"use client";

import dynamic from "next/dynamic";

/** Skeleton saat chunk JS sedang dimuat */
function LokasiKlinikSkeleton() {
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

/** Lazy load — ssr:false karena Leaflet butuh window/document */
const LokasiKlinikPage = dynamic(
  () => import("@/components/lokasi-klinik/LokasiKlinikPage"),
  {
    loading: () => <LokasiKlinikSkeleton />,
    ssr: false,
  }
);

export default LokasiKlinikPage;
