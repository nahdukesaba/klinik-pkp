"use client";

/**
 * Hook: usePenerimaanBsps
 * Mengelola state filter dan data BSPS.
 * Tahun dikirim ke API (server-side filter). Region filter dihapus.
 */

import { useCallback, useMemo, useState } from "react";

import { useBspsQuery, useBspsYearsQuery } from "@/hooks/penerimaan-bsps/use-bsps-query";
import { useCascadingFilter } from "@/hooks/use-cascading-filter";
import { useDebounce } from "@/hooks/use-debounce";
import { CURRENT_YEAR } from "@/lib/constants";

const CURRENT_YEAR_NUM = parseInt(CURRENT_YEAR, 10);

export function usePenerimaanBsps() {
  const [yearFilter, setYearFilter] = useState<string>(CURRENT_YEAR);
  const yearParam = yearFilter === "all" ? undefined : (parseInt(yearFilter, 10) || CURRENT_YEAR_NUM);

  const { data: rawData, isLoading, isError, error, refetch } = useBspsQuery(yearParam);
  const availableYears = useBspsYearsQuery();

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const debouncedSearch = useDebounce(searchQuery, 300);

  // Map data agar kelurahan tersedia untuk cascading filter
  const desaWithKelurahan = useMemo(
    () => rawData.map((d) => ({ ...d, kelurahan: d.kelurahan || d.nama })),
    [rawData],
  );

  const cascading = useCascadingFilter(desaWithKelurahan);

  // Filter: cascading + search + status (tahun sudah di-handle oleh query)
  const filteredDesa = useMemo(() => {
    const q = debouncedSearch.toLowerCase();

    return cascading.filteredItems.filter((p) => {
      const matchesSearch = !debouncedSearch || p.nama.toLowerCase().includes(q);
      const matchesStatus = statusFilter === "all" || p.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [debouncedSearch, statusFilter, cascading.filteredItems]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (cascading.filterState.kabupatenFilter !== "all") count++;
    if (cascading.filterState.kecamatanFilter !== "all") count++;
    if (cascading.filterState.kelurahanFilter !== "all") count++;
    if (statusFilter !== "all") count++;
    return count;
  }, [cascading.filterState, statusFilter]);

  const resetFilters = useCallback(() => {
    cascading.filterActions.resetFilters();
    setStatusFilter("all");
    setSearchQuery("");
    setYearFilter(CURRENT_YEAR);
  }, [cascading.filterActions]);

  return {
    isLoading,
    isError,
    error,
    refetch,
    filteredDesa,
    kabupatenList: cascading.filterLists.kabupatenList,
    kecamatanList: cascading.filterLists.kecamatanList,
    kelurahanList: cascading.filterLists.kelurahanList,
    searchQuery,
    kabupatenFilter: cascading.filterState.kabupatenFilter,
    kecamatanFilter: cascading.filterState.kecamatanFilter,
    kelurahanFilter: cascading.filterState.kelurahanFilter,
    statusFilter,
    activeFilterCount,
    setSearchQuery,
    setKabupatenFilter: cascading.filterActions.setKabupatenFilter,
    setKecamatanFilter: cascading.filterActions.setKecamatanFilter,
    setKelurahanFilter: cascading.filterActions.setKelurahanFilter,
    setStatusFilter,
    resetFilters,
    yearFilter,
    setYearFilter,
    availableYears,
  };
}
