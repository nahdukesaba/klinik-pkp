"use client";

import { useCallback, useState } from "react";

import { ArrowDown, BookOpen, Newspaper } from "lucide-react";

import "./sosialisasi.css";

import { Footer, Navbar } from "@/components/layout";
import { ApiErrorState, ImageZoomDialog } from "@/components/shared";
import { PKPBeritaSection } from "@/components/sosialisasi-pkp/PKPBeritaSection";
import { PKPJadwalSection } from "@/components/sosialisasi-pkp/PKPJadwalSection";
import { PKPMapSection } from "@/components/sosialisasi-pkp/PKPMapSection";
import { MapSkeleton } from "@/components/ui/skeleton";
import { useSosialisasiPKPPage } from "@/hooks/sosialisasi/use-sosialisasi-pkp-page";
import { useScrollAnimation } from "@/hooks/use-scroll-animation";

// --- Navigation Button Component (Reusable) ---
interface NavButtonProps {
  targetId: string;
  icon: React.ReactNode;
  label: string;
  sublabel?: string;
  variant?: "primary" | "secondary";
}

function NavButton({ targetId, icon, label, sublabel, variant = "secondary" }: NavButtonProps) {
  const handleClick = () => {
    const element = document.getElementById(targetId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const baseClasses = "group flex items-center gap-2 px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200 border";
  const variantClasses = variant === "primary"
    ? "bg-primary text-primary-foreground border-primary hover:bg-primary/90 shadow-lg hover:shadow-xl"
    : "bg-card text-foreground border-border hover:border-primary/50 hover:bg-primary/5";

  return (
    <button onClick={handleClick} className={`${baseClasses} ${variantClasses}`}>
      {icon}
      <span className="flex flex-col items-start">
        <span>{label}</span>
        {sublabel && <span className="text-xs opacity-75">{sublabel}</span>}
      </span>
      <ArrowDown className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" />
    </button>
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
    jadwal,
    map,
    mapLazy,
    refetch,
  } = useSosialisasiPKPPage(handleImageClick);
  const mapLazyRef = mapLazy.ref;
  const isMapMounted = mapLazy.isMounted;

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
          {/* Header */}
          <div className="text-center mb-8 animate-on-scroll">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium mb-4 border border-primary/20">
              <BookOpen className="w-4 h-4" />
              <span>Sosialisasi</span>
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
              Sosialisasi Klinik PKP
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg mb-6">
              Informasi kegiatan sosialisasi dan edukasi terkait perumahan dan kawasan permukiman di wilayah Sumatera
            </p>

            {/* Quick Navigation Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-3">
              <NavButton
                targetId="berita-section"
                icon={<Newspaper className="w-4 h-4" />}
                label="Berita Sosialisasi"
                variant="primary"
              />
            </div>
          </div>

          {/* Map + Jadwal Side by Side on Desktop */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-12">
            {/* Map Section - Larger (3/5) */}
            {/* eslint-disable react-hooks/refs -- useLazyMount returns a callback ref plus a mounted flag */}
            <div ref={mapLazyRef} className="lg:col-span-3 lg:sticky lg:top-24 lg:self-start sosialisasi-map">
              {isMapMounted ? (
                <PKPMapSection
                  mapRef={map.mapRef}
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
                <MapSkeleton className="h-[400px] sm:h-[450px] md:h-[550px] lg:h-[650px] xl:h-[750px]" />
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
              />
            </div>
          </div>

          {/* Berita Section - Full Width */}
          <div id="berita-section" className="scroll-mt-24">
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
