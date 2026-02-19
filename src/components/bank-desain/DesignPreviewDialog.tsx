/**
 * DesignPreviewDialog
 * Wrapper untuk preview gambar desain menggunakan ImageZoomDialog.
 */

"use client";

import { ImageZoomDialog } from "@/components/shared";
import type { Design } from "@/data/bank-desain";

interface DesignPreviewDialogProps {
  design: Design | null;
  isOpen: boolean;
  onClose: () => void;
}

export function DesignPreviewDialog({
  design,
  isOpen,
  onClose,
}: DesignPreviewDialogProps) {
  if (!design) return null;

  return (
    <ImageZoomDialog
      images={design.previewImages}
      title={design.title}
      isOpen={isOpen}
      onClose={onClose}
      imageHeight="60vh"
    />
  );
}

export default DesignPreviewDialog;
