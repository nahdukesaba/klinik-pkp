import type { FormEvent } from "react";

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

  const handlePageJump = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const targetPage = Number(formData.get("page"));

    if (!Number.isFinite(targetPage)) {
      return;
    }

    onPageChange(Math.min(totalPages, Math.max(1, Math.trunc(targetPage))));
  };

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

        {totalPages > 7 ? (
          <form
            className="ml-2 flex items-center gap-2 pl-2 text-xs text-muted-foreground"
            onSubmit={handlePageJump}
          >
            <span className="whitespace-nowrap">
              Ke halaman
            </span>
            <input
              key={activePage}
              name="page"
              type="number"
              min={1}
              max={totalPages}
              defaultValue={activePage}
              aria-label="Nomor halaman tujuan"
              className="h-8 w-16 rounded-lg border border-border bg-background px-2 text-center text-xs text-foreground outline-none transition-colors focus:border-primary"
            />
            <button
              type="submit"
              className="h-8 rounded-lg border border-border px-3 text-xs font-medium text-foreground transition-colors hover:bg-muted"
            >
              Buka
            </button>
          </form>
        ) : null}
      </div>
    </div>
  );
}
