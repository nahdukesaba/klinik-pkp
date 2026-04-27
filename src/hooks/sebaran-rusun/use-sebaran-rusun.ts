/**
 * useSebaranRusun — Semua logika halaman Sebaran Rusun.
 * Menggabungkan fetching data, filter, kontrol peta, dan navigasi dalam satu hook.
 *
 * PERUBAHAN: Filter tahun dihapus — semua data ditampilkan tanpa filter tahun.
 */

"use client";

import { useCallback, useMemo, useState } from "react";

import { useRouter } from "next/navigation";

import { useQuery } from "@tanstack/react-query";

import { useRusunMap } from "@/hooks/sebaran-rusun/use-rusun-map";
import { useCascadingFilter } from "@/hooks/use-cascading-filter";
import { useDebounce } from "@/hooks/use-debounce";
import { useLazyMount } from "@/hooks/use-lazy-mount";
import { usePagination } from "@/hooks/use-pagination";
import { QUERY_CONFIG } from "@/lib/constants";
import { sanitizeInput } from "@/lib/security";
import { fetchRusunList, type RusunData } from "@/services/rusun.service";

const SIDEBAR_PER_PAGE = 12;
const EMPTY_RUSUN: RusunData[] = [];

export function useSebaranRusun() {
  const router = useRouter();
  const query = useQuery({
    queryKey: ["rusun"] as const,
    queryFn: () => fetchRusunList(),
    ...QUERY_CONFIG,
  });
  const data = query.data ?? EMPTY_RUSUN;

  // Filter
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 300);
  const cascading = useCascadingFilter(data);

  // State UI
  const [selectedRusun, setSelectedRusun] = useState<RusunData | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Peta (lazy-mount, aktif hanya saat data siap)
  const mapLazy = useLazyMount();
  const enableMap = mapLazy.isMounted && !query.isLoading && !query.isError;

  // Turunan: daftar terfilter (cascading + pencarian, tanpa year filter)
  const filteredRusun = useMemo(() => {
    const q = sanitizeInput(debouncedSearch).toLowerCase();

    return cascading.filteredItems.filter((rusun: RusunData) => {
      const matchSearch =
        !debouncedSearch ||
        rusun.name.toLowerCase().includes(q) ||
        rusun.address.toLowerCase().includes(q) ||
        rusun.kelurahan.toLowerCase().includes(q) ||
        rusun.kecamatan.toLowerCase().includes(q);

      return matchSearch;
    });
  }, [debouncedSearch, cascading.filteredItems]);

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
  const resetFilters = useCallback(() => {
    setSearchQuery("");
    cascading.filterActions.resetFilters();
  }, [cascading.filterActions]);

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
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    filters: {
      searchQuery,
      kabupatenFilter: cascading.filterState.kabupatenFilter,
      kecamatanFilter: cascading.filterState.kecamatanFilter,
      kelurahanFilter: cascading.filterState.kelurahanFilter,
    },
    selectedRusun,
    sidebarOpen,

    // Turunan
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
    setKabupatenFilter: cascading.filterActions.setKabupatenFilter,
    setKecamatanFilter: cascading.filterActions.setKecamatanFilter,
    setKelurahanFilter: cascading.filterActions.setKelurahanFilter,
    setSidebarOpen,
    resetFilters,
    handleRusunClick,
    handleBack,
  };
}
