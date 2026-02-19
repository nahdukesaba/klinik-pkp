"use client";

import Image from "next/image";
import Link from "next/link";

import { Calendar, MapPin, ArrowRight } from "lucide-react";

import { formatDateId } from "@/lib/date";

// ============================================
// Types & Interfaces
// ============================================
export interface BeritaData {
  id: number;
  title: string;
  image: string;
  date: string;
  rawDate: string;
  month: string;
  description: string;
  kabupaten: string;
  coordinates: [number, number];
  images?: string[]; // Additional images for carousel
}

interface BeritaCardProps {
  berita: BeritaData;
  variant?: "default" | "compact" | "horizontal";
  showDescription?: boolean;
  onImageClick?: (e: React.MouseEvent) => void;
  onViewOnMap?: (e: React.MouseEvent) => void;
}

// ============================================
// BeritaCard Component
// Reusable card for berita/news items
// ============================================
export function BeritaCard({
  berita,
  variant = "default",
  showDescription = true,
  onImageClick,
  onViewOnMap,
}: BeritaCardProps) {
  const formattedDate = formatDateId(berita.rawDate, { month: "short" });
  
  if (variant === "compact") {
    return (
      <div className="bg-card dark:bg-card border border-border rounded-xl p-3 hover:border-primary/30 hover:shadow-md transition-all group">
        <Link 
          href={`/sosialisasi-klinik-pkp/berita/${berita.id}`}
          className="flex gap-3"
        >
          <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 relative">
            <Image
              src={berita.image}
              alt={berita.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform"
            />
          </div>
          <div className="flex-1 min-w-0 flex flex-col">
            <h4 className="text-sm font-medium line-clamp-2 group-hover:text-primary transition-colors text-foreground">
              {berita.title}
            </h4>
            <div className="flex items-center gap-1.5 mt-1 text-xs text-muted-foreground">
              <Calendar className="w-3 h-3" />
              <span>{formattedDate}</span>
            </div>
            <div className="mt-auto pt-2">
              <span className="inline-flex items-center text-xs text-primary font-medium group-hover:underline">
                Baca Selengkapnya →
              </span>
            </div>
          </div>
        </Link>
      </div>
    );
  }

  if (variant === "horizontal") {
    return (
      <Link 
        href={`/sosialisasi-klinik-pkp/berita/${berita.id}`}
        className="flex gap-4 p-4 rounded-2xl border border-border hover:border-primary/30 hover:shadow-lg transition-all group bg-card dark:bg-white"
      >
        <div className="w-32 h-24 rounded-xl overflow-hidden flex-shrink-0 relative">
          <Image
            src={berita.image}
            alt={berita.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform"
          />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold line-clamp-2 group-hover:text-primary transition-colors text-foreground dark:text-gray-800">
            {berita.title}
          </h4>
          <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              <span>{formattedDate}</span>
            </div>
            <div className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              <span>{berita.kabupaten}</span>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  // Default variant
  return (
    <div className="bg-card dark:bg-white rounded-2xl border border-border overflow-hidden shadow-lg hover:shadow-xl hover:border-primary/30 transition-all group">
      {/* Image with Location Badge */}
      <div 
        className={`aspect-video overflow-hidden relative ${onImageClick ? "cursor-pointer" : ""}`}
        onClick={onImageClick}
      >
        <Image
          src={berita.image}
          alt={berita.title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {/* Location Badge on Image */}
        <div className="absolute top-3 left-3 z-10">
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-black/60 text-white text-xs font-medium rounded-full backdrop-blur-sm">
            <MapPin className="w-3 h-3" />
            {berita.kabupaten}
          </span>
        </div>
        {/* Zoom hint overlay */}
        {onImageClick && (
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
            <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 rounded-full p-2">
              <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <circle cx="11" cy="11" r="8" strokeWidth={2} />
                <line x1="21" y1="21" x2="16.65" y2="16.65" strokeWidth={2} />
                <line x1="11" y1="8" x2="11" y2="14" strokeWidth={2} />
                <line x1="8" y1="11" x2="14" y2="11" strokeWidth={2} />
              </svg>
            </div>
          </div>
        )}
      </div>
      
      {/* Content */}
      <div className="p-5">
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <div className="flex items-center gap-1.5 px-2 py-0.5 bg-primary/10 rounded-md">
            <Calendar className="w-3.5 h-3.5 text-primary" />
            <span className="text-xs text-primary font-medium">
              {formattedDate}
            </span>
          </div>
        </div>
        
        <Link href={`/sosialisasi-klinik-pkp/berita/${berita.id}`}>
          <h3 className="text-lg font-semibold text-foreground dark:text-gray-800 line-clamp-2 mb-2 group-hover:text-primary transition-colors">
            {berita.title}
          </h3>
        </Link>
        
        {showDescription && berita.description && (
          <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
            {berita.description}
          </p>
        )}
        
        {/* Actions */}
        <div className="flex items-center gap-2 mt-4">
          <Link
            href={`/sosialisasi-klinik-pkp/berita/${berita.id}`}
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
          >
            Baca Selengkapnya
            <ArrowRight className="w-4 h-4" />
          </Link>
          {onViewOnMap && (
            <button
              onClick={onViewOnMap}
              className="p-2 border border-border rounded-lg hover:bg-muted transition-colors"
              title="Lihat di peta"
            >
              <MapPin className="w-4 h-4 text-muted-foreground" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================
// BeritaCardSkeleton Component
// Loading skeleton for BeritaCard
// ============================================
export function BeritaCardSkeleton({ variant = "default" }: { variant?: "default" | "compact" | "horizontal" }) {
  if (variant === "compact") {
    return (
      <div className="flex gap-3 p-3 animate-pulse">
        <div className="w-20 h-20 rounded-lg bg-muted" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-muted rounded w-3/4" />
          <div className="h-3 bg-muted rounded w-1/2" />
        </div>
      </div>
    );
  }

  if (variant === "horizontal") {
    return (
      <div className="flex gap-4 p-4 rounded-2xl border border-border animate-pulse">
        <div className="w-32 h-24 rounded-xl bg-muted" />
        <div className="flex-1 space-y-2">
          <div className="h-5 bg-muted rounded w-3/4" />
          <div className="h-4 bg-muted rounded w-1/2" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-2xl border border-border overflow-hidden animate-pulse">
      <div className="aspect-video bg-muted" />
      <div className="p-5 space-y-3">
        <div className="h-4 bg-muted rounded w-1/4" />
        <div className="h-5 bg-muted rounded w-3/4" />
        <div className="h-4 bg-muted rounded w-full" />
        <div className="h-10 bg-muted rounded w-full mt-4" />
      </div>
    </div>
  );
}

export default BeritaCard;