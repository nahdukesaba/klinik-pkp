"use client";

/**
 * Berita Detail Page Component
 * 
 * Client wrapper yang menggabungkan useBeritaDetail hook dengan BeritaDetailView.
 * Digunakan oleh page.tsx untuk routing.
 * 
 * @component
 */

import BeritaDetailView from "@/components/berita/BeritaDetailView";
import { ApiLoadingState, ApiErrorState } from "@/components/shared";
import { useBeritaDetail } from "@/hooks/berita/use-berita-detail";

interface BeritaDetailPageProps {
  id: number;
}

export default function BeritaDetailPage({ id }: BeritaDetailPageProps) {
  const {
    berita,
    relatedBerita,
    allImages,
    activeImageIndex,
    setActiveImageIndex,
    dayName,
    formattedDate,
    handleMainImageClick,
    goToPrevImage,
    goToNextImage,
    carousel,
    isLoading,
    isError,
    error,
    refetch,
  } = useBeritaDetail(id);

  // Tampilkan loading state saat data sedang dimuat dari API
  if (isLoading) {
    return <ApiLoadingState message="Memuat detail berita..." />;
  }

  // Tampilkan error state jika gagal mengambil data
  if (isError) {
    return <ApiErrorState error={error} onRetry={refetch} />;
  }

  // Jika berita tidak ditemukan, hook akan meneruskan ke notFound()
  if (!berita) return null;

  return (
    <BeritaDetailView
      berita={berita}
      relatedItems={relatedBerita}
      allImages={allImages}
      activeImageIndex={activeImageIndex}
      dayName={dayName}
      formattedDate={formattedDate}
      onMainImageClick={handleMainImageClick}
      onPrevImage={goToPrevImage}
      onNextImage={goToNextImage}
      onSelectImage={setActiveImageIndex}
      carouselState={carousel.state}
      isCarouselOpen={carousel.isOpen}
      onCarouselClose={carousel.closeCarousel}
    />
  );
}
