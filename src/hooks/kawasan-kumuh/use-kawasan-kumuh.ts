"use client";

/**
 * Hook: useKawasanKumuh
 * Mengelola data dan filter. Tahun dikirim ke API (bukan client-side filter).
 * Default: tahun sekarang. Daftar tahun dari useKumuhYearsQuery.
 */

import { useMemo, useState, useCallback } from "react";

import { useKawasanKumuhQuery, useKumuhYearsQuery } from "@/hooks/kawasan-kumuh/use-kawasan-kumuh-query";
import { useCascadingFilter } from "@/hooks/use-cascading-filter";
import { useDebounce } from "@/hooks/use-debounce";
import { usePagination } from "@/hooks/use-pagination";
import { CURRENT_YEAR } from "@/lib/constants";
import { sanitizeInput } from "@/lib/security";

const SIDEBAR_PER_PAGE = 12;
const CURRENT_YEAR_NUM = parseInt(CURRENT_YEAR, 10);

export function useKawasanKumuh() {
  // Year state — dikirim ke query hook, default tahun sekarang
  const [yearFilter, setYearFilter] = useState<string>(CURRENT_YEAR);
  const yearParam = yearFilter === "all" ? undefined : (parseInt(yearFilter, 10) || CURRENT_YEAR_NUM);

  // Data per-tahun dari API (undefined = semua tahun)
  const { data, isLoading, isError, error, refetch } = useKawasanKumuhQuery(yearParam);

  // Daftar tahun (dari semua data, cache lama)
  const availableYears = useKumuhYearsQuery();

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const debouncedSearch = useDebounce(searchQuery, 300);

  // Cascading location filter
  const cascading = useCascadingFilter(data);

  // Filter: year (client-side safety net) + cascading + search + status
  const filteredKawasan = useMemo(() => {
    const q = sanitizeInput(debouncedSearch).toLowerCase();

    return cascading.filteredItems.filter((kawasan) => {
      // Client-side year filter — safety net jika API tidak filter
      const matchesYear =
        yearFilter === "all" || kawasan.yearInspected === yearParam;

      const matchesSearch =
        !debouncedSearch ||
        kawasan.name.toLowerCase().includes(q) ||
        kawasan.kelurahan.toLowerCase().includes(q) ||
        kawasan.kecamatan.toLowerCase().includes(q) ||
        kawasan.kabupaten.toLowerCase().includes(q);

      const matchesStatus = statusFilter === "all" || kawasan.status === statusFilter;

      return matchesYear && matchesSearch && matchesStatus;
    });
  }, [yearFilter, yearParam, debouncedSearch, statusFilter, cascading.filteredItems]);

  const pagination = usePagination(filteredKawasan, { perPage: SIDEBAR_PER_PAGE });

  const resetYear = useCallback(() => setYearFilter(CURRENT_YEAR), []);

  return {
    filteredKawasan,
    kabupatenList: cascading.filterLists.kabupatenList,
    kecamatanList: cascading.filterLists.kecamatanList,
    kelurahanList: cascading.filterLists.kelurahanList,
    searchQuery,
    yearFilter,
    availableYears,
    setYearFilter,
    resetYear,
    kabupatenFilter: cascading.filterState.kabupatenFilter,
    kecamatanFilter: cascading.filterState.kecamatanFilter,
    kelurahanFilter: cascading.filterState.kelurahanFilter,
    statusFilter,
    setSearchQuery,
    setKabupatenFilter: cascading.filterActions.setKabupatenFilter,
    setKecamatanFilter: cascading.filterActions.setKecamatanFilter,
    setKelurahanFilter: cascading.filterActions.setKelurahanFilter,
    setStatusFilter,
    isLoading,
    isError,
    error,
    refetch,
    pagination,
  };
}
