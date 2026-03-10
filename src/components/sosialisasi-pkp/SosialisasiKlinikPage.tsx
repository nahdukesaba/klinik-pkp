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

// ============================================
// Navigation Button Component (Reusable)
// ============================================
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

  const baseClasses = "group flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 border";
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
  const pageLogic = useSosialisasiPKPPage(handleImageClick);

  // Error state tetap full-page karena tidak ada data sama sekali
  if (pageLogic.isError) {
    return <ApiErrorState error={pageLogic.error} onRetry={pageLogic.refetch} />;
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
            <div ref={pageLogic.mapLazy.ref} className="lg:col-span-3 lg:sticky lg:top-24 lg:self-start">
              {pageLogic.mapLazy.isMounted ? (
                <PKPMapSection
                  mapRef={pageLogic.map.mapRef}
                  filteredLocations={pageLogic.map.filteredMapLocations}
                  mapYear={pageLogic.map.mapYear}
                  setMapYear={pageLogic.map.setMapYear}
                  mapYears={pageLogic.map.mapYears}
                  kabupatenFilter={pageLogic.map.mapKabupatenFilter}
                  setKabupatenFilter={pageLogic.map.setMapKabupatenFilter}
                  kecamatanFilter={pageLogic.map.mapKecamatanFilter}
                  setKecamatanFilter={pageLogic.map.setMapKecamatanFilter}
                  kelurahanFilter={pageLogic.map.mapKelurahanFilter}
                  setKelurahanFilter={pageLogic.map.setMapKelurahanFilter}
                  statusFilter={pageLogic.map.mapStatusFilter}
                  setStatusFilter={pageLogic.map.setMapStatusFilter}
                  kabupatenList={pageLogic.map.mapKabupatenList}
                  kecamatanList={pageLogic.map.mapKecamatanList}
                  kelurahanList={pageLogic.map.mapKelurahanList}
                  showFilters={pageLogic.map.mapShowFilters}
                  setShowFilters={pageLogic.map.setMapShowFilters}
                  searchQuery={pageLogic.map.mapSearchQuery}
                  setSearchQuery={pageLogic.map.setMapSearchQuery}
                  compact={true}
                />
              ) : (
                <MapSkeleton className="h-[400px] sm:h-[450px] md:h-[550px] lg:h-[650px] xl:h-[750px]" />
              )}
            </div>

            {/* Jadwal Section - Scrollable (2/5) */}
            <div id="jadwal-section" className="lg:col-span-2 scroll-mt-24">
                <PKPJadwalSection
                jadwalYear={pageLogic.jadwal.jadwalYear}
                setJadwalYear={pageLogic.jadwal.setJadwalYear}
                jadwalMonth={pageLogic.jadwal.jadwalMonth}
                setJadwalMonth={pageLogic.jadwal.setJadwalMonth}
                jadwalStartDate={pageLogic.jadwal.jadwalStartDate}
                setJadwalStartDate={pageLogic.jadwal.setJadwalStartDate}
                jadwalEndDate={pageLogic.jadwal.jadwalEndDate}
                setJadwalEndDate={pageLogic.jadwal.setJadwalEndDate}
                jadwalSearch={pageLogic.jadwal.jadwalSearch}
                setJadwalSearch={pageLogic.jadwal.setJadwalSearch}
                jadwalKabupatenFilter={pageLogic.jadwal.jadwalKabupatenFilter}
                setJadwalKabupatenFilter={pageLogic.jadwal.setJadwalKabupatenFilter}
                jadwalYears={pageLogic.jadwal.jadwalYears}
                filteredJadwal={pageLogic.jadwal.filteredJadwal}
                totalResults={pageLogic.jadwal.filteredJadwal.length}
                kabupatenList={pageLogic.jadwal.kabupatenList}
                resetFilters={pageLogic.jadwal.resetFilters}
                hasActiveFilters={pageLogic.jadwal.hasActiveFilters}
                onCardClick={pageLogic.flyToLocation}
                compact={true}
              />
            </div>
          </div>

          {/* Berita Section - Full Width */}
          <div id="berita-section" className="scroll-mt-24">
              <PKPBeritaSection
                beritaYear={pageLogic.berita.beritaYear}
                setBeritaYear={pageLogic.berita.setBeritaYear}
                beritaMonth={pageLogic.berita.beritaMonth}
                setBeritaMonth={pageLogic.berita.setBeritaMonth}
                beritaStartDate={pageLogic.berita.beritaStartDate}
                setBeritaStartDate={pageLogic.berita.setBeritaStartDate}
                beritaEndDate={pageLogic.berita.beritaEndDate}
                setBeritaEndDate={pageLogic.berita.setBeritaEndDate}
                beritaSearch={pageLogic.berita.beritaSearch}
                setBeritaSearch={pageLogic.berita.setBeritaSearch}
                beritaYears={pageLogic.berita.beritaYears}
                filteredBerita={pageLogic.berita.filteredBerita}
                paginatedBerita={pageLogic.berita.paginatedBerita}
                pagination={pageLogic.berita.pagination}
                resetFilters={pageLogic.berita.resetFilters}
                hasActiveFilters={pageLogic.berita.hasActiveFilters}
                onImageClick={handleImageClick}
                onViewOnMap={pageLogic.flyToLocation}
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
