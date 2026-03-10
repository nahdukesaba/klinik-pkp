/**
 * Hook: useBeritaDetail
 * Mengelola data dan state detail berita.
 * Mengambil data dari API melalui useSosialisasiQuery.
 */

"use client";

import { useMemo, useState, useCallback } from "react";

import { notFound } from "next/navigation";

import { useSosialisasiQuery } from "@/hooks/sosialisasi/use-sosialisasi-query";
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
  const { berita: beritaList, isLoading, isError, error, refetch } = useSosialisasiQuery();

  const berita = useMemo(() => {
    return beritaList.find((b) => b.id === id) as BeritaDetailData | undefined;
  }, [beritaList, id]);

  // Jangan panggil notFound() saat masih loading
  if (!isLoading && !isError && !berita) {
    notFound();
  }

  const relatedBerita = useMemo(() => {
    if (!berita) return [];
    return beritaList
      .filter((b) => b.id !== id && b.kabupaten === berita.kabupaten)
      .sort((a, b) => new Date(b.rawDate).getTime() - new Date(a.rawDate).getTime())
      .slice(0, 5) as BeritaDetailData[];
  }, [berita, beritaList, id]);

  const displayRelatedBerita = useMemo(() => {
    if (relatedBerita.length >= 5) return relatedBerita;
    const otherBerita = beritaList
      .filter((b) => b.id !== id && !relatedBerita.find((r) => r.id === b.id))
      .sort((a, b) => new Date(b.rawDate).getTime() - new Date(a.rawDate).getTime())
      .slice(0, 5 - relatedBerita.length) as BeritaDetailData[];
    return [...relatedBerita, ...otherBerita];
  }, [relatedBerita, beritaList, id]);

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [carouselState, setCarouselState] = useState<{ images: string[]; currentIndex: number; alt: string } | null>(null);
  const [isCarouselOpen, setIsCarouselOpen] = useState(false);

  const allImages = useMemo(() => {
    if (!berita) return [];
    const images = [berita.image];
    if (berita.images) {
      images.push(...berita.images);
    }
    return images;
  }, [berita]);

  const dayName = berita ? formatDayNameId(berita.rawDate) : "";
  const formattedDate = berita ? formatDateId(berita.rawDate) : "";

  const handleMainImageClick = useCallback(() => {
    if (!berita) return;
    setCarouselState({
      images: allImages,
      currentIndex: activeImageIndex,
      alt: berita.title,
    });
    setIsCarouselOpen(true);
  }, [allImages, activeImageIndex, berita]);

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
    isLoading,
    isError,
    error,
    refetch,
  };
}
