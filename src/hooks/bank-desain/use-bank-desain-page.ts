/**
 * Hook: useBankDesainPage
 * Orkestrasi logic halaman Bank Desain untuk dikonsumsi UI.
 *
 * Fitur:
 * - Filter berdasarkan tipe, kamar, teras, dan pencarian
 * - Preview desain dengan zoom (react-zoom-pan-pinch)
 */

"use client";

import { useCallback, useState } from "react";

import { useBankDesain } from "@/hooks/bank-desain/use-bank-desain";
import type { BankDesainData } from "@/hooks/bank-desain/use-bank-desain-query";
import { useScrollAnimation } from "@/hooks/use-scroll-animation";

// --- Tipe Data ---

export function useBankDesainPage() {
  const ref = useScrollAnimation();
  const bankDesain = useBankDesain();
  
  // Preview state (simplified - tidak perlu hook terpisah lagi)
  const [previewDesign, setPreviewDesign] = useState<BankDesainData | null>(null);
  const isPreviewOpen = previewDesign !== null;

  // Handler untuk membuka preview
  const handleOpenPreview = useCallback((design: BankDesainData) => {
    if (design.previewImages.length === 0) return;
    setPreviewDesign(design);
  }, []);

  // Handler untuk menutup preview
  const handleClosePreview = useCallback(() => {
    setPreviewDesign(null);
  }, []);

  return {
    // Ref animasi scroll
    ref,
    
    // State & handler preview
    previewDesign,
    isPreviewOpen,
    handleOpenPreview,
    handleClosePreview,
    
    // Semua dari useBankDesain
    ...bankDesain,
  };
}
