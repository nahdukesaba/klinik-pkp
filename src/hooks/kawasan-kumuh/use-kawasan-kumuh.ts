"use client";

/**
 * Hook: useKawasanKumuh
 * Mengelola data dan filter. Tahun dikirim ke API, dan daftar tahunnya
 * diambil dari seluruh data backend agar opsi filter selalu akurat.
 */

import { useCallback, useMemo, useState } from "react";

import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { useCascadingFilter } from "@/hooks/use-cascading-filter";
import { useDebounce } from "@/hooks/use-debounce";
import { usePagination } from "@/hooks/use-pagination";
import { CURRENT_YEAR, CURRENT_YEAR_NUM, QUERY_CONFIG } from "@/lib/constants";
import { getSortedUniqueYears } from "@/lib/date";
import { sanitizeInput } from "@/lib/security";
import {
  fetchKumuhAvailableYears,
  fetchKumuhList,
} from "@/services/kawasan-kumuh.service";

const SIDEBAR_PER_PAGE = 12;

export function useKawasanKumuh() {
  const [yearFilter, setYearFilter] = useState<string>(CURRENT_YEAR);

  const yearsQuery = useQuery({
    queryKey: ["kawasan-kumuh-years"],
    queryFn: fetchKumuhAvailableYears,
    staleTime: 30 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
    retry: 2,
    refetchOnWindowFocus: false,
  });
  const yearParam =
    yearFilter === "all"
      ? undefined
      : parseInt(yearFilter, 10) || CURRENT_YEAR_NUM;

  const query = useQuery({
    queryKey: ["kawasan-kumuh", yearParam ?? "all"],
    queryFn: () => fetchKumuhList(yearParam),
    placeholderData: keepPreviousData,
    ...QUERY_CONFIG,
  });
  const data = useMemo(() => query.data ?? [], [query.data]);
  const availableYears = useMemo(() => {
    const sourceYears = yearsQuery.data?.length
      ? yearsQuery.data
      : data.map((item) => item.yearInspected);

    return getSortedUniqueYears([CURRENT_YEAR_NUM, ...sourceYears]);
  }, [data, yearsQuery.data]);

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const debouncedSearch = useDebounce(searchQuery, 300);

  const cascading = useCascadingFilter(data);

  const filteredKawasan = useMemo(() => {
    const q = sanitizeInput(debouncedSearch).toLowerCase();

    return cascading.filteredItems.filter((kawasan) => {
      const matchesYear =
        yearFilter === "all" || kawasan.yearInspected === yearParam;
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
    yearFilter,
    yearParam,
  ]);

  const pagination = usePagination(filteredKawasan, {
    perPage: SIDEBAR_PER_PAGE,
  });

  const resetYear = useCallback(() => {
    setYearFilter(CURRENT_YEAR);
  }, []);

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
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    pagination,
  };
}
