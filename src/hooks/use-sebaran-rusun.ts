"use client";

import { useCallback, useMemo, useState } from "react";

import {
  rusunDataList,
  rusunRegionCenters,
  type RusunData,
} from "@/data/peta-sebaran-rusun";

// ============================================
// Types
// ============================================
export interface RusunFilters {
  searchQuery: string;
  regionFilter: string;
  kabupatenFilter: string;
  kecamatanFilter: string;
  kelurahanFilter: string;
}

export interface UseSebaranRusunReturn {
  // State
  filters: RusunFilters;
  selectedRusun: RusunData | null;
  sidebarOpen: boolean;

  // Derived data
  regionData: (typeof rusunRegionCenters)[string];
  filteredRusun: RusunData[];
  filterOptions: {
    kabupatenList: string[];
    kecamatanList: string[];
    kelurahanList: string[];
  };
  stats: {
    totalRusun: number;
    totalUnits: number;
  };

  // Actions
  setSearchQuery: (query: string) => void;
  setRegionFilter: (region: string) => void;
  setKabupatenFilter: (kabupaten: string) => void;
  setKecamatanFilter: (kecamatan: string) => void;
  setKelurahanFilter: (kelurahan: string) => void;
  setSelectedRusun: (rusun: RusunData | null) => void;
  setSidebarOpen: (open: boolean) => void;
  resetFilters: () => void;
  handleRusunSelect: (rusun: RusunData) => void;
}

// ============================================
// Constants
// ============================================
const DEFAULT_REGION = "medan";
const ALL_FILTER = "all";

// ============================================
// Hook Implementation
// ============================================
export function useSebaranRusun(): UseSebaranRusunReturn {
  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [regionFilter, setRegionFilter] = useState(DEFAULT_REGION);
  const [kabupatenFilter, setKabupatenFilter] = useState(ALL_FILTER);
  const [kecamatanFilter, setKecamatanFilter] = useState(ALL_FILTER);
  const [kelurahanFilter, setKelurahanFilter] = useState(ALL_FILTER);

  // UI states
  const [selectedRusun, setSelectedRusun] = useState<RusunData | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Derived: Region data
  const regionData = useMemo(
    () => rusunRegionCenters[regionFilter] ?? rusunRegionCenters[DEFAULT_REGION],
    [regionFilter]
  );

  // Derived: Filter options (cascading)
  const filterOptions = useMemo(() => {
    // Kabupaten list - always show all
    const kabupatenList = [...new Set(rusunDataList.map((r) => r.kabupaten))];

    // Kecamatan list - filtered by kabupaten
    const filteredByKabupaten =
      kabupatenFilter === ALL_FILTER
        ? rusunDataList
        : rusunDataList.filter((r) => r.kabupaten === kabupatenFilter);
    const kecamatanList = [...new Set(filteredByKabupaten.map((r) => r.kecamatan))];

    // Kelurahan list - filtered by kabupaten and kecamatan
    let filteredByKecamatan = filteredByKabupaten;
    if (kecamatanFilter !== ALL_FILTER) {
      filteredByKecamatan = filteredByKecamatan.filter(
        (r) => r.kecamatan === kecamatanFilter
      );
    }
    const kelurahanList = [...new Set(filteredByKecamatan.map((r) => r.kelurahan))];

    return { kabupatenList, kecamatanList, kelurahanList };
  }, [kabupatenFilter, kecamatanFilter]);

  // Derived: Filtered rusun data
  const filteredRusun = useMemo(() => {
    return rusunDataList.filter((rusun) => {
      // Region filter
      const matchesRegion =
        regionFilter === "sumatera-utara" ||
        (regionFilter === "medan" && rusun.kabupaten === "Medan");

      // Search filter
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch =
        !searchQuery ||
        rusun.name.toLowerCase().includes(searchLower) ||
        rusun.address.toLowerCase().includes(searchLower) ||
        rusun.kelurahan.toLowerCase().includes(searchLower) ||
        rusun.kecamatan.toLowerCase().includes(searchLower);

      // Location filters
      const matchesKabupaten =
        kabupatenFilter === ALL_FILTER || rusun.kabupaten === kabupatenFilter;
      const matchesKecamatan =
        kecamatanFilter === ALL_FILTER || rusun.kecamatan === kecamatanFilter;
      const matchesKelurahan =
        kelurahanFilter === ALL_FILTER || rusun.kelurahan === kelurahanFilter;

      return (
        matchesRegion &&
        matchesSearch &&
        matchesKabupaten &&
        matchesKecamatan &&
        matchesKelurahan
      );
    });
  }, [searchQuery, kabupatenFilter, kecamatanFilter, kelurahanFilter, regionFilter]);

  // Derived: Statistics
  const stats = useMemo(
    () => ({
      totalRusun: filteredRusun.length,
      totalUnits: filteredRusun.reduce((acc, r) => acc + r.units, 0),
    }),
    [filteredRusun]
  );

  // Actions
  const handleKabupatenChange = useCallback((value: string) => {
    setKabupatenFilter(value);
    setKecamatanFilter(ALL_FILTER);
    setKelurahanFilter(ALL_FILTER);
  }, []);

  const handleKecamatanChange = useCallback((value: string) => {
    setKecamatanFilter(value);
    setKelurahanFilter(ALL_FILTER);
  }, []);

  const resetFilters = useCallback(() => {
    setSearchQuery("");
    setKabupatenFilter(ALL_FILTER);
    setKecamatanFilter(ALL_FILTER);
    setKelurahanFilter(ALL_FILTER);
  }, []);

  const handleRusunSelect = useCallback((rusun: RusunData) => {
    setSelectedRusun(rusun);
    setSidebarOpen(false);
  }, []);

  // Combine filters for external use
  const filters: RusunFilters = {
    searchQuery,
    regionFilter,
    kabupatenFilter,
    kecamatanFilter,
    kelurahanFilter,
  };

  return {
    filters,
    selectedRusun,
    sidebarOpen,
    regionData,
    filteredRusun,
    filterOptions,
    stats,
    setSearchQuery,
    setRegionFilter,
    setKabupatenFilter: handleKabupatenChange,
    setKecamatanFilter: handleKecamatanChange,
    setKelurahanFilter,
    setSelectedRusun,
    setSidebarOpen,
    resetFilters,
    handleRusunSelect,
  };
}
