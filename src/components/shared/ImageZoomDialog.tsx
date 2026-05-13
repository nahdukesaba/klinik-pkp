"use client";

/* eslint-disable @next/next/no-img-element */

import { useCallback, useEffect, useRef, useState } from "react";

import {
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import {
  TransformComponent,
  TransformWrapper,
  useControls,
  type ReactZoomPanPinchContentRef,
} from "react-zoom-pan-pinch";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export interface ImageZoomDialogProps {
  images: string[];
  initialIndex?: number;
  title?: string;
  isOpen: boolean;
  onClose: () => void;
  imageHeight?: string;
  showThumbnails?: boolean;
}

function ZoomControls() {
  const { zoomIn, zoomOut, resetTransform } = useControls();

  return (
    <div className="absolute right-3 top-3 z-20 flex items-center gap-1">
      <button
        type="button"
        onClick={() => zoomIn(0.5)}
        className="flex h-9 w-9 items-center justify-center rounded-lg bg-background/90 text-foreground shadow-md backdrop-blur-sm transition-colors hover:bg-background"
        title="Perbesar"
        aria-label="Perbesar gambar"
      >
        <ZoomIn className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={() => zoomOut(0.5)}
        className="flex h-9 w-9 items-center justify-center rounded-lg bg-background/90 text-foreground shadow-md backdrop-blur-sm transition-colors hover:bg-background"
        title="Perkecil"
        aria-label="Perkecil gambar"
      >
        <ZoomOut className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={() => resetTransform()}
        className="flex h-9 w-9 items-center justify-center rounded-lg bg-background/90 text-foreground shadow-md backdrop-blur-sm transition-colors hover:bg-background"
        title="Reset"
        aria-label="Reset zoom"
      >
        <RotateCcw className="h-4 w-4" />
      </button>
    </div>
  );
}

export function ImageZoomDialog({
  images,
  initialIndex = 0,
  title,
  isOpen,
  onClose,
  imageHeight = "60vh",
  showThumbnails,
}: ImageZoomDialogProps) {
  const imageSessionKey = `${initialIndex}:${images.join("|")}`;
  const [viewerState, setViewerState] = useState(() => ({
    currentImageIndex: initialIndex,
    sessionKey: imageSessionKey,
  }));
  const transformRef = useRef<ReactZoomPanPinchContentRef>(null);
  const currentImageIndex =
    viewerState.sessionKey === imageSessionKey
      ? viewerState.currentImageIndex
      : initialIndex;

  const hasMultipleImages = images.length > 1;
  const shouldShowThumbnails = showThumbnails ?? hasMultipleImages;

  const nextImage = useCallback(() => {
    if (!hasMultipleImages) return;

    setViewerState((current) => ({
      sessionKey: imageSessionKey,
      currentImageIndex:
        current.sessionKey === imageSessionKey
          ? current.currentImageIndex < images.length - 1
            ? current.currentImageIndex + 1
            : 0
          : initialIndex < images.length - 1
            ? initialIndex + 1
            : 0,
    }));
    transformRef.current?.resetTransform();
  }, [hasMultipleImages, imageSessionKey, images.length, initialIndex]);

  const prevImage = useCallback(() => {
    if (!hasMultipleImages) return;

    setViewerState((current) => ({
      sessionKey: imageSessionKey,
      currentImageIndex:
        current.sessionKey === imageSessionKey
          ? current.currentImageIndex > 0
            ? current.currentImageIndex - 1
            : images.length - 1
          : initialIndex > 0
            ? initialIndex - 1
            : images.length - 1,
    }));
    transformRef.current?.resetTransform();
  }, [hasMultipleImages, imageSessionKey, images.length, initialIndex]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft") {
        prevImage();
      } else if (event.key === "ArrowRight") {
        nextImage();
      } else if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, nextImage, onClose, prevImage]);

  if (images.length === 0) return null;

  const currentImage = images[currentImageIndex];

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[95vh] max-w-5xl overflow-hidden bg-card p-0">
        {title && (
          <DialogHeader className="p-4 pb-2">
            <DialogTitle className="pr-8 text-lg text-foreground">
              {title}
              {hasMultipleImages && (
                <span className="ml-2 text-sm font-normal text-muted-foreground">
                  ({currentImageIndex + 1} / {images.length})
                </span>
              )}
            </DialogTitle>
            <DialogDescription className="sr-only">
              Pratinjau gambar. Gunakan tombol panah untuk berpindah gambar dan tombol zoom untuk memperbesar atau memperkecil.
            </DialogDescription>
          </DialogHeader>
        )}
        {!title && (
          <DialogDescription className="sr-only">
            Pratinjau gambar. Gunakan tombol panah untuk berpindah gambar dan tombol zoom untuk memperbesar atau memperkecil.
          </DialogDescription>
        )}

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
            <ZoomControls />

            <TransformComponent
              wrapperClass="!w-full"
              contentClass="!flex !w-full !items-center !justify-center"
              wrapperStyle={{
                width: "100%",
                height: imageHeight,
                cursor: "grab",
              }}
            >
              <div className="relative w-full" style={{ height: imageHeight }}>
                <img
                  src={currentImage}
                  alt={
                    title
                      ? `${title} - Gambar ${currentImageIndex + 1}`
                      : `Gambar ${currentImageIndex + 1}`
                  }
                  className="h-full w-full select-none object-contain"
                  draggable={false}
                />
              </div>
            </TransformComponent>
          </TransformWrapper>

          {hasMultipleImages && (
            <>
              <button
                type="button"
                onClick={prevImage}
                className="absolute left-3 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-background/90 text-foreground shadow-lg backdrop-blur-sm transition-colors hover:bg-background"
                aria-label="Gambar sebelumnya"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={nextImage}
                className="absolute right-3 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-background/90 text-foreground shadow-lg backdrop-blur-sm transition-colors hover:bg-background"
                aria-label="Gambar selanjutnya"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </>
          )}
        </div>

        {shouldShowThumbnails && (
          <div className="border-t border-border p-4 pt-3">
            <div className="flex max-h-24 flex-wrap justify-center gap-2 overflow-y-auto">
              {images.map((image, index) => (
                <button
                  key={image}
                  type="button"
                  onClick={() => {
                    setViewerState({
                      sessionKey: imageSessionKey,
                      currentImageIndex: index,
                    });
                    transformRef.current?.resetTransform();
                  }}
                  className={`relative h-12 w-16 flex-shrink-0 overflow-hidden rounded-md border-2 transition-all ${
                    index === currentImageIndex
                      ? "border-primary ring-2 ring-primary/30"
                      : "border-border opacity-70 hover:border-primary/50 hover:opacity-100"
                  }`}
                  aria-label={`Lihat gambar ${index + 1}`}
                >
                  <img
                    src={image}
                    alt={`Thumbnail ${index + 1}`}
                    className="h-full w-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="px-4 pb-3 text-center">
          <p className="text-xs text-muted-foreground">
            Gunakan scroll mouse atau tombol untuk zoom, klik dan geser untuk
            menggeser gambar, lalu double-click untuk zoom cepat.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
