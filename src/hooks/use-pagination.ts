/**
 * Hook: usePagination
 * Reusable pagination logic untuk daftar item.
 *
 * Best practice:
 * - Reset halaman otomatis ketika data berubah (filter/search)
 * - Hitung totalPages dari data yang sudah terfilter
 * - Slice data di sisi client (cocok untuk < 1000 item)
 */

"use client";

import { useMemo, useState, useCallback, useRef } from "react";

const DEFAULT_PER_PAGE = 9;

interface UsePaginationOptions {
  /** Jumlah item per halaman (default: 9) */
  perPage?: number;
}

interface UsePaginationReturn<T> {
  /** Item untuk halaman saat ini */
  paginatedItems: T[];
  /** Halaman aktif (1-based) */
  currentPage: number;
  /** Total halaman */
  totalPages: number;
  /** Total semua item (sebelum pagination) */
  totalItems: number;
  /** Set halaman tertentu */
  setCurrentPage: (page: number) => void;
  /** Ke halaman berikutnya */
  goToNextPage: () => void;
  /** Ke halaman sebelumnya */
  goToPrevPage: () => void;
}

export function usePagination<T>(
  items: T[],
  options?: UsePaginationOptions
): UsePaginationReturn<T> {
  const perPage = options?.perPage ?? DEFAULT_PER_PAGE;
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(items.length / perPage));

  // Derive state during render: reset halaman jika items berubah.
  // Menghindari extra render dari useEffect + setState.
  // Ref: vercel-react-best-practices/rerender-derived-state-no-effect
  const prevLengthRef = useRef(items.length);
  let activePage = currentPage;
  if (prevLengthRef.current !== items.length) {
    prevLengthRef.current = items.length;
    if (currentPage !== 1) {
      activePage = 1;
    }
  }
  // Clamp jika halaman melebihi total setelah filter
  if (activePage > totalPages) {
    activePage = 1;
  }
  if (activePage !== currentPage) {
    setCurrentPage(activePage);
  }

  const paginatedItems = useMemo(() => {
    const start = (activePage - 1) * perPage;
    return items.slice(start, start + perPage);
  }, [items, activePage, perPage]);

  // Functional setState: callback tidak perlu dependency pada totalPages.
  // Ref: vercel-react-best-practices/rerender-functional-setstate
  const goToNextPage = useCallback(() => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  }, [totalPages]);

  const goToPrevPage = useCallback(() => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  }, []);

  return {
    paginatedItems,
    currentPage: activePage,
    totalPages,
    totalItems: items.length,
    setCurrentPage,
    goToNextPage,
    goToPrevPage,
  };
}
