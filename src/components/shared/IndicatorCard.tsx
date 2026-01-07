/**
 * IndicatorCard Component
 * 
 * Reusable card component untuk menampilkan indikator kelayakan.
 * Atoms-level component yang dapat digunakan di berbagai konteks.
 */

import Image from "next/image";

import { CheckCircle2 } from "lucide-react";

import type { LucideIcon } from "lucide-react";

interface IndicatorCardProps {
  number: number;
  image: string;
  icon: LucideIcon;
  title: string;
  checklist: string[];
  index?: number;
}

export function IndicatorCard({
  number,
  image,
  icon: IconComponent,
  title,
  checklist,
  index = 0,
}: IndicatorCardProps) {
  return (
    <div
      className="group bg-card rounded-2xl border border-border overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 animate-on-scroll"
      style={{ transitionDelay: `${index * 0.1}s` }}
    >
      {/* Image Header with Number Badge */}
      <div className="relative h-44 overflow-hidden">
        <Image
          src={image}
          alt={title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-card/90 via-card/20 to-transparent" />

        {/* Number Badge - Top Left */}
        <div className="absolute top-3 left-3 w-9 h-9 bg-primary text-primary-foreground rounded-lg flex items-center justify-center font-bold text-base shadow-md z-10">
          {number}
        </div>

        {/* Icon Badge - Bottom Right */}
        <div className="absolute bottom-3 right-3 w-11 h-11 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center text-primary-foreground shadow-lg z-10 group-hover:scale-110 transition-transform">
          <IconComponent className="w-5 h-5" />
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="text-base font-semibold text-foreground group-hover:text-primary transition-colors mb-3">
          {title}
        </h3>
        <ul className="space-y-1.5">
          {checklist.map((item, i) => (
            <li
              key={i}
              className="flex items-start gap-2 text-sm text-muted-foreground"
            >
              <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
