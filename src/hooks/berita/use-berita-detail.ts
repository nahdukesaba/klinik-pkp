/**
 * Hook: useBeritaDetail
 * Mengelola data dan state detail berita.
 */

"use client";

import { useMemo, useState, useCallback } from "react";

import { notFound } from "next/navigation";

import { beritaSosialisasiList } from "@/data/sosialisasi-klinik";
import { formatDateId, formatDayNameId } from "@/lib/date";

export interface BeritaDetailData {
  id: number;
  title: string;
  description: string;
  kabupaten: string;
  image: string;
  images?: string[];
  rawDate: string;
  date: string;
  peserta?: number;
  coordinates: [number, number];
}

export function useBeritaDetail(id: number) {
  const berita = useMemo(() => {
    return beritaSosialisasiList.find((b) => b.id === id) as BeritaDetailData | undefined;
  }, [id]);

  if (!berita) {
    notFound();
  }

  const relatedBerita = useMemo(() => {
    return beritaSosialisasiList
      .filter((b) => b.id !== id && b.kabupaten === berita.kabupaten)
      .sort((a, b) => new Date(b.rawDate).getTime() - new Date(a.rawDate).getTime())
      .slice(0, 5) as BeritaDetailData[];
  }, [berita, id]);

  const displayRelatedBerita = useMemo(() => {
    if (relatedBerita.length >= 5) return relatedBerita;
    const otherBerita = beritaSosialisasiList
      .filter((b) => b.id !== id && !relatedBerita.find((r) => r.id === b.id))
      .sort((a, b) => new Date(b.rawDate).getTime() - new Date(a.rawDate).getTime())
      .slice(0, 5 - relatedBerita.length) as BeritaDetailData[];
    return [...relatedBerita, ...otherBerita];
  }, [relatedBerita, id]);

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [carouselState, setCarouselState] = useState<{ images: string[]; currentIndex: number; alt: string } | null>(null);
  const [isCarouselOpen, setIsCarouselOpen] = useState(false);

  const allImages = useMemo(() => {
    const images = [berita.image];
    if (berita.images) {
      images.push(...berita.images);
    }
    return images;
  }, [berita]);

  const dayName = formatDayNameId(berita.rawDate);
  const formattedDate = formatDateId(berita.rawDate);

  const handleMainImageClick = useCallback(() => {
    setCarouselState({
      images: allImages,
      currentIndex: activeImageIndex,
      alt: berita.title,
    });
    setIsCarouselOpen(true);
  }, [allImages, activeImageIndex, berita.title]);

  const closeCarousel = useCallback(() => {
    setIsCarouselOpen(false);
  }, []);

  const goToPrevImage = useCallback(() => {
    setActiveImageIndex((prev) => (prev > 0 ? prev - 1 : allImages.length - 1));
  }, [allImages.length]);

  const goToNextImage = useCallback(() => {
    setActiveImageIndex((prev) => (prev < allImages.length - 1 ? prev + 1 : 0));
  }, [allImages.length]);

  return {
    berita,
    relatedBerita: displayRelatedBerita,
    allImages,
    activeImageIndex,
    setActiveImageIndex,
    dayName,
    formattedDate,
    handleMainImageClick,
    goToPrevImage,
    goToNextImage,
    carousel: {
      state: carouselState,
      isOpen: isCarouselOpen,
      closeCarousel,
    },
  };
}
