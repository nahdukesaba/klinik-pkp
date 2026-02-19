/**
 * Hook: usePenerimaanBsps
 * Mengelola state filter dan data penerimaan BSPS.
 * Menggunakan useCascadingFilter untuk filter lokasi cascading.
 *
 * Saat API siap, ganti isi `rawData` dengan response API
 * (misalnya via React Query) tanpa mengubah return type.
 */

import { useCallback, useMemo, useState } from "react";

import {
  desaPenerimaanData,
} from "@/data/penerimaan-bsps";
import { useCascadingFilter } from "@/hooks/use-cascading-filter";
import { useDebounce } from "@/hooks/use-debounce";

export function usePenerimaanBsps() {
  // Data source (ganti dengan API call saat siap)
  const rawData = desaPenerimaanData;

  const [searchQuery, setSearchQuery] = useState("");
  const [regionFilter, setRegionFilter] = useState("sumatera-utara");
  const [statusFilter, setStatusFilter] = useState("all");

  const debouncedSearch = useDebounce(searchQuery, 300);

  // Map data to add kelurahan field for cascading filter compatibility
  // (inside hook, bukan module-level, supaya aman untuk API data yang berubah)
  const desaWithKelurahan = useMemo(
    () => rawData.map((d) => ({ ...d, kelurahan: d.kelurahan || d.nama })),
    [rawData]
  );

  // Use shared cascading filter
  const cascading = useCascadingFilter(desaWithKelurahan);

  // Combined filtering (cascading + search + status + region)
  const filteredDesa = useMemo(() => {
    const searchLower = debouncedSearch.toLowerCase();

    return cascading.filteredItems.filter((p) => {
      const matchesRegion =
        regionFilter === "sumatera-utara" ||
        (regionFilter === "medan" && p.kabupaten === "Kota Medan");

      const matchesSearch =
        !debouncedSearch || p.nama.toLowerCase().includes(searchLower);
      const matchesStatus =
        statusFilter === "all" || p.status === statusFilter;

      return matchesRegion && matchesSearch && matchesStatus;
    });
  }, [debouncedSearch, regionFilter, statusFilter, cascading.filteredItems]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (cascading.filterState.kabupatenFilter !== "all") count++;
    if (cascading.filterState.kecamatanFilter !== "all") count++;
    if (cascading.filterState.kelurahanFilter !== "all") count++;
    if (statusFilter !== "all") count++;
    if (regionFilter !== "sumatera-utara") count++;
    return count;
  }, [cascading.filterState, statusFilter, regionFilter]);

  const resetFilters = useCallback(() => {
    cascading.filterActions.resetFilters();
    setRegionFilter("sumatera-utara");
    setStatusFilter("all");
    setSearchQuery("");
  }, [cascading.filterActions]);

  return {
    filteredDesa,
    kabupatenList: cascading.filterLists.kabupatenList,
    kecamatanList: cascading.filterLists.kecamatanList,
    kelurahanList: cascading.filterLists.kelurahanList,
    searchQuery,
    regionFilter,
    kabupatenFilter: cascading.filterState.kabupatenFilter,
    kecamatanFilter: cascading.filterState.kecamatanFilter,
    kelurahanFilter: cascading.filterState.kelurahanFilter,
    statusFilter,
    activeFilterCount,
    setSearchQuery,
    setRegionFilter,
    setKabupatenFilter: cascading.filterActions.setKabupatenFilter,
    setKecamatanFilter: cascading.filterActions.setKecamatanFilter,
    setKelurahanFilter: cascading.filterActions.setKelurahanFilter,
    setStatusFilter,
    resetFilters,
  };
}
