"use client";

import { useCallback, useMemo, useState } from "react";

import { useDebounce } from "@/hooks/use-debounce";

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
  headerActions,
  pagination,
}: AdminDataTableProps<T>) {
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [currentPage, setCurrentPage] = useState(1);

  const debouncedSearch = useDebounce(search, 300);
  const usesBackendPagination = Boolean(pagination);

  const filteredData = useMemo(
    () => filterTableData(data, debouncedSearch, searchFields),
    [data, debouncedSearch, searchFields]
  );
  const sortedData = useMemo(
    () => sortTableData(filteredData, sortKey, sortDir),
    [filteredData, sortDir, sortKey]
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
      if (sortKey === key) {
        setSortDir((current) => (current === "asc" ? "desc" : "asc"));
        return;
      }

      setSortKey(key);
      setSortDir("asc");
    },
    [sortKey]
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
