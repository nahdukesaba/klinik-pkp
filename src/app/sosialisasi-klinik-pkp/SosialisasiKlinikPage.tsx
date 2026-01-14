"use client";

import dynamic from "next/dynamic";

import { ArrowDown, BookOpen, Calendar, Newspaper } from "lucide-react";
import "./sosialisasi.css";

import { Footer, Navbar } from "@/components/layout";
import { PKPBeritaSection } from "@/components/sosialisasi-pkp/PKPBeritaSection";
import { PKPJadwalSection } from "@/components/sosialisasi-pkp/PKPJadwalSection";
import { PKPMapSection } from "@/components/sosialisasi-pkp/PKPMapSection";
import { ImageCarouselZoom, useCarouselPreview } from "@/components/ui/ImageZoom";
import {
  useSosialisasiPKPMap,
  useSosialisasiPKPJadwal,
  useSosialisasiPKPBerita,
  useScrollAnimation,
} from "@/hooks";

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

function SosialisasiKlinikPKPContent() {
  const ref = useScrollAnimation();
  const carousel = useCarouselPreview();

  // Hooks untuk logic (sudah dipisah ke folder hooks)
  const mapLogic = useSosialisasiPKPMap();
  const jadwalLogic = useSosialisasiPKPJadwal();
  const beritaLogic = useSosialisasiPKPBerita();

  // Handler untuk image click - digunakan oleh map popup dan berita
  const handleImageClick = (images: string[], index: number, title: string) => {
    carousel.openCarousel(images, index, title);
  };

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
            <div className="lg:col-span-3 lg:sticky lg:top-24 lg:self-start">
              <PKPMapSection
                mapRef={mapLogic.mapRef}
                filteredLocations={mapLogic.filteredMapLocations}
                kabupatenFilter={mapLogic.mapKabupatenFilter}
                setKabupatenFilter={mapLogic.setMapKabupatenFilter}
                kecamatanFilter={mapLogic.mapKecamatanFilter}
                setKecamatanFilter={mapLogic.setMapKecamatanFilter}
                kelurahanFilter={mapLogic.mapKelurahanFilter}
                setKelurahanFilter={mapLogic.setMapKelurahanFilter}
                statusFilter={mapLogic.mapStatusFilter}
                setStatusFilter={mapLogic.setMapStatusFilter}
                kabupatenList={mapLogic.mapKabupatenList}
                kecamatanList={mapLogic.mapKecamatanList}
                kelurahanList={mapLogic.mapKelurahanList}
                initializeMap={mapLogic.initializeMap}
                cleanupMap={mapLogic.cleanupMap}
                updateMarkers={mapLogic.updateMarkers}
                mapReady={mapLogic.mapReady}
                onImageClick={handleImageClick}
                showFilters={mapLogic.mapShowFilters}
                setShowFilters={mapLogic.setMapShowFilters}
                searchQuery={mapLogic.mapSearchQuery}
                setSearchQuery={mapLogic.setMapSearchQuery}
                compact={true}
              />
            </div>

            {/* Jadwal Section - Scrollable (2/5) */}
            <div id="jadwal-section" className="lg:col-span-2 scroll-mt-24">
              <PKPJadwalSection
                jadwalYear={jadwalLogic.jadwalYear}
                setJadwalYear={jadwalLogic.setJadwalYear}
                jadwalMonth={jadwalLogic.jadwalMonth}
                setJadwalMonth={jadwalLogic.setJadwalMonth}
                jadwalStartDate={jadwalLogic.jadwalStartDate}
                setJadwalStartDate={jadwalLogic.setJadwalStartDate}
                jadwalEndDate={jadwalLogic.jadwalEndDate}
                setJadwalEndDate={jadwalLogic.setJadwalEndDate}
                jadwalSearch={jadwalLogic.jadwalSearch}
                setJadwalSearch={jadwalLogic.setJadwalSearch}
                jadwalKabupatenFilter={jadwalLogic.jadwalKabupatenFilter}
                setJadwalKabupatenFilter={jadwalLogic.setJadwalKabupatenFilter}
                jadwalYears={jadwalLogic.jadwalYears}
                filteredJadwal={jadwalLogic.filteredJadwal}
                totalResults={jadwalLogic.filteredJadwal.length}
                kabupatenList={jadwalLogic.kabupatenList}
                resetFilters={jadwalLogic.resetFilters}
                hasActiveFilters={jadwalLogic.hasActiveFilters}
                onCardClick={mapLogic.flyToLocation}
                compact={true}
              />
            </div>
          </div>

          {/* Berita Section - Full Width */}
          <div id="berita-section" className="scroll-mt-24">
            <PKPBeritaSection
              beritaYear={beritaLogic.beritaYear}
              setBeritaYear={beritaLogic.setBeritaYear}
              beritaMonth={beritaLogic.beritaMonth}
              setBeritaMonth={beritaLogic.setBeritaMonth}
              beritaStartDate={beritaLogic.beritaStartDate}
              setBeritaStartDate={beritaLogic.setBeritaStartDate}
              beritaEndDate={beritaLogic.beritaEndDate}
              setBeritaEndDate={beritaLogic.setBeritaEndDate}
              beritaSearch={beritaLogic.beritaSearch}
              setBeritaSearch={beritaLogic.setBeritaSearch}
              beritaYears={beritaLogic.beritaYears}
              filteredBerita={beritaLogic.filteredBerita}
              resetFilters={beritaLogic.resetFilters}
              hasActiveFilters={beritaLogic.hasActiveFilters}
              onImageClick={handleImageClick}
              onViewOnMap={mapLogic.flyToLocation}
            />
          </div>

          <Footer />
        </div>
      </main>
      {/* Image Carousel Zoom Modal */}
      {carousel.state && (
        <ImageCarouselZoom
          images={carousel.state.images}
          currentIndex={carousel.state.currentIndex}
          alt={carousel.state.alt}
          isOpen={carousel.isOpen}
          onClose={carousel.closeCarousel}
          onIndexChange={carousel.setIndex}
        />
      )}
    </div>
  );
}


const SosialisasiKlinikPKPPage = dynamic(() => Promise.resolve(SosialisasiKlinikPKPContent), { ssr: false });

export default SosialisasiKlinikPKPPage;