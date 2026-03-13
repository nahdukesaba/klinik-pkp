/**
 * Hook: useBspsQuery
 * React Query wrapper — fetch data per-tahun.
 * useBspsYearsQuery — ambil semua data 1x (cache lama) untuk daftar tahun.
 *
 * Query key dipisah agar tidak collision:
 * - Years: ["bsps-years"]
 * - Data:  ["bsps", year]
 */

"use client";

import { useQuery, keepPreviousData } from "@tanstack/react-query";

import { CURRENT_YEAR_NUM, QUERY_CONFIG } from "@/lib/constants";
import { fetchBspsList, type BspsData } from "@/services/bsps.service";

export type { BspsData };

const EMPTY: BspsData[] = [];

/**
 * Daftar tahun yang tersedia — derived dari semua data (1x fetch, cache 30 menit).
 * Selalu menyertakan CURRENT_YEAR_NUM agar tahun sekarang tidak hilang dari dropdown.
 */
export function useBspsYearsQuery(): number[] {
  const query = useQuery({
    queryKey: ["bsps-years"],
    queryFn: () => fetchBspsList(),
    staleTime: 30 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
    retry: 2,
    refetchOnWindowFocus: false,
    select: (data) => {
      const years = [...new Set(data.map((d) => d.yearGiven))];
      if (!years.includes(CURRENT_YEAR_NUM)) years.push(CURRENT_YEAR_NUM);
      return years.sort((a, b) => b - a);
    },
  });

  return query.data ?? [CURRENT_YEAR_NUM];
}

/** Data per-tahun (undefined = semua tahun) */
export function useBspsQuery(year?: number) {
  const query = useQuery({
    queryKey: ["bsps", year ?? "all"],
    queryFn: () => fetchBspsList(year),
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
