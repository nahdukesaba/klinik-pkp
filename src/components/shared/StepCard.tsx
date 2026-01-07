/**
 * StepCard Component
 * 
 * Reusable card component untuk menampilkan langkah pembangunan.
 * Atoms-level component yang dapat digunakan di berbagai konteks.
 */

import { ArrowRight } from "lucide-react";

import type { LucideIcon } from "lucide-react";

interface StepCardProps {
  step: number;
  icon: LucideIcon;
  title: string;
  description: string;
  index?: number;
  showArrow?: boolean;
  isLast?: boolean;
}

export function StepCard({
  step,
  icon: IconComponent,
  title,
  description,
  index = 0,
  showArrow = false,
  isLast = false,
}: StepCardProps) {
  return (
    <div
      className="relative flex items-stretch animate-on-scroll h-full w-full"
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      <div
        className={`flex flex-col w-full h-full bg-card rounded-2xl border border-border p-5 shadow-lg hover:shadow-xl hover:border-primary/30 transition-all duration-300 group ${
          isLast ? "ring-2 ring-green-500/50" : ""
        }`}
      >
        <div className="flex items-center gap-3 mb-3">
          <div
            className={`w-12 h-12 ${
              isLast
                ? "bg-gradient-to-br from-green-500 to-green-600"
                : "bg-gradient-to-br from-primary to-accent"
            } rounded-xl flex items-center justify-center text-primary-foreground shadow-lg group-hover:scale-110 transition-transform flex-shrink-0`}
          >
            <IconComponent className="w-6 h-6" />
          </div>
          <div>
            <span
              className={`text-xs font-bold ${
                isLast ? "text-green-500" : "text-primary"
              }`}
            >
              Langkah {step}
            </span>
            <h3 className="text-base font-semibold text-foreground group-hover:text-primary transition-colors">
              {title}
            </h3>
          </div>
        </div>
        <p className="text-muted-foreground text-sm leading-relaxed flex-1">
          {description}
        </p>
      </div>

      {/* Horizontal Arrow (for cards within row) */}
      {showArrow && (
        <div className="hidden md:flex items-center justify-center w-12 flex-shrink-0">
          <div className="relative">
            <div className="w-8 h-0.5 bg-gradient-to-r from-primary to-accent"></div>
            <ArrowRight className="absolute -right-1 -top-[7px] w-4 h-4 text-accent" />
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * StepCardReverse - dengan panah ke kiri
 */
interface StepCardReverseProps extends Omit<StepCardProps, "showArrow"> {
  showLeftArrow?: boolean;
}

export function StepCardReverse({
  step,
  icon: IconComponent,
  title,
  description,
  index = 0,
  isLast = false,
  showLeftArrow = false,
}: StepCardReverseProps) {
  return (
    <div className="flex h-full">
      <div className="relative flex items-center w-full h-full animate-on-scroll">
        {/* Panah ke kiri */}
        {showLeftArrow && (
          <div className="hidden md:flex items-center justify-center w-12 flex-shrink-0 order-first">
            <div className="relative">
              <div className="w-8 h-0.5 bg-gradient-to-l from-primary to-accent"></div>
              <ArrowRight className="absolute -left-1 -top-[7px] w-4 h-4 text-accent rotate-180" />
            </div>
          </div>
        )}
        <div className="flex-1 h-full flex">
          <StepCard
            step={step}
            icon={IconComponent}
            title={title}
            description={description}
            index={index}
            isLast={isLast}
          />
        </div>
      </div>
    </div>
  );
}
