"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { useDebounce } from "@/hooks/use-debounce";
import { DEFAULT_DEBOUNCE_DELAY_MS } from "@/lib/constants";

import { AdminDataTableDesktop } from "./data-table/AdminDataTableDesktop";
import { AdminDataTableMobileCards } from "./data-table/AdminDataTableMobileCards";
import { AdminDataTablePagination } from "./data-table/AdminDataTablePagination";
import { AdminDataTableToolbar } from "./data-table/AdminDataTableToolbar";
import {
  RoleBadge,
  StatusBadge,
  deleteAction,
  editAction,
} from "./data-table/badges";
import {
  filterTableData,
  paginateTableData,
  sortTableData,
} from "./data-table/helpers";

import type { AdminDataTableProps, Column } from "./data-table/types";

export type { Column, TableAction } from "./data-table/types";
export { StatusBadge, RoleBadge, editAction, deleteAction };

export function AdminDataTable<T extends object>({
  columns,
  data,
  actions,
  keyField = "id",
  searchPlaceholder = "Cari...",
  searchFields = [],
  perPage = 10,
  showSearch = true,
  emptyMessage = "Tidak ada data ditemukan",
  isLoading = false,
  isRefreshing = false,
  headerActions,
  pagination,
}: AdminDataTableProps<T>) {
  const [search, setSearch] = useState(pagination?.searchValue ?? "");
  const [sortKey, setSortKey] = useState<string | null>(
    pagination?.sortKey ?? null
  );
  const [sortDir, setSortDir] = useState<"asc" | "desc">(
    pagination?.sortDirection ?? "asc"
  );
  const [currentPage, setCurrentPage] = useState(1);

  const debouncedSearch = useDebounce(search, DEFAULT_DEBOUNCE_DELAY_MS);
  const usesBackendPagination = Boolean(pagination);
  const onPageChange = pagination?.onPageChange;
  const onBackendSearchChange = pagination?.onSearchChange;
  const onBackendSortChange = pagination?.onSortChange;
  const usesBackendFiltering = Boolean(
    usesBackendPagination &&
      onBackendSearchChange &&
      pagination?.searchMode !== "local"
  );
  const usesBackendSorting = Boolean(
    usesBackendPagination &&
      onBackendSortChange &&
      pagination?.sortMode !== "local"
  );
  const usesLocalPaginatedFiltering = Boolean(
    usesBackendPagination && pagination?.searchMode === "local"
  );
  const usesLocalPaginatedSorting = Boolean(
    usesBackendPagination && pagination?.sortMode === "local"
  );
  const previousDebouncedSearchRef = useRef(debouncedSearch);

  useEffect(() => {
    if (
      !usesBackendPagination ||
      previousDebouncedSearchRef.current === debouncedSearch
    ) {
      return;
    }

    previousDebouncedSearchRef.current = debouncedSearch;

    if (usesBackendFiltering && onBackendSearchChange) {
      onBackendSearchChange(debouncedSearch.trim());
      return;
    }

    if (usesLocalPaginatedFiltering && onPageChange) {
      onPageChange(1);
    }
  }, [
    debouncedSearch,
    onBackendSearchChange,
    onPageChange,
    usesBackendFiltering,
    usesBackendPagination,
    usesLocalPaginatedFiltering,
  ]);

  const filteredData = useMemo(
    () =>
      usesBackendFiltering
        ? data
        : filterTableData(data, debouncedSearch, searchFields),
    [data, debouncedSearch, searchFields, usesBackendFiltering]
  );
  const sortedData = useMemo(
    () =>
      usesBackendSorting
        ? filteredData
        : sortTableData(filteredData, sortKey, sortDir),
    [filteredData, sortDir, sortKey, usesBackendSorting]
  );

  const totalPages = usesBackendPagination
    ? Math.max(1, pagination?.totalPages ?? 1)
    : Math.max(1, Math.ceil(sortedData.length / perPage));
  const activePage = usesBackendPagination
    ? Math.min(Math.max(1, pagination?.currentPage ?? 1), totalPages)
    : Math.min(currentPage, totalPages);
  const paginatedData = useMemo(() => {
    if (usesBackendPagination) {
      return sortedData;
    }

    return paginateTableData(sortedData, activePage, perPage);
  }, [activePage, perPage, sortedData, usesBackendPagination]);

  const totalItems = usesBackendPagination
    ? pagination?.totalItems ?? paginatedData.length
    : sortedData.length;
  const pageSize = usesBackendPagination
    ? pagination?.pageSize ?? perPage
    : perPage;
  const hasSearchQuery = debouncedSearch.trim().length > 0;
  const pageStart = totalItems === 0 ? 0 : (activePage - 1) * pageSize + 1;
  const pageEnd =
    totalItems === 0 ? 0 : pageStart + Math.max(0, paginatedData.length - 1);

  const handleSort = useCallback(
    (key: string) => {
      const nextSortDir = sortKey === key && sortDir === "asc" ? "desc" : "asc";

      setSortKey(key);
      setSortDir(nextSortDir);

      if (usesBackendSorting && onBackendSortChange) {
        onBackendSortChange({
          sortKey: key,
          sortDirection: nextSortDir,
        });
        return;
      }

      if (usesLocalPaginatedSorting && onPageChange) {
        onPageChange(1);
      }
    },
    [
      onBackendSortChange,
      onPageChange,
      sortDir,
      sortKey,
      usesBackendSorting,
      usesLocalPaginatedSorting,
    ]
  );

  const handleSearchChange = useCallback(
    (value: string) => {
      setSearch(value);

      if (!usesBackendPagination) {
        setCurrentPage(1);
      }
    },
    [usesBackendPagination]
  );

  const handlePageChange = useCallback(
    (page: number) => {
      if (usesBackendPagination && pagination) {
        pagination.onPageChange(page);
        return;
      }

      setCurrentPage(page);
    },
    [pagination, usesBackendPagination]
  );

  const renderCellValue = useCallback(
    (item: T, column: Column<T>) =>
      column.render
        ? column.render(item)
        : String((item as Record<string, unknown>)[column.key] ?? "-"),
    []
  );

  if (isLoading) {
    return (
      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <div className="space-y-3 p-4">
          {Array.from({ length: 5 }).map((_, index) => (
            <div
              key={index}
              className="h-12 animate-pulse rounded-lg bg-muted/50"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      {isRefreshing ? (
        null
      ) : null}

      <AdminDataTableToolbar
        showSearch={showSearch}
        searchPlaceholder={searchPlaceholder}
        searchValue={search}
        headerActions={headerActions}
        onSearchChange={handleSearchChange}
      />

      <AdminDataTableMobileCards
        columns={columns}
        data={paginatedData}
        keyField={keyField}
        activePage={activePage}
        emptyMessage={emptyMessage}
        actions={actions}
        renderCellValue={renderCellValue}
      />

      <AdminDataTableDesktop
        columns={columns}
        data={paginatedData}
        actions={actions}
        keyField={keyField}
        activePage={activePage}
        emptyMessage={emptyMessage}
        sortKey={sortKey}
        sortDir={sortDir}
        useSortField={usesBackendSorting}
        onSort={handleSort}
        renderCellValue={renderCellValue}
      />

      <AdminDataTablePagination
        totalPages={totalPages}
        activePage={activePage}
        totalItems={totalItems}
        pageStart={pageStart}
        pageEnd={pageEnd}
        hasSearchQuery={hasSearchQuery}
        usesBackendPagination={usesBackendPagination}
        currentPageItemCount={paginatedData.length}
        onPageChange={handlePageChange}
      />
    </div>
  );
}
