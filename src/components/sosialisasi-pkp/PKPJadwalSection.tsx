/**
 * PKPJadwalSection — Section jadwal kegiatan sosialisasi PKP.
 *
 * Menampilkan daftar jadwal kegiatan sosialisasi dengan:
 * - Filter kabupaten (searchable)
 * - Filter tanggal (tahun, bulan, date range) via DateRangeFilterGroup
 * - Pencarian teks
 * - Klik kartu untuk fly-to lokasi di peta
 *
 * Refactored: menggunakan DateRangeFilterGroup shared component
 * untuk menghilangkan duplikasi mobile/desktop filter layout.
 *
 * @see DateRangeFilterGroup — filter tanggal responsif (shared)
 */

"use client";

import {
  ArrowRight,
  Calendar,
  MapPin,
  Search,
} from "lucide-react";

import { DateRangeFilterGroup } from "@/components/shared/DateRangeFilterGroup";
import { Input } from "@/components/ui/input";
import { SearchableSelect, stringsToOptions } from "@/components/ui/searchable-select";
import { type SosialisasiLocation } from "@/services/sosialisasi.service";

// --- Types ---

const JADWAL_VISIBLE_LIMIT = 25;

interface PKPJadwalSectionProps {
  jadwalYear: string;
  setJadwalYear: (value: string) => void;
  jadwalMonth: string;
  setJadwalMonth: (value: string) => void;
  jadwalStartDate: string;
  setJadwalStartDate: (value: string) => void;
  jadwalEndDate: string;
  setJadwalEndDate: (value: string) => void;
  jadwalSearch: string;
  setJadwalSearch: (value: string) => void;
  jadwalKabupatenFilter: string;
  setJadwalKabupatenFilter: (value: string) => void;
  jadwalYears: number[];
  filteredJadwal: SosialisasiLocation[];
  totalResults: number;
  kabupatenList: string[];
  resetFilters: () => void;
  hasActiveFilters: boolean;
  onCardClick?: (coordinates: [number, number]) => void;
  compact?: boolean;
  isLoading?: boolean;
}

// --- JadwalCard — Kartu jadwal individual ---

function JadwalCard({
  jadwal,
  index,
  onCardClick,
}: {
  jadwal: SosialisasiLocation;
  index: number;
  onCardClick?: (coordinates: [number, number]) => void;
}) {
  const eventDate = new Date(jadwal.date);

  return (
    <div
      onClick={() => onCardClick?.(jadwal.coordinates)}
      className="relative cursor-pointer overflow-hidden rounded-xl border border-border bg-card/95 p-4 shadow-lg transition-all hover:border-primary/50 hover:shadow-xl group"
      style={{ transitionDelay: `${Math.min(index, 5) * 0.05}s` }}
    >
      <div className="flex gap-3">
        {/* Date Badge */}
        <div className="flex-shrink-0 w-12 sm:w-14 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg flex flex-col items-center justify-center text-white py-2 shadow-md">
          <span className="text-lg sm:text-xl font-bold leading-none">
            {eventDate.getDate()}
          </span>
          <span className="text-[10px] uppercase leading-tight mt-0.5">
            {eventDate.toLocaleDateString("id-ID", { month: "short" })}
          </span>
          <span className="text-[10px] font-medium opacity-90">
            {eventDate.getFullYear()}
          </span>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Tags */}
          <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
            <span className="rounded-full bg-yellow-100 px-2 py-0.5 text-[10px] font-semibold text-yellow-800">
              Kegiatan
            </span>
            <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-semibold text-blue-800">
              {jadwal.kabupaten}
            </span>
          </div>

          {/* Title */}
          <h3 className="mb-1.5 line-clamp-2 text-sm font-semibold text-foreground sm:text-base">
            {jadwal.name}
          </h3>

          {/* Location */}
          <div className="flex flex-col gap-1.5 text-xs text-muted-foreground">
            <div className="flex items-start gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-primary flex-shrink-0 mt-0.5" />
              <span className="line-clamp-2">{jadwal.alamat}</span>
            </div>
          </div>

          {/* CTA */}
          <div className="mt-2.5">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-primary/10 text-primary text-xs font-medium rounded-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
              <MapPin className="w-3 h-3" />
              <span>Lihat di Peta</span>
              <ArrowRight className="w-3 h-3" />
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Main Section ---

export function PKPJadwalSection({
  jadwalYear,
  setJadwalYear,
  jadwalMonth,
  setJadwalMonth,
  jadwalStartDate,
  setJadwalStartDate,
  jadwalEndDate,
  setJadwalEndDate,
  jadwalSearch,
  setJadwalSearch,
  jadwalKabupatenFilter,
  setJadwalKabupatenFilter,
  jadwalYears,
  filteredJadwal,
  totalResults,
  kabupatenList,
  resetFilters,
  hasActiveFilters,
  onCardClick,
  compact = false,
  isLoading = false,
}: PKPJadwalSectionProps) {
  /** Opsi kabupaten untuk SearchableSelect */
  const kabupatenOptions = stringsToOptions(kabupatenList);
  const visibleJadwal = filteredJadwal.slice(0, JADWAL_VISIBLE_LIMIT);

  /** Slot filter kabupaten untuk mobile layout */
  const kabupatenFilterMobile = (
    <>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <SearchableSelect
          value={jadwalKabupatenFilter}
          onValueChange={setJadwalKabupatenFilter}
          options={kabupatenOptions}
          placeholder="Kabupaten/Kota"
          searchPlaceholder="Cari kabupaten..."
          allOptionLabel="Semua Lokasi"
          className="bg-secondary text-xs"
        />
      </div>
    </>
  );

  /** Slot filter kabupaten untuk desktop layout */
  const kabupatenFilterDesktop = (
    <div className="w-[180px]">
      <SearchableSelect
        value={jadwalKabupatenFilter}
        onValueChange={setJadwalKabupatenFilter}
        options={kabupatenOptions}
        placeholder="Kabupaten/Kota"
        searchPlaceholder="Cari kabupaten..."
        allOptionLabel="Semua Lokasi"
        className="bg-secondary h-10"
      />
    </div>
  );

  return (
    <section
      className={`${compact ? "mb-0" : "mb-16"} bg-gradient-to-br from-primary/10 to-accent/10 dark:from-primary/5 dark:to-accent/5 rounded-xl sm:rounded-2xl ${compact ? "p-3 sm:p-4" : "p-4 sm:p-6 md:p-8"} border border-primary/20 animate-on-scroll h-full relative overflow-hidden`}
    >
      {/* Decorative blobs */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 dark:bg-primary/10 rounded-full blur-3xl -z-0" />
      <div className="absolute bottom-0 left-0 w-40 h-40 bg-accent/20 dark:bg-accent/10 rounded-full blur-3xl -z-0" />

      <div className="relative z-10">
        {/* Header + Search */}
        <div className="flex flex-col gap-3 mb-4 sm:mb-6">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <h2
              className={`${compact ? "text-base sm:text-lg" : "text-lg sm:text-xl md:text-2xl"} font-bold text-foreground flex items-center gap-2`}
            >
              <Calendar
                className={`${compact ? "w-4 h-4 sm:w-5 sm:h-5" : "w-5 h-5 sm:w-6 sm:h-6"} text-primary flex-shrink-0`}
              />
              <span>Jadwal Kegiatan</span>
              <span className="text-xs sm:text-sm font-normal text-muted-foreground">
                ({totalResults})
              </span>
            </h2>

            <div className={`relative w-full ${compact ? "md:w-60" : "md:w-80"}`}>
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder={compact ? "Cari kegiatan..." : "Cari nama kegiatan, lokasi..."}
                value={jadwalSearch}
                onChange={(e) => setJadwalSearch(e.target.value)}
                className="pl-10 bg-card text-sm h-9"
              />
            </div>
          </div>

          {/* Filters — menggunakan shared DateRangeFilterGroup */}
          <DateRangeFilterGroup
            year={jadwalYear}
            setYear={setJadwalYear}
            month={jadwalMonth}
            setMonth={setJadwalMonth}
            startDate={jadwalStartDate}
            setStartDate={setJadwalStartDate}
            endDate={jadwalEndDate}
            setEndDate={setJadwalEndDate}
            years={jadwalYears}
            yearPlaceholder="Pilih Tahun"
            monthPlaceholder="Pilih Bulan"
            hasActiveFilters={hasActiveFilters}
            onReset={resetFilters}
            compact={compact}
            extraFiltersMobile={kabupatenFilterMobile}
            extraFiltersDesktop={kabupatenFilterDesktop}
          />
        </div>

        {/* Jadwal List */}
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="h-28 animate-pulse rounded-xl border border-border bg-card/80"
              />
            ))}
          </div>
        ) : filteredJadwal.length > 0 ? (
          <div className="space-y-3 max-h-[500px] lg:max-h-[600px] xl:max-h-[700px] 2xl:max-h-[800px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent hover:scrollbar-thumb-primary/40">
            {visibleJadwal.map((jadwal, index) => (
              <JadwalCard
                key={jadwal.id}
                jadwal={jadwal}
                index={index}
                onCardClick={onCardClick}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-card rounded-2xl border border-border">
            <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              Tidak ada jadwal kegiatan yang sesuai dengan filter.
            </p>
            <button
              onClick={resetFilters}
              className="mt-4 px-4 py-2 text-sm text-primary hover:bg-primary/10 rounded-lg transition-colors border border-primary/30"
            >
              Reset Semua Filter
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
