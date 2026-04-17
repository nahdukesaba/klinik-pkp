/**
 * Hook: useRusunQuery
 * React Query wrapper untuk data Sebaran Rusun.
 */

"use client";

import { useQuery } from "@tanstack/react-query";

import { QUERY_CONFIG } from "@/lib/constants";
import { fetchRusunList, type RusunData } from "@/services/rusun.service";

export type { RusunData };

const EMPTY: RusunData[] = [];

export function useRusunQuery() {
  const query = useQuery({
    queryKey: ["rusun"] as const,
    queryFn: () => fetchRusunList(),
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
