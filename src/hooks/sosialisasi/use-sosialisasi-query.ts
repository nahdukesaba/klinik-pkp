/**
 * Hook: useSosialisasiQuery
 * React Query wrapper untuk mengambil data Sosialisasi PKP dari API.
 * Menggantikan useSosialisasiData yang membaca dari static data.
 *
 * Return type identik dengan SosialisasiRawData agar hook consumer
 * (map, jadwal, berita) tidak perlu diubah.
 */

"use client";

import { useQuery } from "@tanstack/react-query";

import { QUERY_CONFIG } from "@/lib/constants";
import {
  fetchSosialisasiList,
  type SosialisasiResult,
  type SosialisasiLocation,
  type BeritaSosialisasi,
} from "@/services/sosialisasi.service";

export type { SosialisasiLocation, BeritaSosialisasi };

export interface SosialisasiRawData {
  /** Semua lokasi dengan status ter-compute berdasarkan tanggal */
  locations: SosialisasiLocation[];
  /** Lokasi yang belum lewat tanggal (untuk section jadwal) */
  upcomingLocations: SosialisasiLocation[];
  /** Lokasi yang sudah lewat tanggal */
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
  upcomingLocations: [],
  completedLocations: [],
  berita: [],
  kabupatenList: ["Semua Lokasi"],
};

export function useSosialisasiQuery(): SosialisasiRawData {
  const query = useQuery<SosialisasiResult>({
    queryKey: ["sosialisasi"],
    queryFn: fetchSosialisasiList,
    ...QUERY_CONFIG,
  });

  const result = query.data ?? EMPTY_RESULT;

  return {
    locations: result.locations,
    upcomingLocations: result.upcomingLocations,
    completedLocations: result.completedLocations,
    berita: result.berita,
    kabupatenList: result.kabupatenList,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}
