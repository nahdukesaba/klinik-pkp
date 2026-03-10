"use client";

import Image from "next/image";
import Link from "next/link";

import { Calendar, MapPin } from "lucide-react";

import { formatDateId } from "@/lib/date";

// ============================================
// Types
// ============================================
interface RelatedNewsCardProps {
  id: number;
  title: string;
  image: string;
  rawDate: string;
  kabupaten: string;
}

// ============================================
// RelatedNewsCard Component
// Displays related news in a clean card format
// ============================================
export function RelatedNewsCard({
  id,
  title,
  image,
  rawDate,
  kabupaten,
}: RelatedNewsCardProps) {
  return (
    <Link
      href={`/sosialisasi-klinik-pkp/berita/${id}`}
      className="group flex gap-2 md:gap-3 bg-background border border-border rounded-xl overflow-hidden hover:border-primary/40 hover:shadow-md transition-all duration-300 p-2 md:p-3"
    >
      {/* Image Section - Left */}
      <div className="relative w-24 h-24 md:w-28 md:h-28 flex-shrink-0 rounded-md overflow-hidden bg-muted">
        <Image
          src={image}
          alt={title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
          sizes="112px"
        />
      </div>

      {/* Content Section - Right */}
      <div className="flex-1 min-w-0 flex flex-col justify-center space-y-1.5 md:space-y-2">
        {/* Title */}
        <h4 className="text-sm md:text-base font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors duration-200">
          {title}
        </h4>

        {/* Metadata */}
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Calendar className="w-3 h-3 md:w-3.5 md:h-3.5 text-primary flex-shrink-0" />
            <span className="line-clamp-1">{formatDateId(rawDate)}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <MapPin className="w-3 h-3 md:w-3.5 md:h-3.5 text-primary flex-shrink-0" />
            <span className="line-clamp-1">{kabupaten}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
