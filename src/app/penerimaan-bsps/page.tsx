/**
 * Route: /penerimaan-bsps
 * 
 * DESKRIPSI: Halaman Penerimaan BSPS
 * Menampilkan peta lokasi penerima BSPS, persyaratan, prosedur, dan kriteria
 * 
 * FILE INI HANYA UNTUK ROUTING!
 * Semua logic ada di:
 * - usePenerimaanBspsPage hook (orchestrator)
 * Semua UI components ada di: @/components/penerimaan-bsps/
 */

"use client";

import dynamic from "next/dynamic";

// Skeleton loading untuk PenerimaanBspsPage
function PenerimaanBspsSkeleton() {
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
              <div className="h-48 bg-muted rounded-2xl" />
              <div className="h-48 bg-muted rounded-2xl" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Lazy load PenerimaanBspsPage
const PenerimaanBspsPage = dynamic(
  () => import("@/components/penerimaan-bsps/PenerimaanBspsPage"),
  { 
    loading: () => <PenerimaanBspsSkeleton />,
    ssr: false 
  }
);

export default PenerimaanBspsPage;