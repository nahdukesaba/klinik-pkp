/**
 * PenerimaanBspsPage
 * Container UI untuk halaman Penerimaan BSPS.
 *
 * Layout:
 * 1. Navbar
 * 2. Hero/Description Section (BSPS info + Peta Lokasi Penerima BSPS)
 * 3. Full-screen Map Section (like Kawasan Kumuh) — sticky saat scroll
 * 4. Information Sections (Persyaratan, Prosedur, Kriteria, CTA)
 * 5. Footer
 */

"use client";

import { useState, useCallback } from "react";

import { Building2 } from "lucide-react";

import { Footer, Navbar } from "@/components/layout";
import { BspsMapSection } from "@/components/penerimaan-bsps/BspsMapSection";
import {
  BspsBackgroundPattern,
  BspsCta,
  BspsInfoCards,
  BspsKriteria,
  BspsProcessSteps,
  BspsRequirements,
} from "@/components/penerimaan-bsps/BspsSections";
import { ApiErrorState } from "@/components/shared";
import { MapSkeleton } from "@/components/ui/skeleton";
import { usePenerimaanBspsPage } from "@/hooks/penerimaan-bsps/use-penerimaan-bsps-page";

export default function PenerimaanBspsPage() {
  const {
    ref,
    mapLazy,
    filteredDesa,
    filterState,
    filterActions,
    filterLists,
    processSteps,
    requirements,
    kriteriaUtama,
    prioritasPenerima,
    statusLabels,
    statusColors,
    mapRef,
    isMapReady,
    isError,
    error,
    refetch,
  } = usePenerimaanBspsPage();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const toggleSidebar = useCallback(() => setSidebarOpen((prev) => !prev), []);
  const closeSidebar = useCallback(() => setSidebarOpen(false), []);

  // Tampilkan error state jika gagal mengambil data
  if (isError) {
    return <ApiErrorState error={error} onRetry={refetch} />;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      {/* Hero / Description Section */}
      <section className="pt-24 pb-12 relative">
        <BspsBackgroundPattern />
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium mb-4 border border-primary/20">
              <Building2 className="w-4 h-4" />
              <span>BSPS</span>
            </div>

            {/* Title */}
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
              Penerimaan BSPS
            </h1>

            {/* Description */}
            <p className="text-muted-foreground text-lg mb-6 leading-relaxed">
              Bantuan Stimulan Perumahan Swadaya (BSPS) untuk masyarakat
              berpenghasilan rendah dalam memperbaiki atau membangun rumah.
            </p>
          </div>
        </div>
      </section>

      {/* Full-screen Map Section (like Kawasan Kumuh) */}
      <section id="peta-bsps" ref={mapLazy.ref} className="h-screen flex flex-col scroll-mt-16 lg:scroll-mt-20 isolate">
        {mapLazy.isMounted ? (
          <BspsMapSection
            filterState={filterState}
            filterActions={filterActions}
            filterLists={filterLists}
            statusLabels={statusLabels}
            statusColors={statusColors}
            mapRef={mapRef}
            isMapReady={isMapReady}
            filteredDesa={filteredDesa}
            sidebarOpen={sidebarOpen}
            onToggleSidebar={toggleSidebar}
            onCloseSidebar={closeSidebar}
          />
        ) : (
          <MapSkeleton className="h-screen" />
        )}
      </section>

      {/* Information Sections */}
      <main ref={ref} className="py-16">
        <div className="container mx-auto px-4">
          <BspsInfoCards />

          <BspsRequirements requirements={requirements} />

          <BspsProcessSteps
            processSteps={processSteps.steps}
            hoveredStep={processSteps.hoveredStep}
            setHoveredStep={processSteps.setHoveredStep}
            firstRow={processSteps.firstRow}
            secondRow={processSteps.secondRow}
            secondRowReversed={processSteps.secondRowReversed}
          />

          <BspsKriteria
            kriteriaUtama={kriteriaUtama}
            prioritasPenerima={prioritasPenerima}
          />

          <BspsCta />
        </div>
      </main>

      <Footer />
    </div>
  );
}
