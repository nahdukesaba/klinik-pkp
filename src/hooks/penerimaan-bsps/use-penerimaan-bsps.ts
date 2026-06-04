"use client";

/**
 * Hook: usePenerimaanBsps
 * Mengelola state filter dan data BSPS.
 * Data publik diambil sesuai tahun aktif agar peta tidak memuat semua tahun.
 */

import { useCallback, useMemo, useState } from "react";

import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { useCascadingFilter } from "@/hooks/use-cascading-filter";
import { useDebounce } from "@/hooks/use-debounce";
import {
  DEFAULT_DEBOUNCE_DELAY_MS,
  LONG_LIVED_QUERY_STALE_TIME_MS,
  PUBLIC_DEFAULT_YEAR,
  PUBLIC_YEAR_OPTIONS_STALE_TIME_MS,
  PUBLIC_YEAR_FILTER_OPTIONS,
  QUERY_CONFIG,
  QUERY_KEY_PARTS,
  QUERY_KEYS,
} from "@/lib/constants";
import { sanitizeInput } from "@/lib/security";
import {
  fetchBspsAvailableYears,
  fetchBspsList,
  type BspsData,
} from "@/services/bsps.service";

const EMPTY_BSPS_LIST: BspsData[] = [];

export function usePenerimaanBsps() {
  const [yearFilter, setYearFilter] = useState("");
  const yearsQuery = useQuery({
    queryKey: [QUERY_KEYS.publicBsps, "years"],
    queryFn: fetchBspsAvailableYears,
    ...QUERY_CONFIG,
    retry: false,
    staleTime: PUBLIC_YEAR_OPTIONS_STALE_TIME_MS,
    gcTime: LONG_LIVED_QUERY_STALE_TIME_MS,
  });
  const availableYears = useMemo(
    () =>
      yearsQuery.data?.length
        ? yearsQuery.data
        : [...PUBLIC_YEAR_FILTER_OPTIONS],
    [yearsQuery.data]
  );
  const selectedYear = yearFilter || (
    availableYears[0] == null ? "" : String(availableYears[0])
  );
  const parsedYear = parseInt(selectedYear, 10);
  const yearParam = Number.isFinite(parsedYear)
    ? parsedYear
    : undefined;

  const dataQuery = useQuery({
    queryKey: [QUERY_KEYS.publicBsps, yearParam],
    queryFn: () => fetchBspsList(yearParam ?? PUBLIC_DEFAULT_YEAR),
    enabled: yearParam !== undefined,
    placeholderData: keepPreviousData,
    ...QUERY_CONFIG,
    retry: false,
    staleTime: LONG_LIVED_QUERY_STALE_TIME_MS,
    gcTime: LONG_LIVED_QUERY_STALE_TIME_MS,
  });
  const rawData = dataQuery.data ?? EMPTY_BSPS_LIST;

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const debouncedSearch = useDebounce(searchQuery, DEFAULT_DEBOUNCE_DELAY_MS);

  // Map data agar kelurahan tersedia untuk cascading filter
  const desaWithKelurahan = useMemo(
    () => rawData.map((d) => ({ ...d, kelurahan: d.kelurahan || d.nama })),
    [rawData],
  );

  const cascading = useCascadingFilter(desaWithKelurahan);

  // Filter: year safety net + cascading + search + status
  const filteredDesa = useMemo(() => {
    const q = sanitizeInput(debouncedSearch).toLowerCase();

    return cascading.filteredItems.filter((p) => {
      const matchesYear = yearParam === undefined || p.yearGiven === yearParam;

      const matchesSearch = !debouncedSearch || p.nama.toLowerCase().includes(q);
      const matchesStatus = statusFilter === "all" || p.status === statusFilter;
      return matchesYear && matchesSearch && matchesStatus;
    });
  }, [yearParam, debouncedSearch, statusFilter, cascading.filteredItems]);

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
    setYearFilter("");
  }, [cascading.filterActions]);

  const handleYearFilterChange = useCallback((value: string) => {
    setYearFilter(
      value === QUERY_KEY_PARTS.all ? "" : value
    );
  }, []);

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
    yearFilter: selectedYear,
    setYearFilter: handleYearFilterChange,
    availableYears,
  };
}
