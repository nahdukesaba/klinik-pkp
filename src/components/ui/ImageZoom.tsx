"use client";

import { useState, useRef, useCallback, useEffect } from "react";

import Image from "next/image";

import { X, ZoomIn, ZoomOut, ChevronLeft, ChevronRight } from "lucide-react";

// ============================================
// Types & Interfaces
// ============================================
interface ImageZoomProps {
  src: string;
  alt: string;
  isOpen: boolean;
  onClose: () => void;
}

interface ImageCarouselZoomProps {
  images: string[];
  currentIndex: number;
  alt: string;
  isOpen: boolean;
  onClose: () => void;
  onIndexChange?: (index: number) => void;
}

// ============================================
// Custom Cursor Styles (White Icons - Smooth & Thin)
// ============================================
const cursorZoomIn = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Ccircle cx='11' cy='11' r='8'/%3E%3Cline x1='21' y1='21' x2='16.65' y2='16.65'/%3E%3Cline x1='11' y1='8' x2='11' y2='14'/%3E%3Cline x1='8' y1='11' x2='14' y2='11'/%3E%3C/svg%3E") 16 16, zoom-in`;

const cursorZoomOut = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Ccircle cx='11' cy='11' r='8'/%3E%3Cline x1='21' y1='21' x2='16.65' y2='16.65'/%3E%3Cline x1='8' y1='11' x2='14' y2='11'/%3E%3C/svg%3E") 16 16, zoom-out`;

// ============================================
// Single Image Zoom Component
// ============================================
export function ImageZoom({ src, alt, isOpen, onClose }: ImageZoomProps) {
  const [isZoomed, setIsZoomed] = useState(false);
  const [transformOrigin, setTransformOrigin] = useState("center center");
  const containerRef = useRef<HTMLDivElement>(null);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setIsZoomed(false);
      setTransformOrigin("center center");
    }
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  const handleImageClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      e.stopPropagation();

      if (!isZoomed) {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        setTransformOrigin(`${x}% ${y}%`);
        setIsZoomed(true);
      } else {
        setIsZoomed(false);
        setTransformOrigin("center center");
      }
    },
    [isZoomed]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!isZoomed || !containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const x = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
      const y = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));

      setTransformOrigin(`${x}% ${y}%`);
    },
    [isZoomed]
  );

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/95"
      onClick={onClose}
    >
      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-50 p-2.5 bg-white/10 hover:bg-white/20 rounded-full transition-colors backdrop-blur-sm"
        aria-label="Tutup"
      >
        <X className="w-6 h-6 text-white" />
      </button>

      {/* Zoom Status */}
      <div className="absolute top-4 left-4 z-50 flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full backdrop-blur-sm">
        {isZoomed ? (
          <>
            <ZoomOut className="w-4 h-4 text-white" />
            <span className="text-sm text-white font-medium">Klik untuk memperkecil</span>
          </>
        ) : (
          <>
            <ZoomIn className="w-4 h-4 text-white" />
            <span className="text-sm text-white font-medium">Klik untuk memperbesar</span>
          </>
        )}
      </div>

      {/* Image Container */}
      <div
        ref={containerRef}
        className="relative w-full h-full max-w-[90vw] max-h-[90vh] flex items-center justify-center overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        onMouseMove={handleMouseMove}
        style={{ cursor: isZoomed ? cursorZoomOut : cursorZoomIn }}
      >
        <div
          className="relative w-full h-full transition-transform duration-300 ease-out"
          style={{
            transform: isZoomed ? "scale(2.5)" : "scale(1)",
            transformOrigin: transformOrigin,
          }}
          onClick={handleImageClick}
        >
          <Image
            src={src}
            alt={alt}
            fill
            className="object-contain select-none"
            sizes="90vw"
            priority
            draggable={false}
          />
        </div>
      </div>

      {/* Instructions */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2 bg-white/10 rounded-full backdrop-blur-sm">
        <span className="text-sm text-white/80">
          {isZoomed ? "Gerakkan mouse untuk menggeser • Klik untuk memperkecil" : "Klik gambar untuk memperbesar"}
        </span>
      </div>
    </div>
  );
}

// ============================================
// Image Carousel with Zoom Component
// Supports multiple images with navigation
// ============================================
export function ImageCarouselZoom({
  images,
  currentIndex,
  alt,
  isOpen,
  onClose,
  onIndexChange,
}: ImageCarouselZoomProps) {
  const [activeIndex, setActiveIndex] = useState(currentIndex);
  const [isZoomed, setIsZoomed] = useState(false);
  const [transformOrigin, setTransformOrigin] = useState("center center");
  const containerRef = useRef<HTMLDivElement>(null);

  // Sync with external currentIndex
  useEffect(() => {
    setActiveIndex(currentIndex);
  }, [currentIndex]);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setIsZoomed(false);
      setTransformOrigin("center center");
    }
  }, [isOpen]);

  const goToNext = useCallback(() => {
    if (isZoomed) return;
    const newIndex = activeIndex < images.length - 1 ? activeIndex + 1 : 0;
    setActiveIndex(newIndex);
    onIndexChange?.(newIndex);
  }, [activeIndex, images.length, isZoomed, onIndexChange]);

  const goToPrev = useCallback(() => {
    if (isZoomed) return;
    const newIndex = activeIndex > 0 ? activeIndex - 1 : images.length - 1;
    setActiveIndex(newIndex);
    onIndexChange?.(newIndex);
  }, [activeIndex, images.length, isZoomed, onIndexChange]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft" && !isZoomed) goToPrev();
      if (e.key === "ArrowRight" && !isZoomed) goToNext();
    };

    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, isZoomed, onClose, goToPrev, goToNext]);

  const handleImageClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      e.stopPropagation();

      if (!isZoomed) {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        setTransformOrigin(`${x}% ${y}%`);
        setIsZoomed(true);
      } else {
        setIsZoomed(false);
        setTransformOrigin("center center");
      }
    },
    [isZoomed]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!isZoomed || !containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const x = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
      const y = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));

      setTransformOrigin(`${x}% ${y}%`);
    },
    [isZoomed]
  );

  if (!isOpen || images.length === 0) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/95"
      onClick={onClose}
    >
      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-50 p-2.5 bg-white/10 hover:bg-white/20 rounded-full transition-colors backdrop-blur-sm"
        aria-label="Tutup"
      >
        <X className="w-6 h-6 text-white" />
      </button>

      {/* Zoom Status */}
      <div className="absolute top-4 left-4 z-50 flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full backdrop-blur-sm">
        {isZoomed ? (
          <>
            <ZoomOut className="w-4 h-4 text-white" />
            <span className="text-sm text-white font-medium">Klik untuk memperkecil</span>
          </>
        ) : (
          <>
            <ZoomIn className="w-4 h-4 text-white" />
            <span className="text-sm text-white font-medium">Klik untuk memperbesar</span>
          </>
        )}
      </div>

      {/* Image Counter */}
      {images.length > 1 && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2 bg-white/10 rounded-full backdrop-blur-sm">
          <span className="text-sm text-white font-medium">
            {activeIndex + 1} / {images.length}
          </span>
        </div>
      )}

      {/* Navigation Arrows */}
      {images.length > 1 && !isZoomed && (
        <>
          <button
            onClick={(e) => {
              e.stopPropagation();
              goToPrev();
            }}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-50 p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors backdrop-blur-sm"
            aria-label="Sebelumnya"
          >
            <ChevronLeft className="w-6 h-6 text-white" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              goToNext();
            }}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-50 p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors backdrop-blur-sm"
            aria-label="Selanjutnya"
          >
            <ChevronRight className="w-6 h-6 text-white" />
          </button>
        </>
      )}

      {/* Image Container */}
      <div
        ref={containerRef}
        className="relative w-full h-full max-w-[90vw] max-h-[85vh] flex items-center justify-center overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        onMouseMove={handleMouseMove}
        style={{ cursor: isZoomed ? cursorZoomOut : cursorZoomIn }}
      >
        <div
          className="relative w-full h-full transition-transform duration-300 ease-out"
          style={{
            transform: isZoomed ? "scale(2.5)" : "scale(1)",
            transformOrigin: transformOrigin,
          }}
          onClick={handleImageClick}
        >
          <Image
            src={images[activeIndex]}
            alt={`${alt} - ${activeIndex + 1}`}
            fill
            className="object-contain select-none"
            sizes="90vw"
            priority
            draggable={false}
          />
        </div>
      </div>

      {/* Thumbnail Strip */}
      {images.length > 1 && !isZoomed && (
        <div className="absolute bottom-16 left-1/2 -translate-x-1/2 z-50 flex gap-2 px-4 py-2 bg-white/10 rounded-xl backdrop-blur-sm">
          {images.map((img, idx) => (
            <button
              key={idx}
              onClick={(e) => {
                e.stopPropagation();
                setActiveIndex(idx);
                onIndexChange?.(idx);
              }}
              className={`relative w-12 h-12 rounded-lg overflow-hidden border-2 transition-all ${
                idx === activeIndex
                  ? "border-white scale-110"
                  : "border-transparent opacity-60 hover:opacity-100"
              }`}
            >
              <Image
                src={img}
                alt={`Thumbnail ${idx + 1}`}
                fill
                className="object-cover"
                sizes="48px"
              />
            </button>
          ))}
        </div>
      )}

      {/* Instructions */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2 bg-white/10 rounded-full backdrop-blur-sm">
        <span className="text-sm text-white/80">
          {isZoomed
            ? "Gerakkan mouse untuk menggeser • Klik untuk memperkecil"
            : images.length > 1
            ? "← → untuk navigasi • Klik gambar untuk memperbesar"
            : "Klik gambar untuk memperbesar"}
        </span>
      </div>
    </div>
  );
}

// ============================================
// Hook for Image Preview State
// ============================================
export function useImagePreview() {
  const [previewImage, setPreviewImage] = useState<{ src: string; alt: string } | null>(null);

  const openPreview = useCallback((src: string, alt: string) => {
    setPreviewImage({ src, alt });
  }, []);

  const closePreview = useCallback(() => {
    setPreviewImage(null);
  }, []);

  return {
    previewImage,
    openPreview,
    closePreview,
    isOpen: previewImage !== null,
  };
}

// ============================================
// Hook for Carousel Preview State
// ============================================
export function useCarouselPreview() {
  const [state, setState] = useState<{
    images: string[];
    currentIndex: number;
    alt: string;
  } | null>(null);

  const openCarousel = useCallback((images: string[], currentIndex: number, alt: string) => {
    setState({ images, currentIndex, alt });
  }, []);

  const closeCarousel = useCallback(() => {
    setState(null);
  }, []);

  const setIndex = useCallback((index: number) => {
    setState((prev) => (prev ? { ...prev, currentIndex: index } : null));
  }, []);

  return {
    state,
    openCarousel,
    closeCarousel,
    setIndex,
    isOpen: state !== null,
  };
}

export default ImageZoom;
