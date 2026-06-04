"use client";

import { useCallback, useMemo } from "react";

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

const sortCollator = new Intl.Collator("id-ID", {
  numeric: true,
  sensitivity: "base",
});

function getSortValue<T extends object>(
  item: T,
  columns: Column<T>[],
  sortKey: string
) {
  const column = columns.find(
    (entry) => (entry.sortField ?? entry.key) === sortKey
  );
  const itemKey = column?.key ?? sortKey;
  return (item as Record<string, unknown>)[itemKey];
}

function compareSortValues(left: unknown, right: unknown) {
  const leftEmpty = left == null || left === "";
  const rightEmpty = right == null || right === "";

  if (leftEmpty && rightEmpty) return 0;
  if (leftEmpty) return 1;
  if (rightEmpty) return -1;

  if (typeof left === "number" && typeof right === "number") {
    return left - right;
  }

  if (left instanceof Date && right instanceof Date) {
    return left.getTime() - right.getTime();
  }

  return sortCollator.compare(String(left), String(right));
}

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
  const sortedData = useMemo(() => {
    if (!activeSortKey) {
      return data;
    }

    return [...data].sort((left, right) => {
      const result = compareSortValues(
        getSortValue(left, columns, activeSortKey),
        getSortValue(right, columns, activeSortKey)
      );

      return activeSortDirection === "asc" ? result : -result;
    });
  }, [activeSortDirection, activeSortKey, columns, data]);

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
        data={sortedData}
        keyField={keyField}
        activePage={activePage}
        emptyMessage={emptyMessage}
        actions={actions}
        renderCellValue={renderCellValue}
      />

      <AdminDataTableDesktop
        columns={columns}
        data={sortedData}
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
