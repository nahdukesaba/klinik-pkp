/**
 * AdminDataTable — Tabel data interaktif untuk admin dashboard.
 *
 * Fitur: sortable headers, search, status badges, actions, empty state.
 * Reusable untuk berbagai modul admin.
 */

"use client";

import { useCallback, useMemo, useState } from "react";

import { usePathname } from "next/navigation";

import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronsUpDown,
  Edit,
  Inbox,
  MoreHorizontal,
  Search,
  Trash2,
} from "lucide-react";

import { useDebounce } from "@/hooks/use-debounce";
import { cn } from "@/lib/utils";

// --- Types ---

export interface Column<T> {
  key: string;
  label: string;
  sortable?: boolean;
  render?: (item: T) => React.ReactNode;
  className?: string;
}

export interface TableAction<T> {
  label: string;
  icon?: React.ReactNode;
  onClick: (item: T) => void;
  variant?: "default" | "destructive";
}

interface AdminDataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  actions?: TableAction<T>[];
  /** Unique key field untuk setiap row */
  keyField?: string;
  /** Search placeholder */
  searchPlaceholder?: string;
  /** Searchable fields — keys dari T untuk filter */
  searchFields?: string[];
  /** Items per page */
  perPage?: number;
  /** Show search bar */
  showSearch?: boolean;
  /** Empty state message */
  emptyMessage?: string;
  /** Loading state */
  isLoading?: boolean;
  /** Header actions (tambah baru, dll) */
  headerActions?: React.ReactNode;
  /** Backend-controlled pagination */
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    pageSize: number;
    onPageChange: (page: number) => void;
  };
}

// --- Status Badge ---

const statusVariants: Record<string, string> = {
  active: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  inactive: "bg-gray-500/15 text-gray-600 dark:text-gray-400",
  suspended: "bg-rose-500/15 text-rose-600 dark:text-rose-400",
  published: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  draft: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  archived: "bg-gray-500/15 text-gray-600 dark:text-gray-400",
  selesai: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  proses: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  rencana: "bg-blue-500/15 text-blue-600 dark:text-blue-400",
  mendatang: "bg-blue-500/15 text-blue-600 dark:text-blue-400",
};

const statusLabels: Record<string, string> = {
  active: "Aktif",
  inactive: "Nonaktif",
  suspended: "Ditangguhkan",
  published: "Dipublikasi",
  draft: "Draf",
  archived: "Diarsipkan",
  selesai: "Selesai",
  proses: "Dalam Proses",
  rencana: "Rencana",
  mendatang: "Mendatang",
};

export function StatusBadge({ status }: { status: string }) {
  const variant = statusVariants[status] || "bg-muted text-muted-foreground";
  const label = statusLabels[status] || status;

  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold",
        variant
      )}
    >
      <span
        className={cn(
          "w-1.5 h-1.5 rounded-full mr-1.5",
          status === "active" || status === "published" || status === "selesai"
            ? "bg-emerald-500"
            : status === "inactive" || status === "archived"
            ? "bg-gray-400"
            : status === "suspended"
            ? "bg-rose-500"
            : status === "draft" || status === "proses"
            ? "bg-amber-500"
            : "bg-blue-500"
        )}
      />
      {label}
    </span>
  );
}

// --- Role Badge ---

const roleVariants: Record<string, string> = {
  admin: "bg-violet-500/15 text-violet-600 dark:text-violet-400",
  user: "bg-sky-500/15 text-sky-600 dark:text-sky-400",
};

export function RoleBadge({ role }: { role: string }) {
  const variant = roleVariants[role] || "bg-muted text-muted-foreground";

  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium capitalize",
        variant
      )}
    >
      {role}
    </span>
  );
}

// --- Table Component ---

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function AdminDataTable<T extends Record<string, any>>({
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
  const pathname = usePathname();
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [openActionMenu, setOpenActionMenu] = useState<{
    pathname: string;
    rowKey: string | null;
  }>({
    pathname,
    rowKey: null,
  });

  const debouncedSearch = useDebounce(search, 300);
  const openActionRow =
    openActionMenu.pathname === pathname ? openActionMenu.rowKey : null;
  const usesBackendPagination = Boolean(pagination);

  // Filter data
  const filteredData = useMemo(() => {
    if (!debouncedSearch || searchFields.length === 0) return data;
    const q = debouncedSearch.toLowerCase();
    return data.filter((item) =>
      searchFields.some((field) => {
        const val = item[field];
        if (typeof val === "string") return val.toLowerCase().includes(q);
        if (typeof val === "number") return val.toString().includes(q);
        return false;
      })
    );
  }, [data, debouncedSearch, searchFields]);

  // Sort data
  const sortedData = useMemo(() => {
    if (!sortKey) return filteredData;
    return [...filteredData].sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];
      if (aVal == null && bVal == null) return 0;
      if (aVal == null) return 1;
      if (bVal == null) return -1;
      if (typeof aVal === "string" && typeof bVal === "string") {
        return sortDir === "asc"
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }
      if (typeof aVal === "number" && typeof bVal === "number") {
        return sortDir === "asc" ? aVal - bVal : bVal - aVal;
      }
      return 0;
    });
  }, [filteredData, sortKey, sortDir]);

  // Paginate
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

    const start = (activePage - 1) * perPage;
    return sortedData.slice(start, start + perPage);
  }, [sortedData, activePage, perPage, usesBackendPagination]);

  const handleSort = useCallback(
    (key: string) => {
      if (sortKey === key) {
        setSortDir((d) => (d === "asc" ? "desc" : "asc"));
      } else {
        setSortKey(key);
        setSortDir("asc");
      }
    },
    [sortKey]
  );

  const closeActionMenu = useCallback(() => {
    setOpenActionMenu({
      pathname,
      rowKey: null,
    });
  }, [pathname]);

  const toggleActionMenu = useCallback(
    (rowKey: string) => {
      setOpenActionMenu((current) => ({
        pathname,
        rowKey:
          current.pathname === pathname && current.rowKey === rowKey
            ? null
            : rowKey,
      }));
    },
    [pathname]
  );

  const handleSearchChange = useCallback(
    (value: string) => {
      setSearch(value);
      if (!usesBackendPagination) {
        setCurrentPage(1);
      }

      if (openActionRow) {
        closeActionMenu();
      }
    },
    [closeActionMenu, openActionRow, usesBackendPagination]
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

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="p-4 space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-12 bg-muted/50 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  const hasActions = Boolean(actions && actions.length > 0);

  const renderCellValue = (item: T, col: Column<T>) => {
    return col.render ? col.render(item) : String(item[col.key] ?? "-");
  };

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      {/* Header bar */}
      {(showSearch || headerActions) && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 border-b border-border">
          {showSearch && (
            <div className="relative max-w-sm w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder={searchPlaceholder}
                value={search}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-border bg-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
              />
            </div>
          )}
          {headerActions && (
            <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto sm:justify-end">
              {headerActions}
            </div>
          )}
        </div>
      )}

      <div className="space-y-3 p-3 md:hidden">
        {paginatedData.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border px-4 py-10 text-center text-muted-foreground">
            <Inbox className="h-10 w-10 opacity-30" />
            <p className="text-sm">{emptyMessage}</p>
          </div>
        ) : (
          paginatedData.map((item, index) => {
            const rowKey = String(item[keyField] ?? `${activePage}-${index}`);

            return (
              <article
                key={rowKey}
                className="space-y-3 rounded-2xl border border-border bg-background/70 p-4 shadow-sm"
              >
                {columns.map((col) => (
                  <div key={col.key} className="space-y-1">
                    <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
                      {col.label}
                    </p>
                    <div className="min-w-0 break-words text-sm text-foreground">
                      {renderCellValue(item, col)}
                    </div>
                  </div>
                ))}

                {hasActions && (
                  <div className="flex flex-wrap gap-2 border-t border-border pt-3">
                    {actions?.map((action, actionIndex) => (
                      <button
                        key={`${rowKey}-${action.label}-${actionIndex}`}
                        type="button"
                        onClick={() => action.onClick(item)}
                        className={cn(
                          "inline-flex min-h-10 items-center gap-2 rounded-xl border px-3 py-2 text-sm transition-colors",
                          action.variant === "destructive"
                            ? "border-destructive/30 text-destructive hover:bg-destructive/10"
                            : "border-border bg-card text-foreground hover:bg-muted"
                        )}
                      >
                        {action.icon}
                        <span>{action.label}</span>
                      </button>
                    ))}
                  </div>
                )}
              </article>
            );
          })
        )}
      </div>

      {/* Table */}
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={cn(
                    "px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider",
                    col.sortable && "cursor-pointer select-none hover:text-foreground transition-colors",
                    col.className
                  )}
                  onClick={() => col.sortable && handleSort(col.key)}
                >
                  <div className="flex items-center gap-1.5">
                    {col.label}
                    {col.sortable && (
                      <span className="flex flex-col">
                        {sortKey === col.key ? (
                          sortDir === "asc" ? (
                            <ChevronUp className="w-3.5 h-3.5" />
                          ) : (
                            <ChevronDown className="w-3.5 h-3.5" />
                          )
                        ) : (
                          <ChevronsUpDown className="w-3.5 h-3.5 opacity-40" />
                        )}
                      </span>
                    )}
                  </div>
                </th>
              ))}
              {hasActions && (
                <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider w-[100px]">
                  Aksi
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {paginatedData.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + (actions ? 1 : 0)}
                  className="px-4 py-16 text-center"
                >
                  <div className="flex flex-col items-center gap-3 text-muted-foreground">
                    <Inbox className="w-12 h-12 opacity-30" />
                    <p className="text-sm">{emptyMessage}</p>
                  </div>
                </td>
              </tr>
            ) : (
              paginatedData.map((item, index) => {
                const rowKey = String(
                  item[keyField] ?? `${activePage}-${index}`
                );

                return (
                  <tr
                    key={rowKey}
                    className="hover:bg-muted/20 transition-colors"
                  >
                    {columns.map((col) => (
                      <td
                        key={col.key}
                        className={cn("px-4 py-3.5 text-foreground", col.className)}
                      >
                        {renderCellValue(item, col)}
                      </td>
                    ))}
                    {hasActions && (
                      <td className="px-4 py-3.5 text-right relative">
                        <button
                          type="button"
                          onClick={() => toggleActionMenu(rowKey)}
                          className="p-1.5 rounded-lg hover:bg-muted transition-colors"
                          aria-label="Open action menu"
                        >
                          <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
                        </button>

                        {/* Action dropdown */}
                        {openActionRow === rowKey && (
                          <>
                            <div
                              className="fixed inset-0 z-40"
                              onClick={closeActionMenu}
                            />
                            <div className="absolute right-4 top-full mt-1 z-50 min-w-[160px] rounded-lg border border-border bg-popover shadow-lg py-1 animate-scale-in">
                              {actions?.map((action, i) => (
                                <button
                                  key={i}
                                  onClick={() => {
                                    action.onClick(item);
                                    closeActionMenu();
                                  }}
                                  className={cn(
                                    "w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted transition-colors text-left",
                                    action.variant === "destructive"
                                      ? "text-destructive hover:bg-destructive/10"
                                      : "text-foreground"
                                  )}
                                >
                                  {action.icon}
                                  {action.label}
                                </button>
                              ))}
                            </div>
                          </>
                        )}
                      </td>
                    )}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-col gap-3 border-t border-border px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs leading-5 text-muted-foreground">
            {usesBackendPagination && hasSearchQuery
              ? `Menampilkan ${paginatedData.length} hasil filter pada halaman ${activePage} dari ${totalItems} data`
              : `Menampilkan ${pageStart}-${pageEnd} dari ${totalItems} data`}
          </p>
          <div className="flex flex-wrap items-center gap-1">
            <button
              onClick={() => handlePageChange(Math.max(1, activePage - 1))}
              disabled={activePage === 1}
              className="p-1.5 rounded-lg hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              let pageNum: number;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (activePage <= 3) {
                pageNum = i + 1;
              } else if (activePage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = activePage - 2 + i;
              }

              return (
                <button
                  key={pageNum}
                  onClick={() => handlePageChange(pageNum)}
                  className={cn(
                    "w-8 h-8 rounded-lg text-xs font-medium transition-colors",
                    activePage === pageNum
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-muted text-muted-foreground"
                  )}
                >
                  {pageNum}
                </button>
              );
            })}

            <button
              onClick={() => handlePageChange(Math.min(totalPages, activePage + 1))}
              disabled={activePage === totalPages}
              className="p-1.5 rounded-lg hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export function editAction<T>(onClick: (item: T) => void): TableAction<T> {
  return {
    label: "Edit",
    icon: <Edit className="w-4 h-4" />,
    onClick,
  };
}

export function deleteAction<T>(onClick: (item: T) => void): TableAction<T> {
  return {
    label: "Hapus",
    icon: <Trash2 className="w-4 h-4" />,
    onClick,
    variant: "destructive",
  };
}
