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

import type { Design } from "@/data/bank-desain";
import { useBankDesain } from "@/hooks/bank-desain/use-bank-desain";
import { useScrollAnimation } from "@/hooks/use-scroll-animation";

// ============================================
// Types
// ============================================

export function useBankDesainPage() {
  const ref = useScrollAnimation();
  const bankDesain = useBankDesain();
  
  // Preview state (simplified - tidak perlu hook terpisah lagi)
  const [previewDesign, setPreviewDesign] = useState<Design | null>(null);
  const isPreviewOpen = previewDesign !== null;

  // Handler untuk membuka preview
  const handleOpenPreview = useCallback((design: Design) => {
    if (design.previewImages.length === 0) return;
    setPreviewDesign(design);
  }, []);

  // Handler untuk menutup preview
  const handleClosePreview = useCallback(() => {
    setPreviewDesign(null);
  }, []);

  return {
    // Scroll animation ref
    ref,
    
    // Preview state & handlers
    previewDesign,
    isPreviewOpen,
    handleOpenPreview,
    handleClosePreview,
    
    // Spread all from useBankDesain
    ...bankDesain,
  };
}
