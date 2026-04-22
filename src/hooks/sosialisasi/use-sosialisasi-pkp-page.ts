/**
 * Hook: useSosialisasiPKPPage
 *
 * Orkestrasi logic halaman Sosialisasi Klinik PKP.
 *
 * Pattern: Single Source of Truth
 * - useSosialisasiQuery() = data mentah, 1x load
 * - map, jadwal, berita   = derived state dengan filter masing-masing
 */

"use client";

import { useCallback } from "react";

import { useSosialisasiPKPBerita } from "@/hooks/sosialisasi/use-sosialisasi-pkp-berita";
import { useSosialisasiPKPJadwal } from "@/hooks/sosialisasi/use-sosialisasi-pkp-jadwal";
import { useSosialisasiPKPMap } from "@/hooks/sosialisasi/use-sosialisasi-pkp-map";
import { useSosialisasiQuery } from "@/hooks/sosialisasi/use-sosialisasi-query";
import { useLazyMount } from "@/hooks/use-lazy-mount";

export function useSosialisasiPKPPage(
  onImageClick?: (images: string[], index: number, title: string) => void
) {
  const rawData = useSosialisasiQuery();

  const jadwal = useSosialisasiPKPJadwal(
    rawData.upcomingLocations,
    rawData.upcomingKabupatenList
  );
  const berita = useSosialisasiPKPBerita(rawData.berita);
  const mapLazy = useLazyMount();
  const map = useSosialisasiPKPMap(
    rawData.locations,
    mapLazy.isMounted,
    onImageClick
  );

  const flyToLocation = useCallback((coordinates: [number, number]) => {
    const [lat, lng] = coordinates;
    map.flyTo(lat, lng, 14);
  }, [map]);

  return {
    jadwal,
    berita,
    map,
    mapLazy,
    flyToLocation,
    isLoading: rawData.isLoading,
    isError: rawData.isError,
    error: rawData.error,
    refetch: rawData.refetch,
  };
}
