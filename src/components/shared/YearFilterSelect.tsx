/**
 * YearFilterSelect — Komponen reusable dropdown untuk filter tahun.
 *
 * Menampilkan daftar tahun sebagai Select dropdown.
 * Default: tahun sekarang. Text filter selalu terlihat penuh.
 *
 * Dipakai di:
 * - Kawasan Kumuh (header)
 * - Sosialisasi Map Section
 * - Penerimaan BSPS (header)
 *
 * @example
 * ```tsx
 * <YearFilterSelect
 *   years={[2026, 2025, 2024]}
 *   selectedYear="2026"
 *   onYearChange={setYear}
 * />
 * ```
 */

"use client";

import { memo } from "react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";

interface YearFilterSelectProps {
  /** Daftar tahun yang tersedia (descending) */
  years: number[];
  /** Tahun yang sedang dipilih ("all" atau string tahun) */
  selectedYear: string;
  /** Callback saat tahun dipilih */
  onYearChange: (year: string) => void;
  /** Tampilkan opsi "Semua Tahun" (default: true) */
  showAllOption?: boolean;
  /** Kelas tambahan untuk trigger */
  className?: string;
}

export const YearFilterSelect = memo(function YearFilterSelect({
  years,
  selectedYear,
  onYearChange,
  showAllOption = true,
  className = "",
}: YearFilterSelectProps) {
  return (
    <Select value={selectedYear} onValueChange={onYearChange}>
      <SelectTrigger className={`w-auto min-w-[9rem] h-10 text-sm ${className}`}>
        <span>
          Tahun: {selectedYear === "all" ? "Semua" : selectedYear}
        </span>
      </SelectTrigger>
      <SelectContent className="bg-popover z-[9999]">
        {showAllOption && (
          <SelectItem value="all">Semua Tahun</SelectItem>
        )}
        {years.map((y) => (
          <SelectItem key={y} value={String(y)}>
            {y}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
});
