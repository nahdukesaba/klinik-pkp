/**
 * Hook: useKawasanKumuhPage
 * Orkestrasi logic halaman Kawasan Kumuh untuk dikonsumsi UI.
 */

"use client";

import { useCallback, useMemo, useState } from "react";

import type { KawasanKumuh } from "@/data/peta-kawasan-kumuh";
import { kawasanRegionCenters, kawasanStatusColors } from "@/data/peta-kawasan-kumuh";
import { useKawasanKumuh } from "@/hooks/kawasan-kumuh/use-kawasan-kumuh";
import { useKawasanKumuhMap } from "@/hooks/kawasan-kumuh/use-kawasan-kumuh-map";
import { useLazyMount } from "@/hooks/use-lazy-mount";

export function useKawasanKumuhPage() {
  const [selectedKawasan, setSelectedKawasan] = useState<KawasanKumuh | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const kawasan = useKawasanKumuh();
  const mapLazy = useLazyMount();
  const map = useKawasanKumuhMap(kawasan.filteredKawasan, setSelectedKawasan, mapLazy.isMounted);

  const regionName = useMemo(() => {
    return (
      kawasanRegionCenters[kawasan.regionFilter]?.name ??
      kawasanRegionCenters["sumatera-utara"].name
    );
  }, [kawasan.regionFilter]);

  const regionOptions = useMemo(() => {
    return Object.entries(kawasanRegionCenters).map(([key, value]) => ({
      id: key,
      name: value.name,
    }));
  }, []);

  const totalPenduduk = useMemo(
    () => kawasan.filteredKawasan.reduce((acc, k) => acc + k.penduduk, 0),
    [kawasan.filteredKawasan]
  );

  const handleKawasanClick = useCallback(
    (kawasanItem: KawasanKumuh) => {
      setSelectedKawasan(kawasanItem);
      setSidebarOpen(false);
      map.flyTo(kawasanItem.lat, kawasanItem.lng, 15);
    },
    [map]
  );

  const handleResetFilters = useCallback(() => {
    kawasan.setKabupatenFilter("all");
    kawasan.setKecamatanFilter("all");
    kawasan.setKelurahanFilter("all");
    kawasan.setStatusFilter("all");
    kawasan.setSearchQuery("");
  }, [kawasan]);

  const toggleSidebar = useCallback(() => {
    setSidebarOpen((prev) => !prev);
  }, []);

  return {
    ...kawasan,
    totalPenduduk,
    regionName,
    regionOptions,
    statusColors: kawasanStatusColors,
    selectedKawasan,
    sidebarOpen,
    setSidebarOpen,
    handleKawasanClick,
    handleResetFilters,
    toggleSidebar,
    mapLazy,
    mapRef: map.mapRef,
  };
}
