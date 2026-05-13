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
  searchValue?: string;
  onSearchChange?: (keyword: string) => void;
  searchMode?: "backend" | "local";
  sortKey?: string | null;
  sortDirection?: SortDirection;
  onSortChange?: (state: {
    sortKey: string;
    sortDirection: SortDirection;
  }) => void;
  sortMode?: "backend" | "local";
}

export interface AdminDataTableProps<T extends object> {
  columns: Column<T>[];
  data: T[];
  actions?: TableAction<T>[];
  keyField?: string;
  searchPlaceholder?: string;
  searchFields?: string[];
  perPage?: number;
  showSearch?: boolean;
  emptyMessage?: string;
  isLoading?: boolean;
  isRefreshing?: boolean;
  headerActions?: ReactNode;
  pagination?: DataTablePagination;
}
