/**
 * PKPBeritaSection — Section berita sosialisasi PKP.
 *
 * Menampilkan daftar berita sosialisasi dengan filter tanggal
 * (tahun, bulan, rentang tanggal) dan pencarian teks.
 *
 * Refactored: menggunakan DateRangeFilterGroup shared component
 * untuk menghilangkan duplikasi mobile/desktop filter layout.
 *
 * @see DateRangeFilterGroup — filter tanggal responsif (shared)
 */

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

import { DateRangeFilterGroup } from "@/components/shared/DateRangeFilterGroup";
import { GridPagination } from "@/components/shared/GridPagination";
import { Input } from "@/components/ui/input";
import { formatDateId } from "@/lib/date";
import { type BeritaSosialisasi } from "@/services/sosialisasi.service";

// --- Types ---

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
  paginatedBerita: BeritaSosialisasi[];
  pagination: {
    currentPage: number;
    totalPages: number;
    setCurrentPage: (page: number) => void;
    goToNextPage: () => void;
    goToPrevPage: () => void;
  };
  resetFilters: () => void;
  hasActiveFilters: boolean;
  onImageClick?: (images: string[], index: number, title: string) => void;
  onViewOnMap?: (coordinates: [number, number]) => void;
}

// --- BeritaCard — Kartu berita individual ---

function BeritaCard({
  berita,
  index,
  onImageClick,
  onViewOnMap,
}: {
  berita: BeritaSosialisasi;
  index: number;
  onImageClick?: (images: string[], index: number, title: string) => void;
  onViewOnMap?: (coordinates: [number, number]) => void;
}) {
  /** Handler klik "Lihat di Peta" */
  const handleViewOnMap = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onViewOnMap?.(berita.coordinates);
  };

  /** Handler klik gambar untuk zoom */
  const handleImageClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onImageClick?.([berita.image, ...(berita.images ?? [])], 0, berita.title);
  };

  return (
    <div
      className="bg-card dark:bg-white rounded-xl sm:rounded-2xl border border-border overflow-hidden shadow-lg hover:shadow-xl hover:border-primary/30 transition-all group"
      style={{ transitionDelay: `${index * 0.1}s` }}
    >
      {/* Image + Location Badge */}
      <div
        className="aspect-video overflow-hidden relative cursor-pointer"
        onClick={handleImageClick}
      >
        <Image
          src={berita.image}
          alt={berita.title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-2 sm:top-3 left-2 sm:left-3 z-10">
          <span className="inline-flex items-center gap-1 px-1.5 sm:px-2 py-0.5 sm:py-1 bg-black/60 text-white text-[10px] sm:text-xs font-medium rounded-full backdrop-blur-sm">
            <MapPin className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
            {berita.kabupaten}
          </span>
        </div>
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
          <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 rounded-full p-2 backdrop-blur-sm">
            <Search className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 sm:p-5">
        {/* Date + Status badges */}
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-2 sm:mb-3">
          <div className="flex items-center gap-1 sm:gap-1.5 px-1.5 sm:px-2 py-0.5 bg-primary/10 rounded-md">
            <Calendar className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-primary" />
            <span className="text-[10px] sm:text-xs text-primary font-medium">
              {formatDateId(berita.rawDate, {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </span>
          </div>
          <span className="px-1.5 sm:px-2 py-0.5 text-[10px] sm:text-xs font-medium rounded-md bg-green-100 text-green-800">
            Selesai
          </span>
        </div>

        {/* Title */}
        <Link
          href={`/sosialisasi-klinik-pkp/berita/${berita.id}`}
          className="font-semibold text-foreground dark:text-gray-900 text-sm sm:text-base mb-2 line-clamp-2 group-hover:text-primary transition-colors block"
        >
          {berita.title}
        </Link>

        {/* Description */}
        <p className="text-muted-foreground dark:text-gray-600 text-xs sm:text-sm line-clamp-2 mb-3 sm:mb-4">
          {berita.description}
        </p>

        {/* Actions */}
        <div className="flex flex-col xs:flex-row items-stretch xs:items-center gap-2">
          <Link
            href={`/sosialisasi-klinik-pkp/berita/${berita.id}`}
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
}

// --- Main Section ---

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
  paginatedBerita,
  pagination,
  resetFilters,
  hasActiveFilters,
  onImageClick,
  onViewOnMap,
}: PKPBeritaSectionProps) {
  return (
    <section className="mb-16 bg-gradient-to-br from-primary/10 to-accent/10 dark:from-primary/5 dark:to-accent/5 rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 border border-primary/20 animate-on-scroll">
      <div className="flex flex-col gap-4 mb-6 sm:mb-8">
        {/* Header + Search */}
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground flex items-center gap-2">
            <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-primary flex-shrink-0" />
            <span>Berita Sosialisasi</span>
            <span className="text-xs sm:text-sm font-normal text-muted-foreground">
              ({filteredBerita.length} berita)
            </span>
          </h2>

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

        {/* Filters — menggunakan shared DateRangeFilterGroup */}
        <DateRangeFilterGroup
          year={beritaYear}
          setYear={setBeritaYear}
          month={beritaMonth}
          setMonth={setBeritaMonth}
          startDate={beritaStartDate}
          setStartDate={setBeritaStartDate}
          endDate={beritaEndDate}
          setEndDate={setBeritaEndDate}
          years={beritaYears}
          hasActiveFilters={hasActiveFilters}
          onReset={resetFilters}
          extraFiltersMobile={
            <span className="text-sm font-medium text-foreground">Filter:</span>
          }
        />
      </div>

      {/* Berita Grid */}
      {filteredBerita.length > 0 ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4 sm:gap-6">
            {paginatedBerita.map((berita, index) => (
              <BeritaCard
                key={berita.id}
                berita={berita}
                index={index}
                onImageClick={onImageClick}
                onViewOnMap={onViewOnMap}
              />
            ))}
          </div>
          <GridPagination
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            onPageChange={pagination.setCurrentPage}
            onPrev={pagination.goToPrevPage}
            onNext={pagination.goToNextPage}
          />
        </>
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
