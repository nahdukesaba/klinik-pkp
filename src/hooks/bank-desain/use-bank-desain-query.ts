"use client";

/** useBankDesainQuery — React Query wrapper untuk data Bank Desain. */

import { useMemo } from "react";

import { useQuery } from "@tanstack/react-query";

import { QUERY_CONFIG } from "@/lib/constants";
import {
  fetchBankDesainList,
  deriveFilterCategories,
  type BankDesainData,
  type FilterCategories,
} from "@/services/bank-desain.service";

export type { BankDesainData, FilterCategories };

/** Stable empty-array reference to avoid useMemo re-computation when query.data is undefined */
const EMPTY_DESAIN: BankDesainData[] = [];

export function useBankDesainQuery() {
  const query = useQuery({
    queryKey: ["bank-desain"] as const,
    queryFn: fetchBankDesainList,
    ...QUERY_CONFIG,
  });

  const data = query.data ?? EMPTY_DESAIN;

  // Memoize filter categories agar tidak dihitung ulang setiap render.
  // Ref: react-query-best-practices/query-select-transforms
  const categories = useMemo(
    () => deriveFilterCategories(data),
    [data]
  );

  return {
    data,
    categories,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}
