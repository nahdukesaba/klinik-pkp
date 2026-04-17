import type { ReactNode } from "react";

export interface Column<T> {
  key: string;
  label: string;
  sortable?: boolean;
  render?: (item: T) => ReactNode;
  className?: string;
}

export interface TableAction<T> {
  label: string;
  icon?: ReactNode;
  onClick: (item: T) => void;
  variant?: "default" | "destructive";
}

export interface DataTablePagination {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
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
  headerActions?: ReactNode;
  pagination?: DataTablePagination;
}
