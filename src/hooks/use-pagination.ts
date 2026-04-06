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

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

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
  const totalItems = items.length;
  const previousItemCountRef = useRef(totalItems);

  const totalPages = Math.max(1, Math.ceil(totalItems / perPage));

  useEffect(() => {
    const previousItemCount = previousItemCountRef.current;
    previousItemCountRef.current = totalItems;

    setCurrentPage((page) => {
      if (previousItemCount !== totalItems && page !== 1) {
        return 1;
      }

      if (page > totalPages) {
        return totalPages;
      }

      return page;
    });
  }, [totalItems, totalPages]);

  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * perPage;
    return items.slice(start, start + perPage);
  }, [items, currentPage, perPage]);

  const setPage = useCallback(
    (page: number) => {
      setCurrentPage(Math.min(Math.max(page, 1), totalPages));
    },
    [totalPages]
  );

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
    currentPage,
    totalPages,
    totalItems,
    setCurrentPage: setPage,
    goToNextPage,
    goToPrevPage,
  };
}
