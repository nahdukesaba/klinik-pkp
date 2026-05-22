import type { ReactNode } from "react";

import type { SortDirection } from "@/types/api";

export interface Column<T> {
  key: string;
  label: string;
  sortable?: boolean;
  sortField?: string;
  render?: (item: T) => ReactNode;
  className?: string;
}

export interface TableAction<T> {
  label: string;
  icon?: ReactNode;
  onClick: (item: T) => void;
  variant?: "default" | "destructive";
  isVisible?: (item: T) => boolean;
  isDisabled?: (item: T) => boolean;
  disabledReason?: string;
}

export interface DataTablePagination {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  sortKey?: string | null;
  sortDirection?: SortDirection;
  onSortChange?: (state: {
    sortKey: string;
    sortDirection: SortDirection;
  }) => void;
}

export interface AdminDataTableProps<T extends object> {
  columns: Column<T>[];
  data: T[];
  actions?: TableAction<T>[];
  keyField?: string;
  emptyMessage?: string;
  isLoading?: boolean;
  pagination?: DataTablePagination;
  sortKey?: string | null;
  sortDirection?: SortDirection;
  onSort?: (state: { sortKey: string; sortDirection: SortDirection }) => void;
}
