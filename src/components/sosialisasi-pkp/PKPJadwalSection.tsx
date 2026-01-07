"use client";

import {
  ArrowRight,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  MapPin,
  Search,
} from "lucide-react";

import { Input } from "@/components/ui/input";
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
  jadwalPage: number;
  setJadwalPage: (value: number) => void;
  jadwalYears: number[];
  paginatedJadwal: SosialisasiEvent[];
  totalPages: number;
  totalResults: number;
  kabupatenList: string[];
  resetFilters: () => void;
  hasActiveFilters: boolean;
  onCardClick?: (coordinates: [number, number]) => void;
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
  jadwalPage,
  setJadwalPage,
  jadwalYears,
  paginatedJadwal,
  totalPages,
  totalResults,
  kabupatenList,
  resetFilters,
  hasActiveFilters,
  onCardClick,
}: PKPJadwalSectionProps) {
  return (
    <section className="mb-16 bg-gradient-to-br from-primary/10 to-accent/10 dark:from-primary/5 dark:to-accent/5 rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 border border-primary/20 animate-on-scroll">
      <div className="flex flex-col gap-4 mb-6 sm:mb-8">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground flex items-center gap-2">
            <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-primary flex-shrink-0" />
            <span>Jadwal Kegiatan Mendatang</span>
            <span className="text-xs sm:text-sm font-normal text-muted-foreground">
              ({totalResults} kegiatan)
            </span>
          </h2>

          {/* Search Input */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Cari nama kegiatan, lokasi..."
              value={jadwalSearch}
              onChange={(e) => setJadwalSearch(e.target.value)}
              className="pl-10 bg-card text-sm"
            />
          </div>
        </div>

        {/* Filters Row */}
        <div className="flex flex-col gap-3 p-3 sm:p-4 bg-card rounded-xl border border-border">
          {/* First row: Main filters */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:flex md:flex-wrap md:items-center gap-2 sm:gap-3">
            {/* Kabupaten Filter */}
            <Select value={jadwalKabupatenFilter} onValueChange={setJadwalKabupatenFilter}>
              <SelectTrigger className="w-full md:w-[160px] bg-secondary h-9 sm:h-10 text-sm">
                <SelectValue placeholder="Kabupaten/Kota" />
              </SelectTrigger>
              <SelectContent className="bg-popover z-[9999]">
                <SelectItem value="all">Semua Lokasi</SelectItem>
                {kabupatenList.filter(k => k !== "Semua Lokasi").map((kab) => (
                  <SelectItem key={kab} value={kab}>
                    {kab}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Year Filter */}
            <Select value={jadwalYear} onValueChange={(v) => { setJadwalYear(v); setJadwalStartDate(""); setJadwalEndDate(""); }}>
              <SelectTrigger className="w-full md:w-[120px] bg-secondary h-9 sm:h-10 text-sm">
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
              <SelectTrigger className="w-full md:w-[140px] bg-secondary h-9 sm:h-10 text-sm">
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
          
          {/* Second row: Date range and reset - responsive */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
            <span className="text-sm font-medium text-foreground">Rentang:</span>
            <div className="flex items-center gap-2 flex-1">
              <input
                type="date"
                value={jadwalStartDate}
                onChange={(e) => setJadwalStartDate(e.target.value)}
                className="flex-1 sm:w-auto px-2 sm:px-3 py-2 bg-secondary border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                placeholder="Dari"
              />
              <span className="text-muted-foreground">-</span>
              <input
                type="date"
                value={jadwalEndDate}
                onChange={(e) => setJadwalEndDate(e.target.value)}
                className="flex-1 sm:w-auto px-2 sm:px-3 py-2 bg-secondary border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                placeholder="Sampai"
              />
            </div>

            {/* Reset Button */}
            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="px-3 sm:px-4 py-2 text-sm text-primary hover:bg-primary/10 rounded-lg transition-colors border border-primary/30 whitespace-nowrap"
              >
                Reset Filter
              </button>
            )}
          </div>
        </div>
      </div>

      {paginatedJadwal.length > 0 ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {paginatedJadwal.map((jadwal, index) => {
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
                  className="bg-card dark:bg-white rounded-xl sm:rounded-2xl border border-border p-4 sm:p-5 shadow-lg hover:shadow-xl hover:border-primary/30 transition-all cursor-pointer group"
                  style={{ transitionDelay: `${index * 0.1}s` }}
                >
                  <div className="flex gap-3 sm:gap-4">
                    <div className="flex-shrink-0 w-14 sm:w-16 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg sm:rounded-xl flex flex-col items-center justify-center text-white py-2">
                      <span className="text-lg sm:text-xl font-bold leading-none">
                        {eventDate.getDate()}
                      </span>
                      <span className="text-[9px] sm:text-[10px] uppercase leading-tight mt-0.5">
                        {eventDate.toLocaleDateString("id-ID", {
                          month: "short",
                        })}
                      </span>
                      <span className="text-[8px] sm:text-[9px] font-medium mt-0.5">
                        {eventDate.getFullYear()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-2">
                        <span className="px-2 py-0.5 sm:py-1 text-[10px] sm:text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
                          Sosialisasi
                        </span>
                        <span className="px-2 py-0.5 sm:py-1 text-[10px] sm:text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                          {jadwal.kabupaten}
                        </span>
                      </div>
                      <h3 className="font-semibold text-foreground dark:text-gray-900 text-sm sm:text-base mb-2 line-clamp-2">
                        {jadwal.name}
                      </h3>
                      <div className="space-y-1 sm:space-y-1.5 text-xs sm:text-sm text-muted-foreground dark:text-gray-600">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-primary flex-shrink-0" />
                          <span>{jadwal.time} WIB</span>
                        </div>
                        <div className="flex items-start gap-1.5">
                          <MapPin className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-primary flex-shrink-0 mt-0.5" />
                          <span className="line-clamp-2">{jadwal.alamat}</span>
                        </div>
                      </div>
                      <div className="mt-2 sm:mt-3">
                        <span className="inline-flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 bg-primary/10 text-primary text-[10px] sm:text-xs font-medium rounded-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                          <MapPin className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                          <span>Lihat di Peta</span>
                          <ArrowRight className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              <button
                onClick={() => setJadwalPage(Math.max(1, jadwalPage - 1))}
                disabled={jadwalPage === 1}
                className="p-2 rounded-lg border border-border hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                  const showPage = page === 1 ||
                    page === totalPages ||
                    Math.abs(page - jadwalPage) <= 1;
                  const showEllipsis = page === 2 && jadwalPage > 3 ||
                    page === totalPages - 1 && jadwalPage < totalPages - 2;

                  if (!showPage && !showEllipsis) return null;

                  if (showEllipsis && !showPage) {
                    return <span key={page} className="px-2 text-muted-foreground">...</span>;
                  }

                  return (
                    <button
                      key={page}
                      onClick={() => setJadwalPage(page)}
                      className={`w-10 h-10 rounded-lg font-medium transition-colors ${jadwalPage === page
                          ? "bg-primary text-primary-foreground"
                          : "border border-border hover:bg-secondary"
                        }`}
                    >
                      {page}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => setJadwalPage(Math.min(totalPages, jadwalPage + 1))}
                disabled={jadwalPage === totalPages}
                className="p-2 rounded-lg border border-border hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>

              <span className="ml-4 text-sm text-muted-foreground">
                {jadwalPage}/{totalPages}
              </span>
            </div>
          )}
        </>
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
    </section>
  );
}
