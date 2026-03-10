/**
 * DesignPreviewDialog
 * Wrapper untuk preview gambar desain menggunakan ImageZoomDialog.
 */

"use client";

import { ImageZoomDialog } from "@/components/shared";
import type { BankDesainData } from "@/hooks/bank-desain/use-bank-desain-query";

interface DesignPreviewDialogProps {
  design: BankDesainData | null;
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
