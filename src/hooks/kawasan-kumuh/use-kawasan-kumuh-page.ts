/**
 * Hook: useKawasanKumuhPage
 * Orkestrasi logic halaman Kawasan Kumuh untuk dikonsumsi UI.
 */

"use client";

import { useCallback, useMemo, useState } from "react";

import { useKawasanKumuh } from "@/hooks/kawasan-kumuh/use-kawasan-kumuh";
import { useKawasanKumuhMap } from "@/hooks/kawasan-kumuh/use-kawasan-kumuh-map";
import { useLazyMount } from "@/hooks/use-lazy-mount";
import type { KawasanKumuhData } from "@/services/kawasan-kumuh.service";
import { kawasanStatusColors } from "@/services/kawasan-kumuh.service";

export function useKawasanKumuhPage() {
  const [selectedKawasan, setSelectedKawasan] = useState<KawasanKumuhData | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const kawasan = useKawasanKumuh();
  const mapLazy = useLazyMount();
  const map = useKawasanKumuhMap(kawasan.filteredKawasan, setSelectedKawasan, mapLazy.isMounted);

  const totalPenduduk = useMemo(
    () => kawasan.filteredKawasan.reduce((acc, k) => acc + k.penduduk, 0),
    [kawasan.filteredKawasan]
  );

  const handleKawasanClick = useCallback(
    (kawasanItem: KawasanKumuhData) => {
      setSelectedKawasan(kawasanItem);
      setSidebarOpen(false);
      map.flyTo(kawasanItem.lat, kawasanItem.lng, 15);
    },
    [map]
  );

  const handleResetFilters = useCallback(() => {
    kawasan.setKabupatenFilter("all");
    kawasan.setStatusFilter("all");
    kawasan.setSearchQuery("");
    kawasan.resetYear();
  }, [kawasan]);

  const toggleSidebar = useCallback(() => {
    setSidebarOpen((prev) => !prev);
  }, []);

  return {
    ...kawasan,
    totalPenduduk,
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
