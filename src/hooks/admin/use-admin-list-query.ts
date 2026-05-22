"use client";

import { startTransition, useCallback, useMemo, useState } from "react";

import { useDebounce } from "@/hooks/use-debounce";
import {
  ADMIN_TABLE_PAGE_SIZE,
  DEFAULT_DEBOUNCE_DELAY_MS,
} from "@/lib/constants";
import type { SortDirection } from "@/types/api";

import {
  useAdminTableFilters,
  type AdminTableFilterValue,
} from "./use-admin-table-filters";

type AdminFilterValue = AdminTableFilterValue;

export interface UseAdminListQueryOptions<
  TFilters extends Record<string, AdminFilterValue>,
> {
  defaultFilters?: TFilters;
  pageSize?: number;
}

export interface AdminListQueryParams<
  TFilters extends Record<string, AdminFilterValue>,
> {
  page: number;
  perPage: number;
  keyword?: string;
  sortBy: string | null;
  sortDirection: SortDirection;
  filters: TFilters;
}

export function useAdminListQuery<
  TFilters extends Record<string, AdminFilterValue> = Record<
    string,
    AdminFilterValue
  >,
>(options: UseAdminListQueryOptions<TFilters> = {}) {
  const [defaultFilters] = useState(
    () => (options.defaultFilters ?? {}) as TFilters
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(options.pageSize ?? ADMIN_TABLE_PAGE_SIZE);
  const [searchInput, setSearchInput] = useState("");
  const [sortBy, setSortBy] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const searchKeyword = useDebounce(
    searchInput,
    DEFAULT_DEBOUNCE_DELAY_MS
  ).trim();

  const resetPage = useCallback(() => {
    startTransition(() => {
      setCurrentPage(1);
    });
  }, []);

  const tableFilters = useAdminTableFilters<TFilters>({
    defaultFilters,
    onFiltersChange: resetPage,
  });

  const setPage = useCallback((page: number) => {
    startTransition(() => {
      setCurrentPage(Math.max(1, Math.trunc(page)));
    });
  }, []);

  const setSearch = useCallback(
    (keyword: string) => {
      setSearchInput(keyword);
      resetPage();
    },
    [resetPage]
  );

  const setSort = useCallback(
    (state: { sortKey: string; sortDirection: SortDirection }) => {
      setSortBy(state.sortKey);
      setSortDirection(state.sortDirection);
      resetPage();
    },
    [resetPage]
  );

  const resetFilters = useCallback(() => {
    setSearchInput("");
    setSortBy(null);
    setSortDirection("asc");
    tableFilters.resetFilters();
  }, [tableFilters]);

  const queryParams = useMemo(
    () => ({
      page: currentPage,
      perPage: pageSize,
      keyword: searchKeyword || undefined,
      sortBy,
      sortDirection,
      ...tableFilters.filters,
    }),
    [
      currentPage,
      pageSize,
      searchKeyword,
      sortBy,
      sortDirection,
      tableFilters.filters,
    ]
  );

  const tableState = useMemo(
    () => ({
      currentPage,
      totalPages: 1,
      totalItems: 0,
      pageSize,
      onPageChange: setPage,
      sortKey: sortBy,
      sortDirection,
      onSortChange: setSort,
    }),
    [currentPage, pageSize, setPage, setSort, sortBy, sortDirection]
  );

  return {
    currentPage,
    pageSize,
    searchInput,
    searchKeyword,
    sortBy,
    sortDirection,
    filters: tableFilters.filters,
    setPage,
    setSearch,
    setSort,
    setFilter: tableFilters.setFilter,
    setRegionFilter: tableFilters.setRegionFilter,
    setDistrictFilter: tableFilters.setDistrictFilter,
    resetFilters,
    activeFilterCount: tableFilters.activeFilterCount,
    queryParams,
    tableState,
  };
}
