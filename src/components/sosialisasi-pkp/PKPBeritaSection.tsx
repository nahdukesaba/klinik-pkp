"use client";

import Image from "next/image";
import Link from "next/link";

import {
  ArrowRight,
  BookOpen,
  Calendar,
  MapPin,
  Search,
} from "lucide-react";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { type BeritaSosialisasi } from "@/data/sosialisasi-klinik";
import { MONTHS_LIST } from "@/lib/constants";

interface PKPBeritaSectionProps {
  beritaYear: string;
  setBeritaYear: (year: string) => void;
  beritaMonth: string;
  setBeritaMonth: (month: string) => void;
  beritaStartDate: string;
  setBeritaStartDate: (date: string) => void;
  beritaEndDate: string;
  setBeritaEndDate: (date: string) => void;
  beritaSearch: string;
  setBeritaSearch: (search: string) => void;
  beritaYears: number[];
  filteredBerita: BeritaSosialisasi[];
  resetFilters: () => void;
  hasActiveFilters: boolean;
  onImageClick?: (images: string[], index: number, title: string) => void;
  onViewOnMap?: (coordinates: [number, number]) => void;
}

export function PKPBeritaSection({
  beritaYear,
  setBeritaYear,
  beritaMonth,
  setBeritaMonth,
  beritaStartDate,
  setBeritaStartDate,
  beritaEndDate,
  setBeritaEndDate,
  beritaSearch,
  setBeritaSearch,
  beritaYears,
  filteredBerita,
  resetFilters,
  hasActiveFilters,
  onImageClick,
  onViewOnMap,
}: PKPBeritaSectionProps) {
  return (
    <section className="mb-16 bg-gradient-to-br from-primary/10 to-accent/10 dark:from-primary/5 dark:to-accent/5 rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 border border-primary/20 animate-on-scroll">
      <div className="flex flex-col gap-4 mb-6 sm:mb-8">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground flex items-center gap-2">
            <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-primary flex-shrink-0" />
            <span>Berita Sosialisasi</span>
            <span className="text-xs sm:text-sm font-normal text-muted-foreground">
              ({filteredBerita.length} berita)
            </span>
          </h2>

          {/* Search Input */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Cari judul, deskripsi, lokasi..."
              value={beritaSearch}
              onChange={(e) => setBeritaSearch(e.target.value)}
              className="pl-10 bg-card text-sm"
            />
          </div>
        </div>

        {/* Filter Card - Responsive */}
        <div className="flex flex-col gap-3 p-3 sm:p-4 bg-card rounded-xl border border-border">
          {/* Mobile: stacked layout */}
          <div className="md:hidden flex flex-col gap-3">
            <span className="text-sm font-medium text-foreground">Filter:</span>
            {/* Main filters */}
            <div className="grid grid-cols-2 gap-2">
              {/* Year Filter */}
              <Select value={beritaYear} onValueChange={(v) => {
                setBeritaYear(v);
                setBeritaStartDate("");
                setBeritaEndDate("");
              }}>
                <SelectTrigger className="w-full bg-secondary h-9 text-sm">
                  <SelectValue placeholder="Tahun" />
                </SelectTrigger>
                <SelectContent className="bg-popover z-[9999]">
                  <SelectItem value="all">Semua Tahun</SelectItem>
                  {beritaYears.map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {/* Month Filter */}
              <Select value={beritaMonth} onValueChange={(v) => {
                setBeritaMonth(v);
                setBeritaStartDate("");
                setBeritaEndDate("");
              }}>
                <SelectTrigger className="w-full bg-secondary h-9 text-sm">
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

            {/* Date Range - Mobile */}
            <div className="flex flex-col gap-2">
              <span className="text-sm font-medium text-foreground">Rentang:</span>
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={beritaStartDate}
                  onChange={(e) => {
                    setBeritaStartDate(e.target.value);
                    if (e.target.value) {
                      setBeritaYear("all");
                      setBeritaMonth("all");
                    }
                  }}
                  className="flex-1 min-w-0 px-2 py-2 bg-secondary border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
                <span className="text-muted-foreground">-</span>
                <input
                  type="date"
                  value={beritaEndDate}
                  onChange={(e) => {
                    setBeritaEndDate(e.target.value);
                    if (e.target.value) {
                      setBeritaYear("all");
                      setBeritaMonth("all");
                    }
                  }}
                  className="flex-1 min-w-0 px-2 py-2 bg-secondary border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
            </div>

            {/* Reset Button - Mobile */}
            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="px-3 py-2 text-sm text-primary hover:bg-primary/10 rounded-lg transition-colors border border-primary/30"
              >
                Reset Filter
              </button>
            )}
          </div>

          {/* Desktop: single row layout */}
          <div className="hidden md:flex md:flex-wrap md:items-center gap-3">
            <span className="text-sm font-medium text-foreground">Filter:</span>
            {/* Year Filter */}
            <Select value={beritaYear} onValueChange={(v) => {
              setBeritaYear(v);
              setBeritaStartDate("");
              setBeritaEndDate("");
            }}>
              <SelectTrigger className="w-[120px] bg-secondary h-10 text-sm">
                <SelectValue placeholder="Tahun" />
              </SelectTrigger>
              <SelectContent className="bg-popover z-[9999]">
                <SelectItem value="all">Semua Tahun</SelectItem>
                {beritaYears.map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {/* Month Filter */}
            <Select value={beritaMonth} onValueChange={(v) => {
              setBeritaMonth(v);
              setBeritaStartDate("");
              setBeritaEndDate("");
            }}>
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
              value={beritaStartDate}
              onChange={(e) => {
                setBeritaStartDate(e.target.value);
                if (e.target.value) {
                  setBeritaYear("all");
                  setBeritaMonth("all");
                }
              }}
              className="w-[140px] px-3 py-2 bg-secondary border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
            <span className="text-muted-foreground">-</span>
            <input
              type="date"
              value={beritaEndDate}
              onChange={(e) => {
                setBeritaEndDate(e.target.value);
                if (e.target.value) {
                  setBeritaYear("all");
                  setBeritaMonth("all");
                }
              }}
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

      {filteredBerita.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filteredBerita.map((berita, index) => {
            const eventDate = new Date(berita.rawDate);

            const handleViewOnMap = (e: React.MouseEvent) => {
              e.preventDefault();
              e.stopPropagation();
              if (onViewOnMap) {
                onViewOnMap(berita.coordinates);
              }
            };

            const handleImageClick = (e: React.MouseEvent) => {
              e.stopPropagation();
              if (onImageClick) {
                onImageClick([berita.image], 0, berita.title);
              }
            };

            return (
              <div
                key={berita.id}
                className="bg-card dark:bg-white rounded-xl sm:rounded-2xl border border-border overflow-hidden shadow-lg hover:shadow-xl hover:border-primary/30 transition-all group"
                style={{ transitionDelay: `${index * 0.1}s` }}
              >
                {/* Image with Location Badge */}
                <div
                  className="aspect-video overflow-hidden relative cursor-pointer"
                  onClick={handleImageClick}
                >
                  <Image
                    src={berita.image}
                    alt={berita.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {/* Location Badge on Image */}
                  <div className="absolute top-2 sm:top-3 left-2 sm:left-3 z-10">
                    <span className="inline-flex items-center gap-1 px-1.5 sm:px-2 py-0.5 sm:py-1 bg-black/60 text-white text-[10px] sm:text-xs font-medium rounded-full backdrop-blur-sm">
                      <MapPin className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                      {berita.kabupaten}
                    </span>
                  </div>
                  {/* Zoom hint overlay */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 rounded-full p-2 backdrop-blur-sm">
                      <Search className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4 sm:p-5">
                  <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-2 sm:mb-3">
                    <div className="flex items-center gap-1 sm:gap-1.5 px-1.5 sm:px-2 py-0.5 bg-primary/10 rounded-md">
                      <Calendar className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-primary" />
                      <span className="text-[10px] sm:text-xs text-primary font-medium">
                        {eventDate.getDate()} {eventDate.toLocaleDateString("id-ID", { month: "short" })} {eventDate.getFullYear()}
                      </span>
                    </div>
                    <span className="px-1.5 sm:px-2 py-0.5 text-[10px] sm:text-xs font-medium rounded-md bg-green-100 text-green-800">
                      Selesai
                    </span>
                  </div>

                  <Link
                    href={`/berita/${berita.id}`}
                    className="font-semibold text-foreground dark:text-gray-900 text-sm sm:text-base mb-2 line-clamp-2 group-hover:text-primary transition-colors block"
                  >
                    {berita.title}
                  </Link>

                  <p className="text-muted-foreground dark:text-gray-600 text-xs sm:text-sm line-clamp-2 mb-3 sm:mb-4">
                    {berita.description}
                  </p>

                  {/* Action Buttons - Stack on mobile */}
                  <div className="flex flex-col xs:flex-row items-stretch xs:items-center gap-2">
                    <Link
                      href={`/berita/${berita.id}`}
                      className="inline-flex items-center justify-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 bg-primary text-white text-[10px] sm:text-xs font-medium rounded-full hover:bg-primary/90 transition-colors"
                    >
                      <span>Baca Selengkapnya</span>
                      <ArrowRight className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                    </Link>
                    <button
                      onClick={handleViewOnMap}
                      className="inline-flex items-center justify-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 bg-primary/10 text-primary text-[10px] sm:text-xs font-medium rounded-full hover:bg-primary hover:text-primary-foreground transition-colors"
                    >
                      <MapPin className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                      <span>Lihat di Peta</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12 bg-card rounded-2xl border border-border">
          <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">
            Tidak ada berita pada rentang tanggal yang dipilih.
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
