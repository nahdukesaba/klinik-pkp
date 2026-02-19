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
    <div className="flex items-center justify-between px-3 py-2 border-t border-border flex-shrink-0 bg-card">
      <span className="text-xs text-muted-foreground">
        {totalItems} {itemLabel}
      </span>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className="p-1 rounded hover:bg-secondary disabled:opacity-30 disabled:cursor-default transition-colors"
          aria-label="Halaman sebelumnya"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <span className="text-xs text-muted-foreground px-2">
          {currentPage}/{totalPages}
        </span>
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="p-1 rounded hover:bg-secondary disabled:opacity-30 disabled:cursor-default transition-colors"
          aria-label="Halaman berikutnya"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
