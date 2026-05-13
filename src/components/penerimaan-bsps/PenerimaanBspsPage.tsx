/**
 * PenerimaanBspsPage
 * Container UI untuk halaman Penerimaan BSPS.
 */

"use client";

import { useCallback, useState } from "react";

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
    selectedDesaId,
    handleDesaCardClick,
    isError,
    error,
    refetch,
  } = usePenerimaanBspsPage();
  const mapLazyRef = mapLazy.ref;
  const isMapMounted = mapLazy.isMounted;

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const toggleSidebar = useCallback(() => setSidebarOpen((prev) => !prev), []);
  const closeSidebar = useCallback(() => setSidebarOpen(false), []);

  if (isError) {
    return <ApiErrorState error={error} onRetry={refetch} />;
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />

      <section className="relative pt-20">
        <BspsBackgroundPattern />
      </section>

      {/* eslint-disable react-hooks/refs -- useLazyMount returns a callback ref plus a mounted flag */}
      <section
        id="peta-bsps"
        ref={mapLazyRef}
        className="isolate flex h-screen scroll-mt-16 flex-col lg:scroll-mt-20"
      >
        {isMapMounted ? (
          <BspsMapSection
            filterState={filterState}
            filterActions={filterActions}
            filterLists={filterLists}
            statusLabels={statusLabels}
            statusColors={statusColors}
            mapRef={mapRef}
            isMapReady={isMapReady}
            filteredDesa={filteredDesa}
            selectedDesaId={selectedDesaId}
            sidebarOpen={sidebarOpen}
            onDesaClick={(desa) => {
              closeSidebar();
              handleDesaCardClick(desa);
            }}
            onToggleSidebar={toggleSidebar}
            onCloseSidebar={closeSidebar}
          />
        ) : (
          <MapSkeleton className="h-screen" />
        )}
      </section>
      {/* eslint-enable react-hooks/refs */}

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
