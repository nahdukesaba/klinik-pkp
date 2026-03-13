/**
 * Hook: useKawasanKumuhQuery
 * React Query wrapper — fetch data per-tahun.
 * useKumuhYearsQuery — ambil semua data 1x (cache lama) untuk daftar tahun.
 *
 * Query key dipisah agar tidak collision:
 * - Years: ["kawasan-kumuh-years"]
 * - Data:  ["kawasan-kumuh", year]
 */

"use client";

import { useQuery, keepPreviousData } from "@tanstack/react-query";

import { CURRENT_YEAR_NUM, QUERY_CONFIG } from "@/lib/constants";
import {
  fetchKumuhList,
  type KawasanKumuhData,
} from "@/services/kawasan-kumuh.service";

export type { KawasanKumuhData };

const EMPTY: KawasanKumuhData[] = [];

/**
 * Daftar tahun yang tersedia — derived dari semua data (1x fetch, cache 30 menit).
 * Selalu menyertakan CURRENT_YEAR_NUM agar tahun sekarang tidak hilang dari dropdown.
 */
export function useKumuhYearsQuery(): number[] {
  const query = useQuery({
    queryKey: ["kawasan-kumuh-years"],
    queryFn: () => fetchKumuhList(),
    staleTime: 30 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
    retry: 2,
    refetchOnWindowFocus: false,
    select: (data) => {
      const years = [...new Set(data.map((k) => k.yearInspected))];
      if (!years.includes(CURRENT_YEAR_NUM)) years.push(CURRENT_YEAR_NUM);
      return years.sort((a, b) => b - a);
    },
  });

  return query.data ?? [CURRENT_YEAR_NUM];
}

/** Ambil data per-tahun (undefined = semua tahun) */
export function useKawasanKumuhQuery(year?: number) {
  const query = useQuery({
    queryKey: ["kawasan-kumuh", year ?? "all"],
    queryFn: () => fetchKumuhList(year),
    placeholderData: keepPreviousData,
    ...QUERY_CONFIG,
  });

  return {
    data: query.data ?? EMPTY,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}
