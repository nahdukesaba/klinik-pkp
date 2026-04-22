"use client";

import { useCallback, useMemo, useState } from "react";

import { usePagination } from "@/hooks/use-pagination";
import { CURRENT_YEAR } from "@/lib/constants";
import { getSortedUniqueYears } from "@/lib/date";
import { sanitizeInput } from "@/lib/security";
import { type BeritaSosialisasi } from "@/services/sosialisasi.service";

/**
 * Hook untuk mengelola filtering berita sosialisasi.
 *
 * Menerima data mentah dari useSosialisasiData (Variabel A)
 * dan menghasilkan data terfilter (Variabel B).
 *
 * @param rawBerita - Data berita dari useSosialisasiData
 */
export function useSosialisasiPKPBerita(
  rawBerita: BeritaSosialisasi[]
) {
  // Default: tahun sekarang
  const [beritaYear, setBeritaYear] = useState<string>(CURRENT_YEAR);
  const [beritaMonth, setBeritaMonth] = useState<string>("all");
  const [beritaStartDate, setBeritaStartDate] = useState<string>("");
  const [beritaEndDate, setBeritaEndDate] = useState<string>("");
  const [beritaSearch, setBeritaSearch] = useState<string>("");

  const beritaYears = useMemo(() => {
    return getSortedUniqueYears(rawBerita.map((berita) => berita.rawDate.slice(0, 4)), {
      includeCurrentYear: true,
    });
  }, [rawBerita]);

  const filteredBerita = useMemo(() => {
    let result: BeritaSosialisasi[] = rawBerita;

    // Filter by date range if specified
    if (beritaStartDate && beritaEndDate) {
      result = result.filter((b) => {
        return b.rawDate >= beritaStartDate && b.rawDate <= beritaEndDate;
      });
    } else {
      // Filter by year
      if (beritaYear !== "all") {
        result = result.filter((b) => b.rawDate.slice(0, 4) === beritaYear);
      }

      // Filter by month
      if (beritaMonth !== "all") {
        result = result.filter((b) => b.rawDate.slice(5, 7) === beritaMonth);
      }
    }

    // Filter by search query
    if (beritaSearch.trim()) {
      const query = sanitizeInput(beritaSearch).toLowerCase().trim();
      result = result.filter(
        (b) =>
          b.title.toLowerCase().includes(query) ||
          b.description.toLowerCase().includes(query) ||
          b.kabupaten.toLowerCase().includes(query)
      );
    }

    return result.sort((a, b) => b.rawDate.localeCompare(a.rawDate));
  }, [rawBerita, beritaYear, beritaMonth, beritaStartDate, beritaEndDate, beritaSearch]);

  // Wrap resetFilters in useCallback for stable reference.
  // Ref: vercel-react-best-practices/rerender-functional-setstate
  const resetFilters = useCallback(() => {
    setBeritaYear(CURRENT_YEAR);
    setBeritaMonth("all");
    setBeritaStartDate("");
    setBeritaEndDate("");
    setBeritaSearch("");
  }, []);

  const hasActiveFilters =
    beritaYear !== CURRENT_YEAR ||
    beritaMonth !== "all" ||
    beritaStartDate !== "" ||
    beritaEndDate !== "" ||
    beritaSearch.trim() !== "";

  // Pagination: 8 berita per halaman (grid 4 kolom × 2 baris)
  const pagination = usePagination(filteredBerita, { perPage: 8 });

  return {
    beritaYear,
    setBeritaYear,
    beritaMonth,
    setBeritaMonth,
    beritaStartDate,
    setBeritaStartDate,
    beritaEndDate,
    setBeritaEndDate,
    beritaSearch,
    setBeritaSearch,
    beritaYears,
    filteredBerita,
    paginatedBerita: pagination.paginatedItems,
    pagination,
    resetFilters,
    hasActiveFilters,
  };
}
