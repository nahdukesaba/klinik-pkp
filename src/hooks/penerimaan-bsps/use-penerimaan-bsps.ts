"use client";

/**
 * Hook: usePenerimaanBsps
 * Mengelola state filter dan data BSPS.
 * Tahun dikirim ke API (server-side filter). Region filter dihapus.
 */

import { useCallback, useMemo, useState } from "react";

import { useQuery, keepPreviousData } from "@tanstack/react-query";

import { useCascadingFilter } from "@/hooks/use-cascading-filter";
import { useDebounce } from "@/hooks/use-debounce";
import { CURRENT_YEAR, CURRENT_YEAR_NUM, QUERY_CONFIG } from "@/lib/constants";
import { sanitizeInput } from "@/lib/security";
import { fetchBspsList, type BspsData } from "@/services/bsps.service";

const EMPTY_BSPS_LIST: BspsData[] = [];
const DEFAULT_AVAILABLE_YEARS = [CURRENT_YEAR_NUM];

export function usePenerimaanBsps() {
  const [yearFilter, setYearFilter] = useState<string>(CURRENT_YEAR);
  const yearParam = yearFilter === "all" ? undefined : (parseInt(yearFilter, 10) || CURRENT_YEAR_NUM);

  const dataQuery = useQuery({
    queryKey: ["bsps", yearParam ?? "all"],
    queryFn: () => fetchBspsList(yearParam),
    placeholderData: keepPreviousData,
    ...QUERY_CONFIG,
  });
  const yearsQuery = useQuery({
    queryKey: ["bsps-years"],
    queryFn: () => fetchBspsList(),
    ...QUERY_CONFIG,
    select: (data) => {
      const years = [...new Set(data.map((item) => item.yearGiven))];
      if (!years.includes(CURRENT_YEAR_NUM)) {
        years.push(CURRENT_YEAR_NUM);
      }

      return years.sort((left, right) => right - left);
    },
  });
  const rawData = dataQuery.data ?? EMPTY_BSPS_LIST;
  const availableYears = yearsQuery.data ?? DEFAULT_AVAILABLE_YEARS;

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const debouncedSearch = useDebounce(searchQuery, 300);

  // Map data agar kelurahan tersedia untuk cascading filter
  const desaWithKelurahan = useMemo(
    () => rawData.map((d) => ({ ...d, kelurahan: d.kelurahan || d.nama })),
    [rawData],
  );

  const cascading = useCascadingFilter(desaWithKelurahan);

  // Filter: year (client-side safety net) + cascading + search + status
  const filteredDesa = useMemo(() => {
    const q = sanitizeInput(debouncedSearch).toLowerCase();

    return cascading.filteredItems.filter((p) => {
      // Client-side year filter — safety net jika API tidak filter
      const matchesYear =
        yearFilter === "all" || p.yearGiven === yearParam;

      const matchesSearch = !debouncedSearch || p.nama.toLowerCase().includes(q);
      const matchesStatus = statusFilter === "all" || p.status === statusFilter;
      return matchesYear && matchesSearch && matchesStatus;
    });
  }, [yearFilter, yearParam, debouncedSearch, statusFilter, cascading.filteredItems]);

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
    isLoading: dataQuery.isLoading,
    isError: dataQuery.isError,
    error: dataQuery.error,
    refetch: dataQuery.refetch,
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
