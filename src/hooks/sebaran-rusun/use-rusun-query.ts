/**
 * useRusunQuery — React Query hook untuk data Rusun.
 *
 * Hook ini HANYA mengelola React Query state (caching, loading, error).
 * Logika API dan transformasi data ada di `@/services/rusun.service`.
 *
 * @see services/rusun.service.ts — pemanggilan API & transformasi
 * @see docs/API_DOCUMENTATION.md — Section 11. Rusun
 */

"use client";

import { useQuery } from "@tanstack/react-query";

import { QUERY_CONFIG } from "@/lib/constants";
import {
  fetchRusunList,
  type RusunData,
} from "@/services/rusun.service";

// Re-export tipe agar consumer tidak perlu import dari dua tempat
export type { RusunData };

/** Stable empty-array reference to avoid useMemo re-computation when query.data is undefined */
const EMPTY_RUSUN: RusunData[] = [];

/**
 * Hook untuk mengambil dan meng-cache data rusun dari API.
 */
export function useRusunQuery() {
  const query = useQuery({
    queryKey: ["rusun"] as const,
    queryFn: () => fetchRusunList(),
    ...QUERY_CONFIG,
  });

  const data = query.data ?? EMPTY_RUSUN;

  return {
    /** Daftar semua data rusun yang sudah ditransformasi */
    data,
    /** Sedang memuat data pertama kali */
    isLoading: query.isLoading,
    /** Terjadi error saat fetch */
    isError: query.isError,
    /** Object error jika ada */
    error: query.error,
    /** Fungsi untuk refetch manual */
    refetch: query.refetch,
  };
}
