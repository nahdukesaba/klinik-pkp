/**
 * Hook: useKawasanKumuh
 * Mengelola data dan filter untuk halaman Kawasan Kumuh.
 * Menggunakan useCascadingFilter untuk filter lokasi cascading.
 *
 * Saat API siap, ganti isi `data` dengan response API
 * (misalnya via React Query) tanpa mengubah return type.
 */

import { useMemo, useState } from "react";

import {
  kawasanKumuhData,
  type KawasanKumuh,
} from "@/data/peta-kawasan-kumuh";
import { useCascadingFilter } from "@/hooks/use-cascading-filter";
import { useDebounce } from "@/hooks/use-debounce";

export function useKawasanKumuh() {
  // Data source (ganti dengan API call saat siap)
  const data = kawasanKumuhData;

  const [searchQuery, setSearchQuery] = useState("");
  const [regionFilter, setRegionFilter] = useState("sumatera-utara");
  const [statusFilter, setStatusFilter] = useState("all");

  const debouncedSearch = useDebounce(searchQuery, 300);

  // Use shared cascading filter for location filters
  const cascading = useCascadingFilter(data);

  // Filter items combining all criteria
  const filteredKawasan = useMemo(() => {
    const searchLower = debouncedSearch.toLowerCase();

    return cascading.filteredItems.filter((kawasan: KawasanKumuh) => {
      const matchesRegion =
        regionFilter === "sumatera-utara" ||
        (regionFilter === "medan" && kawasan.kabupaten === "Medan");

      const matchesSearch =
        !debouncedSearch ||
        kawasan.name.toLowerCase().includes(searchLower) ||
        kawasan.kelurahan.toLowerCase().includes(searchLower) ||
        kawasan.kecamatan.toLowerCase().includes(searchLower) ||
        kawasan.kabupaten.toLowerCase().includes(searchLower);

      const matchesStatus =
        statusFilter === "all" || kawasan.status === statusFilter;

      return matchesRegion && matchesSearch && matchesStatus;
    });
  }, [debouncedSearch, regionFilter, statusFilter, cascading.filteredItems]);

  return {
    filteredKawasan,
    kabupatenList: cascading.filterLists.kabupatenList,
    kecamatanList: cascading.filterLists.kecamatanList,
    kelurahanList: cascading.filterLists.kelurahanList,
    searchQuery,
    regionFilter,
    kabupatenFilter: cascading.filterState.kabupatenFilter,
    kecamatanFilter: cascading.filterState.kecamatanFilter,
    kelurahanFilter: cascading.filterState.kelurahanFilter,
    statusFilter,
    setSearchQuery,
    setRegionFilter,
    setKabupatenFilter: cascading.filterActions.setKabupatenFilter,
    setKecamatanFilter: cascading.filterActions.setKecamatanFilter,
    setKelurahanFilter: cascading.filterActions.setKelurahanFilter,
    setStatusFilter,
  };
}
