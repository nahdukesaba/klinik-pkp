"use client";

import {
  ArrowRight,
  Calendar,
  Clock,
  MapPin,
  Search,
} from "lucide-react";

import { Input } from "@/components/ui/input";
import { SearchableSelect, stringsToOptions } from "@/components/ui/searchable-select";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { type SosialisasiEvent } from "@/data/sosialisasi-klinik";
import { MONTHS_LIST } from "@/lib/constants";

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
  filteredJadwal: SosialisasiEvent[];
  totalResults: number;
  kabupatenList: string[];
  resetFilters: () => void;
  hasActiveFilters: boolean;
  onCardClick?: (coordinates: [number, number]) => void;
  compact?: boolean;
}

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
}: PKPJadwalSectionProps) {
  // Convert kabupaten list to searchable options
  const kabupatenOptions = stringsToOptions(kabupatenList);

  return (
    <section className={`${compact ? 'mb-0' : 'mb-16'} bg-gradient-to-br from-primary/10 to-accent/10 dark:from-primary/5 dark:to-accent/5 rounded-xl sm:rounded-2xl ${compact ? 'p-3 sm:p-4' : 'p-4 sm:p-6 md:p-8'} border border-primary/20 animate-on-scroll h-full relative overflow-hidden`}>
      {/* Decorative Elements */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 dark:bg-primary/10 rounded-full blur-3xl -z-0" />
      <div className="absolute bottom-0 left-0 w-40 h-40 bg-accent/20 dark:bg-accent/10 rounded-full blur-3xl -z-0" />
      
      <div className="relative z-10">
        <div className="flex flex-col gap-3 mb-4 sm:mb-6">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <h2 className={`${compact ? 'text-base sm:text-lg' : 'text-lg sm:text-xl md:text-2xl'} font-bold text-foreground flex items-center gap-2`}>
              <Calendar className={`${compact ? 'w-4 h-4 sm:w-5 sm:h-5' : 'w-5 h-5 sm:w-6 sm:h-6'} text-primary flex-shrink-0`} />
              <span>Jadwal Kegiatan</span>
              <span className="text-xs sm:text-sm font-normal text-muted-foreground">
                ({totalResults})
              </span>
            </h2>

          {/* Search Input */}
          <div className={`relative w-full ${compact ? 'md:w-60' : 'md:w-80'}`}>
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder={compact ? "Cari kegiatan..." : "Cari nama kegiatan, lokasi..."}
              value={jadwalSearch}
              onChange={(e) => setJadwalSearch(e.target.value)}
              className="pl-10 bg-card text-sm h-9"
            />
          </div>
        </div>

        {/* Filters Row */}
        <div className="flex flex-col gap-2 p-2 sm:p-4 bg-card rounded-xl border border-border">
          {/* Mobile: stacked layout */}
          <div className="md:hidden flex flex-col gap-2">
            {/* Main filters */}
            <div className="grid grid-cols-2 gap-2">
              {/* Kabupaten Filter with Search */}
              <SearchableSelect
                value={jadwalKabupatenFilter}
                onValueChange={setJadwalKabupatenFilter}
                options={kabupatenOptions}
                placeholder="Kabupaten/Kota"
                searchPlaceholder="Cari kabupaten..."
                allOptionLabel="Semua Lokasi"
                className="bg-secondary text-xs"
              />

              {/* Year Filter */}
              <Select value={jadwalYear} onValueChange={(v) => { setJadwalYear(v); setJadwalStartDate(""); setJadwalEndDate(""); }}>
                <SelectTrigger className="w-full bg-secondary h-9 text-xs">
                  <SelectValue placeholder="Tahun" />
                </SelectTrigger>
                <SelectContent className="bg-popover z-[9999]">
                  <SelectItem value="all">Semua Tahun</SelectItem>
                  {jadwalYears.map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {/* Month Filter - Full Width */}
            <div className="w-full">
              <Select value={jadwalMonth} onValueChange={(v) => { setJadwalMonth(v); setJadwalStartDate(""); setJadwalEndDate(""); }}>
                <SelectTrigger className="w-full bg-secondary h-9 text-xs">
                  <SelectValue placeholder="Bulan" />
                </SelectTrigger>
                <SelectContent className="bg-popover z-[9999]">
                  <SelectItem value="all">Semua Bulan</SelectItem>
                  {MONTHS_LIST.map((month) => (
                    <SelectItem key={month.value} value={month.value}>
                      {month.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Date range - Mobile */}
            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-medium text-foreground">Rentang Tanggal:</span>
              <div className="flex items-center gap-1.5">
                <input
                  type="date"
                  value={jadwalStartDate}
                  onChange={(e) => setJadwalStartDate(e.target.value)}
                  className="flex-1 px-2 py-1.5 bg-secondary border border-border rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
                <span className="text-xs text-muted-foreground">-</span>
                <input
                  type="date"
                  value={jadwalEndDate}
                  onChange={(e) => setJadwalEndDate(e.target.value)}
                  className="flex-1 px-2 py-1.5 bg-secondary border border-border rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
            </div>

            {/* Reset Button - Mobile */}
            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="px-3 py-1.5 text-xs text-primary hover:bg-primary/10 rounded-lg transition-colors border border-primary/30"
              >
                Reset Filter
              </button>
            )}
          </div>

          {/* Desktop: single row layout */}
          <div className="hidden md:flex md:flex-wrap md:items-center gap-3">
            {/* Kabupaten Filter with Search */}
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

            {/* Year Filter */}
            <Select value={jadwalYear} onValueChange={(v) => { setJadwalYear(v); setJadwalStartDate(""); setJadwalEndDate(""); }}>
              <SelectTrigger className="w-[120px] bg-secondary h-10 text-sm">
                <SelectValue placeholder="Tahun" />
              </SelectTrigger>
              <SelectContent className="bg-popover z-[9999]">
                <SelectItem value="all">Semua Tahun</SelectItem>
                {jadwalYears.map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Month Filter */}
            <Select value={jadwalMonth} onValueChange={(v) => { setJadwalMonth(v); setJadwalStartDate(""); setJadwalEndDate(""); }}>
              <SelectTrigger className="w-[140px] bg-secondary h-10 text-sm">
                <SelectValue placeholder="Bulan" />
              </SelectTrigger>
              <SelectContent className="bg-popover z-[9999]">
                <SelectItem value="all">Semua Bulan</SelectItem>
                {MONTHS_LIST.map((month) => (
                  <SelectItem key={month.value} value={month.value}>
                    {month.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Divider */}
            <div className="h-6 w-px bg-border" />

            {/* Date Range */}
            <span className="text-sm font-medium text-foreground">Rentang:</span>
            <input
              type="date"
              value={jadwalStartDate}
              onChange={(e) => setJadwalStartDate(e.target.value)}
              className="w-[140px] px-3 py-2 bg-secondary border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
            <span className="text-muted-foreground">-</span>
            <input
              type="date"
              value={jadwalEndDate}
              onChange={(e) => setJadwalEndDate(e.target.value)}
              className="w-[140px] px-3 py-2 bg-secondary border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            />

            {/* Reset Button */}
            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="px-4 py-2 text-sm text-primary hover:bg-primary/10 rounded-lg transition-colors border border-primary/30"
              >
                Reset Filter
              </button>
            )}
          </div>
        </div>
      </div>

      {filteredJadwal.length > 0 ? (
        <div className="space-y-3 max-h-[650px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent hover:scrollbar-thumb-primary/40">
          {filteredJadwal.map((jadwal, index) => {
            const eventDate = new Date(jadwal.date);

            const handleCardClick = () => {
              if (onCardClick) {
                onCardClick(jadwal.coordinates);
              }
            };

            return (
              <div
                key={jadwal.id}
                onClick={handleCardClick}
                className="bg-card dark:bg-white rounded-xl border border-border p-4 shadow-lg hover:shadow-xl hover:border-primary/50 transition-all cursor-pointer group overflow-hidden relative"
                style={{ transitionDelay: `${Math.min(index, 5) * 0.05}s` }}
              >
                {/* Horizontal Layout */}
                <div className="flex gap-3">
                  {/* Date Badge - Left Side (diperkecil) */}
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

                  {/* Content - Right Side */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
                      <span className="px-2 py-0.5 text-[10px] font-semibold rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-200">
                        Sosialisasi
                      </span>
                      <span className="px-2 py-0.5 text-[10px] font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-200">
                        {jadwal.kabupaten}
                      </span>
                    </div>

                    <h3 className="font-semibold text-foreground dark:text-gray-900 text-sm sm:text-base mb-1.5 line-clamp-2">
                      {jadwal.name}
                    </h3>

                    <div className="flex flex-col gap-1.5 text-xs text-muted-foreground dark:text-gray-600">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                        <span>{jadwal.time} WIB</span>
                      </div>
                      <div className="flex items-start gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-primary flex-shrink-0 mt-0.5" />
                        <span className="line-clamp-2">{jadwal.alamat}</span>
                      </div>
                    </div>

                    {/* Button Lihat di Peta */}
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
          })}
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
