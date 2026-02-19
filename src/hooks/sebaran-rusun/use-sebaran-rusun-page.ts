/**
 * Hook: useSebaranRusunPage
 * Orkestrasi logic halaman Sebaran Rusun untuk dikonsumsi UI.
 */

"use client";

import { useCallback } from "react";

import { useRouter } from "next/navigation";

import type { RusunData } from "@/data/peta-sebaran-rusun";
import { useRusunMap } from "@/hooks/sebaran-rusun/use-rusun-map";
import { useSebaranRusun } from "@/hooks/sebaran-rusun/use-sebaran-rusun";
import { useLazyMount } from "@/hooks/use-lazy-mount";

export function useSebaranRusunPage() {
  const router = useRouter();
  const sebaran = useSebaranRusun();

  const handleMarkerSelect = useCallback(
    (rusun: RusunData) => {
      sebaran.handleRusunSelect(rusun);
      sebaran.setSidebarOpen(false);
    },
    [sebaran]
  );

  const mapLazy = useLazyMount();
  const map = useRusunMap(sebaran.filteredRusun, handleMarkerSelect, mapLazy.isMounted, sebaran.regionData, sebaran.sidebarOpen);

  const handleRusunClick = useCallback(
    (rusun: RusunData) => {
      sebaran.handleRusunSelect(rusun);
      sebaran.setSidebarOpen(false);
      map.flyToLocation(rusun.lat, rusun.lng, 14);
    },
    [map, sebaran]
  );

  const handleBack = useCallback(() => {
    router.push("/");
  }, [router]);

  return {
    handleBack,
    ...sebaran,
    ...map,
    mapLazy,
    handleRusunClick,
  };
}
