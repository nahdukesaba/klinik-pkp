"use client";

/**
 * Hook: useKawasanKumuh
 * Mengelola data dan filter. Data publik diambil sesuai tahun aktif agar
 * peta dan sidebar tidak perlu memuat dataset semua tahun sekaligus.
 */

import { useCallback, useEffect, useMemo, useState } from "react";

import { keepPreviousData, useQuery, useQueryClient } from "@tanstack/react-query";

import { useCascadingFilter } from "@/hooks/use-cascading-filter";
import { useDebounce } from "@/hooks/use-debounce";
import { usePagination } from "@/hooks/use-pagination";
import {
  DEFAULT_DEBOUNCE_DELAY_MS,
  LONG_LIVED_QUERY_STALE_TIME_MS,
  PUBLIC_DEFAULT_YEAR,
  PUBLIC_YEAR_FILTER_OPTIONS,
  QUERY_CONFIG,
  QUERY_KEY_PARTS,
  QUERY_KEYS,
} from "@/lib/constants";
import { sanitizeInput } from "@/lib/security";
import {
  fetchKumuhAvailableYears,
  fetchKumuhList,
} from "@/services/kawasan-kumuh.service";

const SIDEBAR_PER_PAGE = 12;

export function useKawasanKumuh() {
  const queryClient = useQueryClient();
  const [yearFilter, setYearFilter] = useState("");
  const yearsQuery = useQuery({
    queryKey: [QUERY_KEYS.publicKawasanKumuh, "years"],
    queryFn: fetchKumuhAvailableYears,
    ...QUERY_CONFIG,
    retry: false,
    staleTime: LONG_LIVED_QUERY_STALE_TIME_MS,
    gcTime: LONG_LIVED_QUERY_STALE_TIME_MS,
  });
  const availableYears = useMemo(
    () =>
      yearsQuery.data?.length
        ? yearsQuery.data
        : [...PUBLIC_YEAR_FILTER_OPTIONS],
    [yearsQuery.data]
  );
  const selectedYear = yearFilter || String(availableYears[0] ?? PUBLIC_DEFAULT_YEAR);

  const parsedYear = parseInt(selectedYear, 10);
  const yearParam = Number.isFinite(parsedYear)
    ? parsedYear
    : PUBLIC_DEFAULT_YEAR;

  const query = useQuery({
    queryKey: [QUERY_KEYS.publicKawasanKumuh, yearParam],
    queryFn: () => fetchKumuhList(yearParam),
    placeholderData: keepPreviousData,
    ...QUERY_CONFIG,
    retry: false,
    staleTime: LONG_LIVED_QUERY_STALE_TIME_MS,
    gcTime: LONG_LIVED_QUERY_STALE_TIME_MS,
  });
  const data = useMemo(() => query.data ?? [], [query.data]);

  useEffect(() => {
    if (query.isLoading || yearsQuery.isLoading) {
      return;
    }

    for (const year of availableYears) {
      if (year === yearParam) {
        continue;
      }

      void queryClient.prefetchQuery({
        queryKey: [QUERY_KEYS.publicKawasanKumuh, year],
        queryFn: () => fetchKumuhList(year),
        retry: false,
        staleTime: LONG_LIVED_QUERY_STALE_TIME_MS,
        gcTime: LONG_LIVED_QUERY_STALE_TIME_MS,
      });
    }
  }, [
    availableYears,
    query.isLoading,
    queryClient,
    yearParam,
    yearsQuery.isLoading,
  ]);

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const debouncedSearch = useDebounce(searchQuery, DEFAULT_DEBOUNCE_DELAY_MS);

  const cascading = useCascadingFilter(data);

  const filteredKawasan = useMemo(() => {
    const q = sanitizeInput(debouncedSearch).toLowerCase();

    return cascading.filteredItems.filter((kawasan) => {
      const matchesYear = kawasan.yearInspected === yearParam;
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
