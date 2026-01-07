"use client";

import { useState, useCallback, useRef, useEffect } from "react";

import Image from "next/image";

import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { type Design } from "@/data/bank-desain";

// ============================================
// Types & Interfaces
// ============================================
interface DesignPreviewDialogProps {
  design: Design | null;
  isOpen: boolean;
  onClose: () => void;
}

// ============================================
// Custom Cursor Styles for Zoom
// ============================================
const cursorZoomIn = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Ccircle cx='11' cy='11' r='8'/%3E%3Cline x1='21' y1='21' x2='16.65' y2='16.65'/%3E%3Cline x1='11' y1='8' x2='11' y2='14'/%3E%3Cline x1='8' y1='11' x2='14' y2='11'/%3E%3C/svg%3E") 16 16, zoom-in`;

const cursorZoomOut = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Ccircle cx='11' cy='11' r='8'/%3E%3Cline x1='21' y1='21' x2='16.65' y2='16.65'/%3E%3Cline x1='8' y1='11' x2='14' y2='11'/%3E%3C/svg%3E") 16 16, zoom-out`;

// ============================================
// DesignPreviewDialog Component
// Dialog preview dengan fitur zoom in/out
// ============================================
export function DesignPreviewDialog({
  design,
  isOpen,
  onClose,
}: DesignPreviewDialogProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [transformOrigin, setTransformOrigin] = useState("center center");
  const containerRef = useRef<HTMLDivElement>(null);

  // Reset index and zoom when dialog opens with new design
  const handleOpenChange = useCallback(
    (open: boolean) => {
      if (!open) {
        onClose();
        setCurrentImageIndex(0);
        setIsZoomed(false);
        setTransformOrigin("center center");
      }
    },
    [onClose]
  );

  // Reset zoom when image changes
  useEffect(() => {
    setIsZoomed(false);
    setTransformOrigin("center center");
  }, [currentImageIndex]);

  const nextImage = useCallback(() => {
    if (!design || isZoomed) return;
    setCurrentImageIndex((prev) =>
      prev < design.previewImages.length - 1 ? prev + 1 : 0
    );
  }, [design, isZoomed]);

  const prevImage = useCallback(() => {
    if (!design || isZoomed) return;
    setCurrentImageIndex((prev) =>
      prev > 0 ? prev - 1 : design.previewImages.length - 1
    );
  }, [design, isZoomed]);

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
      const x = Math.max(
        0,
        Math.min(100, ((e.clientX - rect.left) / rect.width) * 100)
      );
      const y = Math.max(
        0,
        Math.min(100, ((e.clientY - rect.top) / rect.height) * 100)
      );

      setTransformOrigin(`${x}% ${y}%`);
    },
    [isZoomed]
  );

  if (!design) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-card">
        <DialogHeader>
          <DialogTitle className="text-foreground text-xl">
            {design.title}
          </DialogTitle>
        </DialogHeader>

        <div className="relative">
          {/* Zoom Status Indicator */}
          <div className="absolute top-2 left-2 z-20 flex items-center gap-2 px-3 py-1.5 bg-background/90 rounded-full backdrop-blur-sm shadow-lg">
            {isZoomed ? (
              <>
                <ZoomOut className="w-4 h-4 text-primary" />
                <span className="text-xs text-foreground font-medium">
                  Klik untuk memperkecil
                </span>
              </>
            ) : (
              <>
                <ZoomIn className="w-4 h-4 text-primary" />
                <span className="text-xs text-foreground font-medium">
                  Klik untuk memperbesar
                </span>
              </>
            )}
          </div>

          {/* Main Image - dengan zoom */}
          <div className="relative rounded-lg overflow-hidden bg-secondary">
            <div
              ref={containerRef}
              className="relative aspect-video w-full cursor-pointer"
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
                  src={design.previewImages[currentImageIndex]}
                  alt={`${design.title} - Preview ${currentImageIndex + 1}`}
                  fill
                  className="object-contain select-none"
                  sizes="(max-width: 896px) 100vw, 896px"
                  priority
                  draggable={false}
                />
              </div>
            </div>

            {/* Navigation Arrows - disabled when zoomed */}
            {design.previewImages.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  disabled={isZoomed}
                  className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-background/80 rounded-full flex items-center justify-center text-foreground hover:bg-background transition-colors z-10 disabled:opacity-30 disabled:cursor-not-allowed"
                  aria-label="Gambar sebelumnya"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={nextImage}
                  disabled={isZoomed}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-background/80 rounded-full flex items-center justify-center text-foreground hover:bg-background transition-colors z-10 disabled:opacity-30 disabled:cursor-not-allowed"
                  aria-label="Gambar selanjutnya"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}

            {/* Image Counter */}
            {design.previewImages.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-background/80 rounded-full text-sm text-foreground z-10 font-medium">
                {currentImageIndex + 1} / {design.previewImages.length}
              </div>
            )}
          </div>

          {/* Thumbnail Dots */}
          {design.previewImages.length > 1 && (
            <div className="flex justify-center gap-2 mt-4">
              {design.previewImages.map((img, i) => (
                <button
                  key={i}
                  onClick={() => !isZoomed && setCurrentImageIndex(i)}
                  disabled={isZoomed}
                  className={`relative w-14 h-10 rounded-md overflow-hidden border-2 transition-all disabled:opacity-30 disabled:cursor-not-allowed ${
                    i === currentImageIndex
                      ? "border-primary scale-105"
                      : "border-transparent opacity-60 hover:opacity-100"
                  }`}
                >
                  <Image
                    src={img}
                    alt={`Thumbnail ${i + 1}`}
                    fill
                    className="object-cover"
                    sizes="56px"
                  />
                </button>
              ))}
            </div>
          )}

          {/* Instructions */}
          <div className="text-center mt-4 space-y-2">
            <p className="text-xs text-muted-foreground">
              {isZoomed
                ? "Gerakkan mouse untuk menggeser • Klik untuk memperkecil"
                : "Klik gambar untuk memperbesar"}
            </p>
            <p className="text-sm text-muted-foreground">
              Gambar preview tidak dapat diunduh. Gunakan tombol &quot;Unduh
              PDF&quot; untuk mendapatkan dokumen lengkap.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default DesignPreviewDialog;
