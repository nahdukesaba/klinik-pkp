/**
 * Route: /sebaran-rusun
 * 
 * DESKRIPSI: Halaman Sebaran Rusun
 * Menampilkan peta lokasi rumah susun dengan filter
 * 
 * FILE INI HANYA UNTUK ROUTING!
 * Semua logic ada di: hooks/use-sebaran-rusun.ts
 * Semua UI components ada di: @/components/sebaran-rusun/
 */

"use client";

import dynamic from "next/dynamic";

// Skeleton loading untuk SebaranRusunPage
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

// Lazy load SebaranRusunPage
const SebaranRusunPage = dynamic(
  () => import("@/components/sebaran-rusun/SebaranRusunPage"),
  { 
    loading: () => <SebaranRusunSkeleton />,
    ssr: false
  }
);

export default SebaranRusunPage;
