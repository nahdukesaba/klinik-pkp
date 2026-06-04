/**
 * DateRangeFilterGroup — Filter tanggal responsif (Year, Month, Date Range).
 *
 * Komponen ini menggabungkan filter Tahun, Bulan, dan Rentang Tanggal
 * dengan layout responsif (stacked di mobile, inline di desktop).
 * Digunakan di PKPBeritaSection dan PKPJadwalSection.
 *
 * Fitur:
 * - Otomatis reset date range saat memilih year/month dan sebaliknya
 * - Responsif: grid 2 kolom di mobile, flex row di desktop
 * - Slot untuk filter tambahan (e.g. kabupaten) via `extraFilters` prop
 *
 * @example
 * ```tsx
 * <DateRangeFilterGroup
 *   year={year}
 *   setYear={setYear}
 *   month={month}
 *   setMonth={setMonth}
 *   startDate={start}
 *   setStartDate={setStart}
 *   endDate={end}
 *   setEndDate={setEnd}
 *   years={[2023, 2024, 2025]}
 *   hasActiveFilters={true}
 *   onReset={resetAll}
 * />
 * ```
 */

"use client";

import { useMemo, type ReactNode } from "react";

import { Calendar } from "lucide-react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MONTHS_LIST } from "@/lib/constants";
import { getSortedUniqueYears } from "@/lib/date";

// --- Types ---

interface DateRangeFilterGroupProps {
  /** Tahun yang dipilih */
  year: string;
  /** Setter tahun */
  setYear: (v: string) => void;
  /** Bulan yang dipilih ("all" untuk semua) */
  month: string;
  /** Setter bulan */
  setMonth: (v: string) => void;
  /** Tanggal mulai (YYYY-MM-DD) */
  startDate: string;
  /** Setter tanggal mulai */
  setStartDate: (v: string) => void;
  /** Tanggal akhir (YYYY-MM-DD) */
  endDate: string;
  /** Setter tanggal akhir */
  setEndDate: (v: string) => void;
  /** List tahun yang tersedia */
  years: number[];
  /** Apakah ada filter aktif */
  hasActiveFilters: boolean;
  /** Callback reset semua filter */
  onReset: () => void;
  /** Filter tambahan untuk ditampilkan sebelum year/month (mobile: grid, desktop: inline) */
  extraFiltersMobile?: ReactNode;
  /** Filter tambahan desktop */
  extraFiltersDesktop?: ReactNode;
  /** Ukuran kompak (font/spacing lebih kecil) */
  compact?: boolean;
  /** Placeholder filter tahun */
  yearPlaceholder?: string;
  /** Placeholder filter bulan */
  monthPlaceholder?: string;
}

// --- Komponen Utama ---

export function DateRangeFilterGroup({
  year,
  setYear,
  month,
  setMonth,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  years,
  hasActiveFilters,
  onReset,
  extraFiltersMobile,
  extraFiltersDesktop,
  compact = false,
  yearPlaceholder = "Pilih Tahun",
  monthPlaceholder = "Pilih Bulan",
}: DateRangeFilterGroupProps) {
  const normalizedYears = useMemo(() => getSortedUniqueYears(years), [years]);
  /** Handler: pilih year → reset date range */
  const handleYearChange = (v: string) => {
    setYear(v);
    setStartDate("");
    setEndDate("");
  };

  /** Handler: pilih month → reset date range */
  const handleMonthChange = (v: string) => {
    setMonth(v);
    setStartDate("");
    setEndDate("");
  };

  /** Handler: pilih date → reset year/month */
  const handleStartDateChange = (v: string) => {
    setStartDate(v);
    if (v) setMonth("all");
  };

  /** Handler: pilih end date → reset year/month */
  const handleEndDateChange = (v: string) => {
    setEndDate(v);
    if (v) setMonth("all");
  };

  const sizeClass = compact ? "h-9 text-xs" : "h-9 text-sm";

  return (
    <div className="flex flex-col gap-2 p-2 sm:p-4 bg-card rounded-xl border border-border">
      {/* ===== Mobile Layout ===== */}
      <div className="md:hidden flex flex-col gap-2">
        {extraFiltersMobile}

        {/* Year + Month grid */}
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <Select value={year} onValueChange={handleYearChange} disabled={normalizedYears.length === 0}>
            <SelectTrigger className={`w-full bg-secondary ${sizeClass}`}>
              <SelectValue placeholder={yearPlaceholder} />
            </SelectTrigger>
            <SelectContent className="bg-popover z-[9999]">
              {normalizedYears.map((y) => (
                <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={month} onValueChange={handleMonthChange}>
            <SelectTrigger className={`w-full bg-secondary ${sizeClass}`}>
              <SelectValue placeholder={monthPlaceholder} />
            </SelectTrigger>
            <SelectContent className="bg-popover z-[9999]">
              <SelectItem value="all">Semua Bulan</SelectItem>
              {MONTHS_LIST.map((m) => (
                <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Date Range */}
        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-medium text-foreground">Rentang Tanggal:</span>
          <div className="flex items-center gap-1.5">
            <div className="relative flex-1 min-w-0">
              <Calendar className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none z-10" />
              <input
                type="date"
                value={startDate}
                onChange={(e) => handleStartDateChange(e.target.value)}
                className="w-full pl-7 pr-1 py-2 bg-secondary border border-border rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
            <span className="text-muted-foreground text-xs flex-shrink-0">-</span>
            <div className="relative flex-1 min-w-0">
              <Calendar className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none z-10" />
              <input
                type="date"
                value={endDate}
                onChange={(e) => handleEndDateChange(e.target.value)}
                className="w-full pl-7 pr-1 py-2 bg-secondary border border-border rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
          </div>
        </div>

        {/* Reset */}
        {hasActiveFilters && (
          <button
            onClick={onReset}
            className="px-3 py-1.5 text-xs text-primary hover:bg-primary/10 rounded-lg transition-colors border border-primary/30"
          >
            Reset Filter
          </button>
        )}
      </div>

      {/* ===== Desktop Layout ===== */}
      <div className="hidden md:flex md:flex-wrap md:items-center gap-3">
        <span className="text-sm font-medium text-foreground">Filter:</span>

        {extraFiltersDesktop}

        {/* Year */}
        <Select value={year} onValueChange={handleYearChange} disabled={normalizedYears.length === 0}>
          <SelectTrigger className="w-[120px] bg-secondary h-10 text-sm">
            <SelectValue placeholder={yearPlaceholder} />
          </SelectTrigger>
          <SelectContent className="bg-popover z-[9999]">
            {normalizedYears.map((y) => (
              <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Month */}
        <Select value={month} onValueChange={handleMonthChange}>
          <SelectTrigger className="w-[140px] bg-secondary h-10 text-sm">
            <SelectValue placeholder={monthPlaceholder} />
          </SelectTrigger>
          <SelectContent className="bg-popover z-[9999]">
            <SelectItem value="all">Semua Bulan</SelectItem>
            {MONTHS_LIST.map((m) => (
              <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Divider */}
        <div className="h-6 w-px bg-border" />

        {/* Date Range */}
        <span className="text-sm font-medium text-foreground">Rentang:</span>
        <input
          type="date"
          value={startDate}
          onChange={(e) => handleStartDateChange(e.target.value)}
          className="w-[140px] px-3 py-2 bg-secondary border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
        <span className="text-muted-foreground">-</span>
        <input
          type="date"
          value={endDate}
          onChange={(e) => handleEndDateChange(e.target.value)}
          className="w-[140px] px-3 py-2 bg-secondary border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
        />

        {/* Reset */}
        {hasActiveFilters && (
          <button
            onClick={onReset}
            className="px-4 py-2 text-sm text-primary hover:bg-primary/10 rounded-lg transition-colors border border-primary/30"
          >
            Reset Filter
          </button>
        )}
      </div>
    </div>
  );
}
