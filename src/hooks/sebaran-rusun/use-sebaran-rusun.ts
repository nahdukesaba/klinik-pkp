/**
 * useSebaranRusun — Semua logika halaman Sebaran Rusun.
 * Menggabungkan fetching data, filter, kontrol peta, dan navigasi dalam satu hook.
 */

"use client";

import { useCallback, useMemo, useState } from "react";

import { useRouter } from "next/navigation";

import { useRusunMap } from "@/hooks/sebaran-rusun/use-rusun-map";
import { useRusunQuery, type RusunData } from "@/hooks/sebaran-rusun/use-rusun-query";
import { useCascadingFilter } from "@/hooks/use-cascading-filter";
import { useDebounce } from "@/hooks/use-debounce";
import { useLazyMount } from "@/hooks/use-lazy-mount";
import { usePagination } from "@/hooks/use-pagination";
import { useYearFilter } from "@/hooks/use-year-filter";

const SIDEBAR_PER_PAGE = 12;

export function useSebaranRusun() {
  const router = useRouter();
  const { data, isLoading, isError, error } = useRusunQuery();

  // Filter
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 300);
  const cascading = useCascadingFilter(data);

  // Year filter — default "all" agar semua tahun tampil saat pertama kali buka
  const yearFilter = useYearFilter(data, (r: RusunData) => Number(r.yearGiven), "all");

  // State UI
  const [selectedRusun, setSelectedRusun] = useState<RusunData | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Peta (lazy-mount, aktif hanya saat data siap)
  const mapLazy = useLazyMount();
  const enableMap = mapLazy.isMounted && !isLoading && !isError;

  // Turunan: daftar terfilter (year + cascading + pencarian)
  const filteredRusun = useMemo(() => {
    const q = debouncedSearch.toLowerCase();
    // yearFilter.filteredItems sudah filter by year dari `data` — tapi kita perlu chain
    // dengan cascading. Cascading operates on `data`, jadi kita filter manual.
    const yearFiltered = yearFilter.filteredItems;
    const cascadingFiltered = cascading.filteredItems;

    // Intersection: item yang lolos both year filter AND cascading filter
    const cascadingIds = new Set(cascadingFiltered.map((r: RusunData) => r.id));

    return yearFiltered.filter((rusun: RusunData) => {
      if (!cascadingIds.has(rusun.id)) return false;

      const matchSearch =
        !debouncedSearch ||
        rusun.name.toLowerCase().includes(q) ||
        rusun.address.toLowerCase().includes(q) ||
        rusun.kelurahan.toLowerCase().includes(q) ||
        rusun.kecamatan.toLowerCase().includes(q);

      return matchSearch;
    });
  }, [debouncedSearch, yearFilter.filteredItems, cascading.filteredItems]);

  // Pagination untuk sidebar
  const pagination = usePagination(filteredRusun, { perPage: SIDEBAR_PER_PAGE });

  // Turunan: statistik
  const stats = useMemo(
    () => ({
      totalRusun: filteredRusun.length,
      totalUnits: filteredRusun.reduce((acc, r) => acc + r.units, 0),
    }),
    [filteredRusun],
  );

  // Hook peta (klik marker → pilih + tutup sidebar)
  const handleMarkerSelect = useCallback((rusun: RusunData) => {
    setSelectedRusun(rusun);
    setSidebarOpen(false);
  }, []);

  const map = useRusunMap(filteredRusun, handleMarkerSelect, enableMap, sidebarOpen);

  // Aksi
  const handleYearChange = useCallback(
    (value: string) => {
      yearFilter.setYear(value);
    },
    [yearFilter],
  );

  const resetFilters = useCallback(() => {
    setSearchQuery("");
    yearFilter.setYear("all");
    cascading.filterActions.resetFilters();
  }, [cascading.filterActions, yearFilter]);

  const handleRusunClick = useCallback(
    (rusun: RusunData) => {
      setSelectedRusun(rusun);
      setSidebarOpen(false);
      map.flyToLocation(rusun.lat, rusun.lng, 14);
    },
    [map],
  );

  const handleBack = useCallback(() => router.push("/"), [router]);

  return {
    // State
    isLoading,
    isError,
    error,
    filters: {
      searchQuery,
      yearFilter: yearFilter.year,
      kabupatenFilter: cascading.filterState.kabupatenFilter,
      kecamatanFilter: cascading.filterState.kecamatanFilter,
      kelurahanFilter: cascading.filterState.kelurahanFilter,
    },
    selectedRusun,
    sidebarOpen,

    // Turunan
    availableYears: yearFilter.availableYears,
    filteredRusun,
    filterOptions: {
      kabupatenList: cascading.filterLists.kabupatenList,
      kecamatanList: cascading.filterLists.kecamatanList,
      kelurahanList: cascading.filterLists.kelurahanList,
    },
    stats,
    mapRef: map.mapRef,
    mapLazy,
    pagination,

    // Aksi
    setSearchQuery,
    setYearFilter: handleYearChange,
    setKabupatenFilter: cascading.filterActions.setKabupatenFilter,
    setKecamatanFilter: cascading.filterActions.setKecamatanFilter,
    setKelurahanFilter: cascading.filterActions.setKelurahanFilter,
    setSidebarOpen,
    resetFilters,
    handleRusunClick,
    handleBack,
  };
}
