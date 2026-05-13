"use client";

import { useCallback, useState } from "react";

import "./sosialisasi.css";

import { Footer, Navbar } from "@/components/layout";
import { ApiErrorState, ImageZoomDialog } from "@/components/shared";
import { PKPBeritaSection } from "@/components/sosialisasi-pkp/PKPBeritaSection";
import { PKPJadwalSection } from "@/components/sosialisasi-pkp/PKPJadwalSection";
import { PKPMapSection } from "@/components/sosialisasi-pkp/PKPMapSection";
import { useSosialisasiPKPPage } from "@/hooks/sosialisasi/use-sosialisasi-pkp-page";
import { useScrollAnimation } from "@/hooks/use-scroll-animation";

function SosialisasiBeritaSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-8 w-56 animate-pulse rounded bg-muted" />
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="overflow-hidden rounded-xl border border-border bg-card/95 shadow-lg sm:rounded-2xl"
          >
            <div className="aspect-video animate-pulse bg-muted" />
            <div className="space-y-3 p-4">
              <div className="h-5 w-4/5 animate-pulse rounded bg-muted" />
              <div className="h-4 w-full animate-pulse rounded bg-muted" />
              <div className="h-4 w-2/3 animate-pulse rounded bg-muted" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Sosialisasi Klinik PKP Content Component
 * 
 * Halaman untuk menampilkan informasi sosialisasi dan edukasi PKP.
 * Menggunakan hooks untuk logic separation.
 * 
 * @component
 */
function SosialisasiKlinikPKPContent() {
  const ref = useScrollAnimation();
  const [zoomState, setZoomState] = useState<{ images: string[]; index: number; title: string } | null>(null);
  const [isZoomOpen, setIsZoomOpen] = useState(false);

  // Handler untuk image click - defined before hook so it can be passed through
  const handleImageClick = useCallback(
    (images: string[], index: number, title: string) => {
      setZoomState({ images, index, title });
      setIsZoomOpen(true);
    },
    []
  );

  const handleZoomClose = useCallback(() => {
    setIsZoomOpen(false);
  }, []);

  // Hooks untuk logic - pass handleImageClick for map popup image zoom
  const {
    berita,
    error,
    flyToLocation,
    isError,
    isLoading,
    jadwal,
    map,
    mapLazy,
    refetch,
  } = useSosialisasiPKPPage(handleImageClick);
  const mapLazyRef = mapLazy.ref;
  const isMapMounted = mapLazy.isMounted;
  const isInitialJadwalLoading = isLoading && jadwal.filteredJadwal.length === 0;
  const isInitialBeritaLoading = isLoading && berita.filteredBerita.length === 0;

  // Error state tetap full-page karena tidak ada data sama sekali
  if (isError) {
    return <ApiErrorState error={error} onRetry={refetch} />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main ref={ref} className="pt-24 pb-16">
        {/* Background Pattern */}
        <div className="fixed inset-0 -z-10 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-secondary/80 via-background to-accent-2/20 dark:from-background dark:via-primary/5 dark:to-accent/5" />
          <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-accent-2/10 rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto px-4">
          {/* Map + Jadwal Side by Side on Desktop */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-12">
            {/* Map Section - Larger (3/5) */}
            {/* eslint-disable react-hooks/refs -- useLazyMount returns a callback ref plus a mounted flag */}
            <div ref={mapLazyRef} className="lg:col-span-3 lg:sticky lg:top-24 lg:self-start sosialisasi-map">
              {isMapMounted ? (
                <PKPMapSection
                  mapRef={map.mapRef}
                  mapReady={map.mapReady}
                  mapError={map.mapError}
                  filteredLocations={map.filteredMapLocations}
                  mapYear={map.mapYear}
                  setMapYear={map.setMapYear}
                  mapYears={map.mapYears}
                  kabupatenFilter={map.mapKabupatenFilter}
                  setKabupatenFilter={map.setMapKabupatenFilter}
                  kecamatanFilter={map.mapKecamatanFilter}
                  setKecamatanFilter={map.setMapKecamatanFilter}
                  kelurahanFilter={map.mapKelurahanFilter}
                  setKelurahanFilter={map.setMapKelurahanFilter}
                  statusFilter={map.mapStatusFilter}
                  setStatusFilter={map.setMapStatusFilter}
                  kabupatenList={map.mapKabupatenList}
                  kecamatanList={map.mapKecamatanList}
                  kelurahanList={map.mapKelurahanList}
                  showFilters={map.mapShowFilters}
                  setShowFilters={map.setMapShowFilters}
                  searchQuery={map.mapSearchQuery}
                  setSearchQuery={map.setMapSearchQuery}
                  compact={true}
                />
              ) : (
                <div className="rounded-xl border border-border bg-card/95 p-6 text-sm text-muted-foreground shadow-lg">
                </div>
              )}
            </div>
            {/* eslint-enable react-hooks/refs */}

            {/* Jadwal Section - Scrollable (2/5) */}
            <div id="jadwal-section" className="lg:col-span-2 scroll-mt-24">
              <PKPJadwalSection
                jadwalYear={jadwal.jadwalYear}
                setJadwalYear={jadwal.setJadwalYear}
                jadwalMonth={jadwal.jadwalMonth}
                setJadwalMonth={jadwal.setJadwalMonth}
                jadwalStartDate={jadwal.jadwalStartDate}
                setJadwalStartDate={jadwal.setJadwalStartDate}
                jadwalEndDate={jadwal.jadwalEndDate}
                setJadwalEndDate={jadwal.setJadwalEndDate}
                jadwalSearch={jadwal.jadwalSearch}
                setJadwalSearch={jadwal.setJadwalSearch}
                jadwalKabupatenFilter={jadwal.jadwalKabupatenFilter}
                setJadwalKabupatenFilter={jadwal.setJadwalKabupatenFilter}
                jadwalYears={jadwal.jadwalYears}
                filteredJadwal={jadwal.filteredJadwal}
                totalResults={jadwal.filteredJadwal.length}
                kabupatenList={jadwal.kabupatenList}
                resetFilters={jadwal.resetFilters}
                hasActiveFilters={jadwal.hasActiveFilters}
                onCardClick={flyToLocation}
                compact={true}
                isLoading={isInitialJadwalLoading}
              />
            </div>
          </div>

          {/* Berita Section - Full Width */}
          <div id="berita-section" className="scroll-mt-24">
            {isInitialBeritaLoading ? (
              <SosialisasiBeritaSkeleton />
            ) : (
              <PKPBeritaSection
                  beritaYear={berita.beritaYear}
                  setBeritaYear={berita.setBeritaYear}
                  beritaMonth={berita.beritaMonth}
                  setBeritaMonth={berita.setBeritaMonth}
                  beritaStartDate={berita.beritaStartDate}
                  setBeritaStartDate={berita.setBeritaStartDate}
                  beritaEndDate={berita.beritaEndDate}
                  setBeritaEndDate={berita.setBeritaEndDate}
                  beritaSearch={berita.beritaSearch}
                  setBeritaSearch={berita.setBeritaSearch}
                  beritaYears={berita.beritaYears}
                  filteredBerita={berita.filteredBerita}
                  paginatedBerita={berita.paginatedBerita}
                  pagination={berita.pagination}
                  resetFilters={berita.resetFilters}
                  hasActiveFilters={berita.hasActiveFilters}
                  onImageClick={handleImageClick}
                  onViewOnMap={flyToLocation}
                />
            )}
          </div>
        </div>

        <Footer />
      </main>
      {/* Image Zoom Modal */}
      {zoomState && (
        <ImageZoomDialog
          images={zoomState.images}
          initialIndex={zoomState.index}
          title={zoomState.title}
          isOpen={isZoomOpen}
          onClose={handleZoomClose}
        />
      )}
    </div>
  );
}

export default SosialisasiKlinikPKPContent;
