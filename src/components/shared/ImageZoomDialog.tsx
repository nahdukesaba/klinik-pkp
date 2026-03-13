/**
 * ImageZoomDialog - Reusable Component
 * 
 * Dialog untuk preview gambar dengan fitur zoom pan pinch.
 * Digunakan di berbagai halaman: Bank Desain, Berita, Sosialisasi, dll.
 * 
 * @features
 * - Zoom in/out dengan tombol atau scroll
 * - Pan (geser) gambar saat zoom
 * - Double-click untuk zoom
 * - Navigasi antar gambar dengan arrow keys
 * - Thumbnail untuk quick navigation
 * - Keyboard shortcuts (Arrow Left/Right, Escape)
 */

"use client";

import { useState, useCallback, useRef, useEffect } from "react";

import Image from "next/image";

import { 
  ChevronLeft, 
  ChevronRight, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw,
} from "lucide-react";
import { TransformWrapper, TransformComponent, useControls, ReactZoomPanPinchContentRef } from "react-zoom-pan-pinch";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// --- Types & Interfaces ---

export interface ImageZoomDialogProps {
  /** Array gambar yang akan ditampilkan */
  images: string[];
  /** Index gambar yang aktif (default: 0) */
  initialIndex?: number;
  /** Judul dialog */
  title?: string;
  /** Status dialog open/close */
  isOpen: boolean;
  /** Callback saat dialog ditutup */
  onClose: () => void;
  /** Ukuran container image (default: 60vh) */
  imageHeight?: string;
  /** Tampilkan thumbnail? (default: true jika multiple images) */
  showThumbnails?: boolean;
}

// --- Zoom Controls Component ---

function ZoomControls() {
  const { zoomIn, zoomOut, resetTransform } = useControls();

  return (
    <div className="absolute top-3 right-3 z-20 flex items-center gap-1">
      <button
        onClick={() => zoomIn(0.5)}
        className="w-9 h-9 bg-background/90 hover:bg-background rounded-lg flex items-center justify-center text-foreground shadow-md backdrop-blur-sm transition-colors"
        title="Perbesar"
        aria-label="Perbesar gambar"
      >
        <ZoomIn className="w-4 h-4" />
      </button>
      <button
        onClick={() => zoomOut(0.5)}
        className="w-9 h-9 bg-background/90 hover:bg-background rounded-lg flex items-center justify-center text-foreground shadow-md backdrop-blur-sm transition-colors"
        title="Perkecil"
        aria-label="Perkecil gambar"
      >
        <ZoomOut className="w-4 h-4" />
      </button>
      <button
        onClick={() => resetTransform()}
        className="w-9 h-9 bg-background/90 hover:bg-background rounded-lg flex items-center justify-center text-foreground shadow-md backdrop-blur-sm transition-colors"
        title="Reset"
        aria-label="Reset zoom"
      >
        <RotateCcw className="w-4 h-4" />
      </button>
    </div>
  );
}

// --- Main Component ---

export function ImageZoomDialog({
  images,
  initialIndex = 0,
  title,
  isOpen,
  onClose,
  imageHeight = "60vh",
  showThumbnails,
}: ImageZoomDialogProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(initialIndex);
  const transformRef = useRef<ReactZoomPanPinchContentRef>(null);

  // Reset index saat dialog dibuka atau images berubah
  useEffect(() => {
    if (isOpen) {
      setCurrentImageIndex(initialIndex);
    }
  }, [isOpen, initialIndex]);

  const hasMultipleImages = images.length > 1;
  const shouldShowThumbnails = showThumbnails ?? hasMultipleImages;

  // Navigation handlers
  const nextImage = useCallback(() => {
    if (!hasMultipleImages) return;
    setCurrentImageIndex((prev) => 
      prev < images.length - 1 ? prev + 1 : 0
    );
    transformRef.current?.resetTransform();
  }, [images.length, hasMultipleImages]);

  const prevImage = useCallback(() => {
    if (!hasMultipleImages) return;
    setCurrentImageIndex((prev) => 
      prev > 0 ? prev - 1 : images.length - 1
    );
    transformRef.current?.resetTransform();
  }, [images.length, hasMultipleImages]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        prevImage();
      } else if (e.key === "ArrowRight") {
        nextImage();
      } else if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, nextImage, prevImage, onClose]);

  if (images.length === 0) return null;

  const currentImage = images[currentImageIndex];

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-5xl max-h-[95vh] overflow-hidden bg-card p-0">
        {/* Header */}
        {title && (
          <DialogHeader className="p-4 pb-2">
            <DialogTitle className="text-foreground text-lg pr-8">
              {title}
              {hasMultipleImages && (
                <span className="text-muted-foreground font-normal text-sm ml-2">
                  ({currentImageIndex + 1} / {images.length})
                </span>
              )}
            </DialogTitle>
          </DialogHeader>
        )}

        {/* Main Image Area */}
        <div className="relative bg-secondary/50">
          <TransformWrapper
            ref={transformRef}
            initialScale={1}
            minScale={0.5}
            maxScale={5}
            centerOnInit
            wheel={{ step: 0.1 }}
            doubleClick={{ mode: "zoomIn", step: 1 }}
            panning={{ velocityDisabled: true }}
          >
            {/* Zoom Controls */}
            <ZoomControls />

            {/* Zoomable Image */}
            <TransformComponent
              wrapperClass="!w-full"
              contentClass="!w-full !flex !items-center !justify-center"
              wrapperStyle={{ 
                width: "100%", 
                height: imageHeight,
                cursor: "grab"
              }}
            >
              <div className="relative w-full" style={{ height: imageHeight }}>
                <Image
                  src={currentImage}
                  alt={title ? `${title} - Gambar ${currentImageIndex + 1}` : `Gambar ${currentImageIndex + 1}`}
                  fill
                  className="object-contain select-none"
                  sizes="(max-width: 1024px) 100vw, 1024px"
                  priority
                  draggable={false}
                />
              </div>
            </TransformComponent>
          </TransformWrapper>

          {/* Navigation Arrows */}
          {hasMultipleImages && (
            <>
              <button
                onClick={prevImage}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-background/90 hover:bg-background rounded-full flex items-center justify-center text-foreground shadow-lg backdrop-blur-sm transition-colors z-10"
                aria-label="Gambar sebelumnya"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-background/90 hover:bg-background rounded-full flex items-center justify-center text-foreground shadow-lg backdrop-blur-sm transition-colors z-10"
                aria-label="Gambar selanjutnya"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </>
          )}
        </div>

        {/* Thumbnails */}
        {shouldShowThumbnails && (
          <div className="p-4 pt-3 border-t border-border">
            <div className="flex gap-2 justify-center flex-wrap max-h-24 overflow-y-auto">
              {images.map((img, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setCurrentImageIndex(index);
                    transformRef.current?.resetTransform();
                  }}
                  className={`relative w-16 h-12 rounded-md overflow-hidden border-2 transition-all flex-shrink-0 ${
                    index === currentImageIndex
                      ? "border-primary ring-2 ring-primary/30"
                      : "border-border hover:border-primary/50 opacity-70 hover:opacity-100"
                  }`}
                  aria-label={`Lihat gambar ${index + 1}`}
                >
                  <Image
                    src={img}
                    alt={`Thumbnail ${index + 1}`}
                    fill
                    className="object-cover"
                    sizes="64px"
                  />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="px-4 pb-3 text-center">
          <p className="text-xs text-muted-foreground">
            Gunakan scroll mouse atau tombol untuk zoom • Klik dan geser untuk menggeser gambar • Double-click untuk zoom cepat
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
