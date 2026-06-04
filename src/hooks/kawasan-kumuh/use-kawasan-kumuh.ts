"use client";

/**
 * Hook: useKawasanKumuh
 * Mengelola data dan filter. Data publik diambil sesuai tahun aktif agar
 * peta dan sidebar tidak perlu memuat dataset semua tahun sekaligus.
 */

import { useCallback, useMemo, useState } from "react";

import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { useCascadingFilter } from "@/hooks/use-cascading-filter";
import { useDebounce } from "@/hooks/use-debounce";
import { usePagination } from "@/hooks/use-pagination";
import {
  DEFAULT_DEBOUNCE_DELAY_MS,
  LONG_LIVED_QUERY_STALE_TIME_MS,
  PUBLIC_KUMUH_DEFAULT_YEAR,
  PUBLIC_KUMUH_YEAR_FILTER_OPTIONS,
  PUBLIC_YEAR_OPTIONS_STALE_TIME_MS,
  QUERY_CONFIG,
  QUERY_KEY_PARTS,
  QUERY_KEYS,
} from "@/lib/constants";
import { sanitizeInput } from "@/lib/security";
import {
  fetchKumuhAvailableYears,
  fetchKumuhList,
} from "@/services/kawasan-kumuh.service";

const SIDEBAR_PER_PAGE = 25;

export function useKawasanKumuh() {
  const [yearFilter, setYearFilter] = useState("");
  const yearsQuery = useQuery({
    queryKey: [QUERY_KEYS.publicKawasanKumuh, "years"],
    queryFn: fetchKumuhAvailableYears,
    ...QUERY_CONFIG,
    retry: false,
    staleTime: PUBLIC_YEAR_OPTIONS_STALE_TIME_MS,
    gcTime: LONG_LIVED_QUERY_STALE_TIME_MS,
  });
  const availableYears = useMemo(
    () =>
      yearsQuery.data?.length
        ? yearsQuery.data
        : [...PUBLIC_KUMUH_YEAR_FILTER_OPTIONS],
    [yearsQuery.data]
  );
  const selectedYear = yearFilter || (
    availableYears[0] == null ? "" : String(availableYears[0])
  );

  const parsedYear = parseInt(selectedYear, 10);
  const yearParam = Number.isFinite(parsedYear)
    ? parsedYear
    : undefined;

  const query = useQuery({
    queryKey: [QUERY_KEYS.publicKawasanKumuh, yearParam],
    queryFn: () => fetchKumuhList(yearParam ?? PUBLIC_KUMUH_DEFAULT_YEAR),
    placeholderData: keepPreviousData,
    ...QUERY_CONFIG,
    enabled: yearParam !== undefined,
    retry: false,
    staleTime: LONG_LIVED_QUERY_STALE_TIME_MS,
    gcTime: LONG_LIVED_QUERY_STALE_TIME_MS,
  });
  const data = useMemo(() => query.data ?? [], [query.data]);

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const debouncedSearch = useDebounce(searchQuery, DEFAULT_DEBOUNCE_DELAY_MS);

  const cascading = useCascadingFilter(data);

  const filteredKawasan = useMemo(() => {
    const q = sanitizeInput(debouncedSearch).toLowerCase();

    return cascading.filteredItems.filter((kawasan) => {
      const matchesYear =
        yearParam === undefined || kawasan.yearInspected === yearParam;
      const matchesSearch =
        !debouncedSearch ||
        kawasan.name.toLowerCase().includes(q) ||
        kawasan.kelurahan.toLowerCase().includes(q) ||
        kawasan.kecamatan.toLowerCase().includes(q) ||
        kawasan.kabupaten.toLowerCase().includes(q);
      const matchesStatus =
        statusFilter === "all" || kawasan.status === statusFilter;

      return matchesYear && matchesSearch && matchesStatus;
    });
  }, [
    cascading.filteredItems,
    debouncedSearch,
    statusFilter,
    yearParam,
  ]);

  const pagination = usePagination(filteredKawasan, {
    perPage: SIDEBAR_PER_PAGE,
  });

  const resetYear = useCallback(() => {
    setYearFilter("");
  }, []);

  const handleYearFilterChange = useCallback((value: string) => {
    setYearFilter(
      value === QUERY_KEY_PARTS.all ? "" : value
    );
  }, []);

  return {
    filteredKawasan,
    kabupatenList: cascading.filterLists.kabupatenList,
    kecamatanList: cascading.filterLists.kecamatanList,
    kelurahanList: cascading.filterLists.kelurahanList,
    searchQuery,
    yearFilter: selectedYear,
    availableYears,
    setYearFilter: handleYearFilterChange,
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
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    pagination,
  };
}
