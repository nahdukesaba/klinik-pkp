/**
 * ImageZoomDialogLazy — Lazy wrapper untuk ImageZoomDialog.
 *
 * Library `react-zoom-pan-pinch` (~15KB gzip) hanya dimuat saat
 * dialog benar-benar dibuka. Ini mengurangi initial bundle size
 * di 3 halaman yang mengimpor komponen ini.
 *
 * Ref: vercel-react-best-practices/bundle-dynamic-imports
 */

"use client";

import { Suspense, lazy } from "react";

import type { ImageZoomDialogProps } from "./ImageZoomDialog";

const ImageZoomDialogInner = lazy(() =>
  import("./ImageZoomDialog").then((mod) => ({
    default: mod.ImageZoomDialog,
  }))
);

/**
 * Saat dialog tertutup (isOpen=false), tidak render apa-apa.
 * Saat dibuka, lazy-load modul ImageZoomDialog + react-zoom-pan-pinch.
 */
export function ImageZoomDialogLazy(props: ImageZoomDialogProps) {
  if (!props.isOpen) return null;

  return (
    <Suspense
      fallback={
        <div
          data-ui-dialog-overlay="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
        >
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <ImageZoomDialogInner {...props} />
    </Suspense>
  );
}
