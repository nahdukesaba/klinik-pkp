/**
 * Hook: useKawasanKumuhQuery
 * React Query wrapper — fetch data per-tahun untuk efisiensi.
 * useKumuhYearsQuery() mengambil semua data 1x (cache lama) untuk daftar tahun.
 */

"use client";

import { useQuery, keepPreviousData } from "@tanstack/react-query";

import { QUERY_CONFIG } from "@/lib/constants";
import {
  fetchKumuhList,
  type KawasanKumuhData,
} from "@/services/kawasan-kumuh.service";

export type { KawasanKumuhData };

const EMPTY: KawasanKumuhData[] = [];
const CURRENT_YEAR_NUM = new Date().getFullYear();

/** Ambil daftar tahun yang tersedia (fetch all, cache 30 menit) */
export function useKumuhYearsQuery() {
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
    isFetching: query.isFetching,
    isPlaceholderData: query.isPlaceholderData,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}
