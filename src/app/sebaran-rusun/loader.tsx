/**
 * Client wrapper untuk lazy-load SebaranRusunPage.
 * Dipisahkan karena `dynamic({ ssr: false })` hanya diizinkan di Client Component (Next.js 16+).
 * Page.tsx tetap Server Component agar bisa export metadata untuk SEO.
 */

"use client";

import "leaflet/dist/leaflet.css";
import dynamic from "next/dynamic";

/** Skeleton saat chunk JS sedang dimuat */
function SebaranRusunSkeleton() {
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
              <div className="h-40 bg-muted rounded-2xl" />
              <div className="h-64 bg-muted rounded-2xl" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Lazy load — ssr:false karena Leaflet butuh window/document */
const SebaranRusunPage = dynamic(
  () => import("@/components/sebaran-rusun/SebaranRusunPage"),
  {
    loading: () => <SebaranRusunSkeleton />,
    ssr: false,
  }
);

export default SebaranRusunPage;
