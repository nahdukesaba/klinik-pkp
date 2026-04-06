/**
 * SidebarPagination — Komponen pagination untuk sidebar daftar lokasi.
 *
 * Menampilkan informasi total item dan navigasi halaman
 * dengan tombol prev/next. Otomatis hidden jika totalPages <= 1.
 *
 * @example
 * ```tsx
 * <SidebarPagination
 *   currentPage={1}
 *   totalPages={5}
 *   totalItems={100}
 *   onPageChange={setPage}
 * />
 * ```
 */

import { ChevronLeft, ChevronRight } from "lucide-react";

interface SidebarPaginationProps {
  /** Halaman aktif saat ini (1-based) */
  currentPage: number;
  /** Total halaman yang tersedia */
  totalPages: number;
  /** Total item untuk ditampilkan di label */
  totalItems: number;
  /** Callback saat halaman berubah */
  onPageChange: (page: number) => void;
  /** Label satuan item (default: "lokasi") */
  itemLabel?: string;
}

export function SidebarPagination({
  currentPage,
  totalPages,
  totalItems,
  onPageChange,
  itemLabel = "lokasi",
}: SidebarPaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex flex-col gap-2 border-t border-border bg-card px-3 py-3 sm:flex-row sm:items-center sm:justify-between">
      <span className="text-xs leading-5 text-muted-foreground">
        {totalItems} {itemLabel}
      </span>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className="rounded p-1.5 hover:bg-secondary disabled:opacity-30 disabled:cursor-default transition-colors"
          aria-label="Halaman sebelumnya"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <span className="px-2 text-xs text-muted-foreground">
          {currentPage}/{totalPages}
        </span>
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="rounded p-1.5 hover:bg-secondary disabled:opacity-30 disabled:cursor-default transition-colors"
          aria-label="Halaman berikutnya"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
