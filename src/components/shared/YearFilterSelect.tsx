/**
 * YearFilterSelect - Komponen reusable dropdown untuk filter tahun.
 *
 * Menampilkan daftar tahun sebagai Select dropdown.
 * Default dipilih oleh hook pemanggil. Text filter selalu terlihat penuh.
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
 *   selectedYear="2025"
 *   onYearChange={setYear}
 * />
 * ```
 */

"use client";

import { memo, useMemo } from "react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { getSortedUniqueYears } from "@/lib/date";

interface YearFilterSelectProps {
  /** Daftar tahun yang tersedia (descending) */
  years: number[];
  /** Tahun yang sedang dipilih */
  selectedYear: string;
  /** Callback saat tahun dipilih */
  onYearChange: (year: string) => void;
  /** Kelas tambahan untuk trigger */
  className?: string;
}

export const YearFilterSelect = memo(function YearFilterSelect({
  years,
  selectedYear,
  onYearChange,
  className = "",
}: YearFilterSelectProps) {
  const normalizedYears = useMemo(() => getSortedUniqueYears(years), [years]);

  return (
    <Select value={selectedYear} onValueChange={onYearChange}>
      <SelectTrigger
        className={`w-full sm:w-auto sm:min-w-[9rem] min-h-10 text-sm ${className}`}
      >
        <span className="break-words whitespace-normal text-left leading-tight">
          {selectedYear}
        </span>
      </SelectTrigger>
      <SelectContent className="bg-popover z-[9999]">
        {normalizedYears.map((y) => (
          <SelectItem key={y} value={String(y)}>
            {y}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
});
