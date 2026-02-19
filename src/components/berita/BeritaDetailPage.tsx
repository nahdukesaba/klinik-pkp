"use client";

/**
 * Berita Detail Page Component
 * 
 * Client wrapper yang menggabungkan useBeritaDetail hook dengan BeritaDetailView.
 * Digunakan oleh page.tsx untuk routing.
 * 
 * @component
 */

import { useParams } from "next/navigation";

import BeritaDetailView from "@/components/berita/BeritaDetailView";
import { useBeritaDetail } from "@/hooks/berita/use-berita-detail";

export default function BeritaDetailPage() {
  const params = useParams();
  const id = Number(params.id);

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
  } = useBeritaDetail(id);

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
