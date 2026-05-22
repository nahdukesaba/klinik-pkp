"use client";

import { useCallback } from "react";

import type { SortDirection } from "@/types/api";

import { AdminDataTableDesktop } from "./data-table/AdminDataTableDesktop";
import { AdminDataTableMobileCards } from "./data-table/AdminDataTableMobileCards";
import { AdminDataTablePagination } from "./data-table/AdminDataTablePagination";
import {
  RoleBadge,
  StatusBadge,
  deleteAction,
  editAction,
} from "./data-table/badges";

import type { AdminDataTableProps, Column } from "./data-table/types";

export type { Column, TableAction } from "./data-table/types";
export { StatusBadge, RoleBadge, editAction, deleteAction };

export function AdminDataTable<T extends object>({
  columns,
  data,
  actions,
  keyField = "id",
  emptyMessage = "Tidak ada data ditemukan",
  isLoading = false,
  pagination,
  sortKey,
  sortDirection,
  onSort,
}: AdminDataTableProps<T>) {
  const activeSortKey = sortKey ?? pagination?.sortKey ?? null;
  const activeSortDirection = sortDirection ?? pagination?.sortDirection ?? "asc";
  const totalPages = Math.max(1, pagination?.totalPages ?? 1);
  const activePage = pagination
    ? Math.min(Math.max(1, pagination.currentPage), totalPages)
    : 1;
  const totalItems = pagination?.totalItems ?? data.length;
  const pageSize = pagination?.pageSize ?? data.length;
  const pageStart = totalItems === 0 ? 0 : (activePage - 1) * pageSize + 1;
  const pageEnd =
    totalItems === 0 ? 0 : pageStart + Math.max(0, data.length - 1);

  const handleSort = useCallback(
    (key: string) => {
      const nextSortDirection: SortDirection =
        activeSortKey === key && activeSortDirection === "asc" ? "desc" : "asc";

      const nextState = {
        sortKey: key,
        sortDirection: nextSortDirection,
      };

      onSort?.(nextState);
      pagination?.onSortChange?.(nextState);
    },
    [activeSortDirection, activeSortKey, onSort, pagination]
  );

  const handlePageChange = useCallback(
    (page: number) => {
      pagination?.onPageChange(page);
    },
    [pagination]
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
      <AdminDataTableMobileCards
        columns={columns}
        data={data}
        keyField={keyField}
        activePage={activePage}
        emptyMessage={emptyMessage}
        actions={actions}
        renderCellValue={renderCellValue}
      />

      <AdminDataTableDesktop
        columns={columns}
        data={data}
        actions={actions}
        keyField={keyField}
        activePage={activePage}
        emptyMessage={emptyMessage}
        sortKey={activeSortKey}
        sortDir={activeSortDirection}
        onSort={onSort || pagination?.onSortChange ? handleSort : undefined}
        renderCellValue={renderCellValue}
      />

      {pagination ? (
        <AdminDataTablePagination
          totalPages={totalPages}
          activePage={activePage}
          totalItems={totalItems}
          pageStart={pageStart}
          pageEnd={pageEnd}
          onPageChange={handlePageChange}
        />
      ) : null}
    </div>
  );
}
