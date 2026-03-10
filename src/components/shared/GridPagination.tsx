/**
 * GridPagination — Komponen pagination untuk grid/card layout.
 *
 * Menampilkan navigasi halaman dengan nomor halaman, ellipsis,
 * dan tombol prev/next. Cocok untuk grid berita, bank desain, dll.
 *
 * Otomatis hidden jika totalPages <= 1.
 *
 * @example
 * ```tsx
 * <GridPagination
 *   currentPage={pagination.currentPage}
 *   totalPages={pagination.totalPages}
 *   onPageChange={pagination.setCurrentPage}
 *   onPrev={pagination.goToPrevPage}
 *   onNext={pagination.goToNextPage}
 * />
 * ```
 */

import { ChevronLeft, ChevronRight } from "lucide-react";

interface GridPaginationProps {
  /** Halaman aktif saat ini (1-based) */
  currentPage: number;
  /** Total halaman yang tersedia */
  totalPages: number;
  /** Callback saat klik nomor halaman */
  onPageChange: (page: number) => void;
  /** Callback saat klik tombol prev */
  onPrev: () => void;
  /** Callback saat klik tombol next */
  onNext: () => void;
}

/**
 * Hitung nomor halaman yang ditampilkan (max 5 visible, dengan ellipsis).
 */
function getPageNumbers(currentPage: number, totalPages: number): (number | string)[] {
  const maxVisible = 5;

  if (totalPages <= maxVisible) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const pages: (number | string)[] = [1];

  const startPage = Math.max(2, currentPage - 1);
  const endPage = Math.min(totalPages - 1, currentPage + 1);

  if (startPage > 2) pages.push("...");

  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  if (endPage < totalPages - 1) pages.push("...");

  pages.push(totalPages);

  return pages;
}

export function GridPagination({
  currentPage,
  totalPages,
  onPageChange,
  onPrev,
  onNext,
}: GridPaginationProps) {
  if (totalPages <= 1) return null;

  const pageNumbers = getPageNumbers(currentPage, totalPages);

  return (
    <div className="flex items-center justify-center gap-2 mt-8">
      <button
        onClick={onPrev}
        disabled={currentPage === 1}
        className="p-2 rounded-lg bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label="Halaman sebelumnya"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      <div className="flex items-center gap-1">
        {pageNumbers.map((page, idx) =>
          typeof page === "number" ? (
            <button
              key={idx}
              onClick={() => onPageChange(page)}
              className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
                page === currentPage
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              }`}
            >
              {page}
            </button>
          ) : (
            <span key={idx} className="px-2 text-muted-foreground">
              ...
            </span>
          )
        )}
      </div>

      <button
        onClick={onNext}
        disabled={currentPage === totalPages}
        className="p-2 rounded-lg bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label="Halaman berikutnya"
      >
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  );
}
