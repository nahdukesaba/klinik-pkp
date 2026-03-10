/**
 * Client wrapper untuk lazy-load SosialisasiKlinikPage.
 * Dipisahkan karena `dynamic({ ssr: false })` hanya diizinkan di Client Component (Next.js 16+).
 */

"use client";

import "leaflet/dist/leaflet.css";
import dynamic from "next/dynamic";

/** Skeleton saat chunk JS sedang dimuat */
function SosialisasiSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <div className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8 animate-pulse">
            <div className="h-8 w-32 bg-muted rounded-full mx-auto mb-4" />
            <div className="h-10 w-64 bg-muted rounded mx-auto mb-4" />
            <div className="h-6 w-96 bg-muted rounded mx-auto mb-6" />
            <div className="flex justify-center gap-3">
              <div className="h-10 w-40 bg-muted rounded-xl" />
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            <div className="lg:col-span-3 h-[500px] bg-muted rounded-2xl animate-pulse" />
            <div className="lg:col-span-2 space-y-4 animate-pulse">
              <div className="h-64 bg-muted rounded-2xl" />
              <div className="h-64 bg-muted rounded-2xl" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Lazy load — ssr:false karena Leaflet butuh window/document */
const SosialisasiKlinikPage = dynamic(
  () => import("@/components/sosialisasi-pkp/SosialisasiKlinikPage"),
  {
    loading: () => <SosialisasiSkeleton />,
    ssr: false,
  }
);

export default SosialisasiKlinikPage;
