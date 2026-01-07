/**
 * PenerimaanBspsContent Component
 * 
 * DESKRIPSI: Halaman utama Penerimaan BSPS
 * Menggabungkan hooks (logic) dan components (UI)
 * 
 * STRUKTUR:
 * - Logic Filter: usePenerimaanBsps hook
 * - Logic Map: usePenerimaanMap hook
 * - UI: PenerimaanBspsComponents
 * 
 * SAAT PAKAI API BACKEND:
 * - Modifikasi usePenerimaanBsps untuk fetch dari API
 * - Contoh: const { data } = useSWR('/api/penerimaan-bsps')
 */

"use client";

import { Footer, Navbar } from "@/components/layout";
import {
  BspsBackgroundPattern,
  BspsCta,
  BspsHeader,
  BspsInfoCards,
  BspsKriteria,
  BspsMapSection,
  BspsProcessSteps,
  BspsRequirements,
} from "@/components/penerimaan-bsps";
import { usePenerimaanBsps } from "@/hooks/use-penerimaan-bsps";
import { usePenerimaanMap } from "@/hooks/use-penerimaan-map";
import { useScrollAnimation } from "@/hooks/use-scroll-animation";

export default function PenerimaanBspsContent() {
  // ============================================
  // Hooks
  // ============================================
  const ref = useScrollAnimation();
  
  const {
    filteredDesa,
    kabupatenList,
    kecamatanList,
    kelurahanList,
    searchQuery,
    kabupatenFilter,
    kecamatanFilter,
    kelurahanFilter,
    statusFilter,
    activeFilterCount,
    showFilters,
    setSearchQuery,
    setKelurahanFilter,
    setStatusFilter,
    setShowFilters,
    resetFilters,
    handleKabupatenChange,
    handleKecamatanChange,
  } = usePenerimaanBsps();

  const { mapRef } = usePenerimaanMap(filteredDesa);

  // ============================================
  // Prepare Props for Components
  // ============================================
  const filterState = {
    searchQuery,
    kabupatenFilter,
    kecamatanFilter,
    kelurahanFilter,
    statusFilter,
    activeFilterCount,
    showFilters,
  };

  const filterActions = {
    setSearchQuery,
    handleKabupatenChange,
    handleKecamatanChange,
    setKelurahanFilter,
    setStatusFilter,
    setShowFilters,
    resetFilters,
  };

  const filterLists = {
    kabupatenList,
    kecamatanList,
    kelurahanList,
  };

  // ============================================
  // Render
  // ============================================
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main ref={ref} className="pt-24 pb-16">
        <BspsBackgroundPattern />

        <div className="container mx-auto px-4">
          {/* Header */}
          <BspsHeader />

          {/* Map Section */}
          <BspsMapSection
            mapRef={mapRef}
            filterState={filterState}
            filterActions={filterActions}
            filterLists={filterLists}
          />

          {/* Info Cards */}
          <BspsInfoCards />

          {/* Requirements Section */}
          <BspsRequirements />

          {/* Process Steps Section */}
          <BspsProcessSteps />

          {/* Kriteria Section */}
          <BspsKriteria />

          {/* CTA Section */}
          <BspsCta />
        </div>
      </main>

      <Footer />

      {/* Global Styles for Map Markers */}
      <style jsx global>{`
        .custom-marker {
          background: transparent;
          border: none;
        }
      `}</style>
    </div>
  );
}
