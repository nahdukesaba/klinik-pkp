/**
 * Hook: useSosialisasiPKPPage
 *
 * Orkestrasi logic halaman Sosialisasi Klinik PKP.
 *
 * Pattern: Single Source of Truth
 * - useSosialisasiData() = Variabel A (data mentah, 1x load)
 * - map/jadwal/berita   = Variabel B (derived, masing-masing filter sendiri)
 *
 * Data flow:
 *   useSosialisasiData() → rawData (immutable)
 *     ├── useSosialisasiPKPMap(rawData.locations)      → filteredMapLocations
 *     ├── useSosialisasiPKPJadwal(rawData.upcoming)    → filteredJadwal
 *     └── useSosialisasiPKPBerita(rawData.berita)      → filteredBerita
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
  // Variabel A: 1x load semua data mentah
  const rawData = useSosialisasiQuery();

  // Variabel B: masing-masing hook filter dari data mentah
  const jadwal = useSosialisasiPKPJadwal(rawData.upcomingLocations, rawData.kabupatenList);
  const berita = useSosialisasiPKPBerita(rawData.berita);
  const mapLazy = useLazyMount();

  const map = useSosialisasiPKPMap(rawData.locations, mapLazy.isMounted, onImageClick);

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