/**
 * Hook: useSosialisasiQuery
 * React Query wrapper untuk mengambil data Sosialisasi PKP dari API.
 * Menggantikan useSosialisasiData yang membaca dari static data.
 *
 * Return type identik dengan SosialisasiRawData agar hook consumer
 * (map, jadwal, berita) tidak perlu diubah.
 */

"use client";

import { useMemo } from "react";

import { useQuery } from "@tanstack/react-query";

import { useCurrentTime } from "@/hooks/use-current-time";
import { QUERY_CONFIG } from "@/lib/constants";
import {
  buildSosialisasiResultFromLocations,
  fetchSosialisasiList,
  type SosialisasiResult,
  type SosialisasiLocation,
  type BeritaSosialisasi,
} from "@/services/sosialisasi.service";

export type { SosialisasiLocation, BeritaSosialisasi };

export interface SosialisasiRawData {
  /** Lokasi yang boleh tampil di peta publik */
  locations: SosialisasiLocation[];
  /** Lokasi yang selesai tetapi masih menunggu dokumentasi */
  pendingLocations: SosialisasiLocation[];
  /** Lokasi yang belum lewat tanggal (untuk section jadwal) */
  upcomingLocations: SosialisasiLocation[];
  /** Lokasi yang sudah selesai dan siap tampil */
  completedLocations: SosialisasiLocation[];
  /** Berita yang sudah selesai dan memiliki deskripsi */
  berita: BeritaSosialisasi[];
  /** Daftar kabupaten untuk filter dropdown */
  kabupatenList: string[];
  /** Status loading */
  isLoading: boolean;
  /** Status error */
  isError: boolean;
  /** Object error jika ada */
  error: Error | null;
  /** Fungsi untuk retry fetch */
  refetch: () => void;
}

// Hoist default value ke module-level agar referensi stabil antar render.
// Ref: vercel-react-best-practices/rerender-memo-with-default-value
const EMPTY_RESULT: SosialisasiResult = {
  locations: [],
  publicLocations: [],
  upcomingLocations: [],
  completedLocations: [],
  pendingLocations: [],
  berita: [],
  kabupatenList: ["Semua Lokasi"],
};

export function useSosialisasiQuery(): SosialisasiRawData {
  const currentTime = useCurrentTime();
  const query = useQuery<SosialisasiResult>({
    queryKey: ["sosialisasi"],
    queryFn: () => fetchSosialisasiList(),
    ...QUERY_CONFIG,
    refetchInterval: 30_000,
    refetchIntervalInBackground: true,
  });

  const result = useMemo(() => {
    if (!query.data) {
      return EMPTY_RESULT;
    }

    return buildSosialisasiResultFromLocations(
      query.data.locations,
      currentTime
    );
  }, [currentTime, query.data]);
  const upcomingKabupatenList = [
    "Semua Lokasi",
    ...Array.from(
      new Set(
        result.upcomingLocations
          .map((item) => item.kabupaten)
          .filter((item) => item.trim() !== "")
      )
    ).sort(),
  ];

  return {
    locations: result.publicLocations,
    pendingLocations: result.pendingLocations,
    upcomingLocations: result.upcomingLocations,
    completedLocations: result.completedLocations,
    berita: result.berita,
    kabupatenList: upcomingKabupatenList,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}
