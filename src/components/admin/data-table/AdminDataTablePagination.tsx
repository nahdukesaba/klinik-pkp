import { ChevronLeft, ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";

import { getVisiblePageNumbers } from "./helpers";

interface AdminDataTablePaginationProps {
  totalPages: number;
  activePage: number;
  totalItems: number;
  pageStart: number;
  pageEnd: number;
  hasSearchQuery: boolean;
  usesBackendPagination: boolean;
  currentPageItemCount: number;
  onPageChange: (page: number) => void;
}

export function AdminDataTablePagination({
  totalPages,
  activePage,
  totalItems,
  pageStart,
  pageEnd,
  hasSearchQuery,
  usesBackendPagination,
  currentPageItemCount,
  onPageChange,
}: AdminDataTablePaginationProps) {
  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className="flex flex-col gap-3 border-t border-border px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-xs leading-5 text-muted-foreground">
        {usesBackendPagination && hasSearchQuery
          ? `Menampilkan ${currentPageItemCount} hasil filter pada halaman ${activePage} dari ${totalItems} data`
          : `Menampilkan ${pageStart}-${pageEnd} dari ${totalItems} data`}
      </p>

      <div className="flex flex-wrap items-center gap-1">
        <button
          type="button"
          onClick={() => onPageChange(Math.max(1, activePage - 1))}
          disabled={activePage === 1}
          className="rounded-lg p-1.5 transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
          aria-label="Halaman sebelumnya"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        {getVisiblePageNumbers(totalPages, activePage).map((pageNum) => (
          <button
            key={pageNum}
            type="button"
            onClick={() => onPageChange(pageNum)}
            className={cn(
              "h-8 w-8 rounded-lg text-xs font-medium transition-colors",
              activePage === pageNum
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted"
            )}
            aria-current={activePage === pageNum ? "page" : undefined}
            aria-label={`Ke halaman ${pageNum}`}
          >
            {pageNum}
          </button>
        ))}

        <button
          type="button"
          onClick={() => onPageChange(Math.min(totalPages, activePage + 1))}
          disabled={activePage === totalPages}
          className="rounded-lg p-1.5 transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
          aria-label="Halaman berikutnya"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
