/**
 * Hook: useSebaranRusun
 * Mengelola filter, pencarian, dan data untuk halaman Sebaran Rusun.
 * Menggunakan useCascadingFilter untuk filter lokasi cascading.
 *
 * Saat API siap, ganti isi `data` dan `regionCenters` dengan response API
 * (misalnya via React Query) tanpa mengubah return type.
 */

"use client";

import { useCallback, useMemo, useState } from "react";

import {
  rusunDataList,
  rusunRegionCenters,
  type RusunData,
} from "@/data/peta-sebaran-rusun";
import { useCascadingFilter } from "@/hooks/use-cascading-filter";
import { useDebounce } from "@/hooks/use-debounce";

// ============================================
// Constants
// ============================================
const DEFAULT_REGION = "sumatera-utara";

// ============================================
// Hook Implementation
// ============================================
export function useSebaranRusun() {
  // Data source (ganti dengan API call saat siap)
  const data = rusunDataList;
  const regionCenters = rusunRegionCenters;

  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [regionFilter, setRegionFilter] = useState(DEFAULT_REGION);

  // UI states
  const [selectedRusun, setSelectedRusun] = useState<RusunData | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const debouncedSearch = useDebounce(searchQuery, 300);

  // Shared cascading filter for location (kabupaten → kecamatan → kelurahan)
  const cascading = useCascadingFilter(data);

  // Derived: Region data
  const regionData = useMemo(
    () => regionCenters[regionFilter] ?? regionCenters[DEFAULT_REGION],
    [regionFilter, regionCenters]
  );

  const regionOptions = useMemo(
    () => Object.entries(regionCenters).map(([key, value]) => ({ id: key, name: value.name })),
    [regionCenters]
  );

  // Derived: Filtered rusun (cascading + region + search)
  const filteredRusun = useMemo(() => {
    const searchLower = debouncedSearch.toLowerCase();

    return cascading.filteredItems.filter((rusun: RusunData) => {
      const matchesRegion =
        regionFilter === "sumatera-utara" ||
        (regionFilter === "medan" && rusun.kabupaten === "Kota Medan");

      const matchesSearch =
        !debouncedSearch ||
        rusun.name.toLowerCase().includes(searchLower) ||
        rusun.address.toLowerCase().includes(searchLower) ||
        rusun.kelurahan.toLowerCase().includes(searchLower) ||
        rusun.kecamatan.toLowerCase().includes(searchLower);

      return matchesRegion && matchesSearch;
    });
  }, [debouncedSearch, regionFilter, cascading.filteredItems]);

  // Derived: Statistics
  const stats = useMemo(
    () => ({
      totalRusun: filteredRusun.length,
      totalUnits: filteredRusun.reduce((acc, r) => acc + r.units, 0),
    }),
    [filteredRusun]
  );

  // Actions
  const handleRegionChange = useCallback((value: string) => {
    setRegionFilter(value);
    cascading.filterActions.resetFilters();
  }, [cascading.filterActions]);

  const resetFilters = useCallback(() => {
    setSearchQuery("");
    cascading.filterActions.resetFilters();
  }, [cascading.filterActions]);

  const handleRusunSelect = useCallback((rusun: RusunData) => {
    setSelectedRusun(rusun);
    setSidebarOpen(false);
  }, []);

  return {
    // State
    filters: {
      searchQuery,
      regionFilter,
      kabupatenFilter: cascading.filterState.kabupatenFilter,
      kecamatanFilter: cascading.filterState.kecamatanFilter,
      kelurahanFilter: cascading.filterState.kelurahanFilter,
    },
    selectedRusun,
    sidebarOpen,

    // Derived data
    regionData,
    regionOptions,
    filteredRusun,
    filterOptions: {
      kabupatenList: cascading.filterLists.kabupatenList,
      kecamatanList: cascading.filterLists.kecamatanList,
      kelurahanList: cascading.filterLists.kelurahanList,
    },
    stats,

    // Actions
    setSearchQuery,
    setRegionFilter: handleRegionChange,
    setKabupatenFilter: cascading.filterActions.setKabupatenFilter,
    setKecamatanFilter: cascading.filterActions.setKecamatanFilter,
    setKelurahanFilter: cascading.filterActions.setKelurahanFilter,
    setSelectedRusun,
    setSidebarOpen,
    resetFilters,
    handleRusunSelect,
  };
}
