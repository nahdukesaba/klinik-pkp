"use client";

import dynamic from "next/dynamic";

import { BookOpen } from "lucide-react";
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
          <div className="text-center mb-12 animate-on-scroll">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium mb-4 border border-primary/20">
              <BookOpen className="w-4 h-4" />
              <span>Sosialisasi</span>
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
              Sosialisasi Klinik PKP
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              Informasi kegiatan sosialisasi dan edukasi terkait perumahan dan kawasan permukiman di wilayah Sumatera
            </p>
          </div>

          {/* Map Section */}
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
          />

          {/* Jadwal Section */}
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
            jadwalPage={jadwalLogic.jadwalPage}
            setJadwalPage={jadwalLogic.setJadwalPage}
            jadwalYears={jadwalLogic.jadwalYears}
            paginatedJadwal={jadwalLogic.paginatedJadwal}
            totalPages={jadwalLogic.totalJadwalPages}
            totalResults={jadwalLogic.filteredJadwal.length}
            kabupatenList={jadwalLogic.kabupatenList}
            resetFilters={jadwalLogic.resetFilters}
            hasActiveFilters={jadwalLogic.hasActiveFilters}
            onCardClick={mapLogic.flyToLocation}
          />

          {/* Berita Section */}
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