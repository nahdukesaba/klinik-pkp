/**
 * Hook: useYearFilter
 * Reusable year filter logic dengan default tahun sekarang.
 *
 * Dipakai di semua halaman yang memiliki filter tahun:
 * - Sosialisasi Map, Jadwal, Berita (dateExtractor → Date/string)
 * - Penerimaan BSPS (yearExtractor → number)
 * - Sebaran Rusun (yearExtractor → number, default "all")
 * - Kawasan Kumuh (yearExtractor → number, default CURRENT_YEAR)
 *
 * @param items - Array item yang memiliki field tanggal/tahun
 * @param extractor - Fungsi mengekstrak Date/string ATAU langsung number (tahun)
 * @param defaultYear - Tahun awal filter (default: CURRENT_YEAR). Gunakan "all" untuk tampilkan semua.
 */

"use client";

import { useMemo, useState, useCallback } from "react";

import { CURRENT_YEAR } from "@/lib/constants";

interface UseYearFilterReturn<T> {
  /** Tahun yang sedang dipilih ("all" atau "2024", "2025", dll.) */
  year: string;
  /** Set tahun filter */
  setYear: (year: string) => void;
  /** Daftar tahun yang tersedia (descending) */
  availableYears: number[];
  /** Reset ke tahun default */
  resetYear: () => void;
  /** Apakah filter tahun aktif (bukan default) */
  isYearActive: boolean;
  /** Item yang sudah difilter berdasarkan tahun */
  filteredItems: T[];
}

export function useYearFilter<T>(
  items: T[],
  extractor: (item: T) => string | Date | number,
  defaultYear: string = CURRENT_YEAR,
): UseYearFilterReturn<T> {
  const [year, setYear] = useState<string>(defaultYear);

  /** Ekstrak tahun (number) dari item, mendukung Date/string/number */
  const getYear = useCallback(
    (item: T): number => {
      const val = extractor(item);
      if (typeof val === "number") return val;
      return new Date(val).getFullYear();
    },
    [extractor]
  );

  const availableYears = useMemo(() => {
    const years = [...new Set(items.map(getYear))];
    return years.sort((a, b) => b - a);
  }, [items, getYear]);

  /** Item yang difilter berdasarkan tahun terpilih */
  const filteredItems = useMemo(() => {
    if (year === "all") return items;
    const numYear = parseInt(year, 10);
    return items.filter((item) => getYear(item) === numYear);
  }, [items, year, getYear]);

  const resetYear = useCallback(() => {
    setYear(defaultYear);
  }, [defaultYear]);

  const isYearActive = year !== "all" && year !== defaultYear;

  return {
    year,
    setYear,
    availableYears,
    resetYear,
    isYearActive,
    filteredItems,
  };
}
