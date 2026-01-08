"use client";

import { useState } from "react";

import { SectionHeader } from "@/components/shared";
import { StepCardSkeleton } from "@/components/ui/skeleton";
import { useBuildingSteps } from "@/hooks/use-building-steps";
import useScrollAnimation from "@/hooks/use-scroll-animation";

import { ProgressIndicator } from "./ProgressIndicator";
import { StepArrow } from "./StepArrow";

import type { LucideIcon } from "lucide-react";

// ============================================
// Types & Interfaces
// ============================================
interface Step {
  id: string;
  icon: LucideIcon;
  step: number;
  title: string;
  description: string;
}

interface StepCardProps {
  item: Step;
  isHovered: boolean;
  isAnyHovered: boolean;
}

// ============================================
// StepCard Component - Konsisten & Simetris
// ============================================
function StepCard({ item, isHovered, isAnyHovered }: StepCardProps) {
  const IconComponent = item.icon;
  // Check if this is truly the last step (step 6 = Serah Terima)
  const isLast = item.step === 6;
  const cardOpacity = isAnyHovered && !isHovered ? "opacity-50" : "opacity-100";
  const cardScale = isHovered ? "scale-[1.02]" : "scale-100";

  return (
    <div
      className={`h-full transition-all duration-300 ${cardOpacity} ${cardScale}`}
    >
      <div
        className={`flex flex-col h-full min-h-[160px] bg-card rounded-xl border p-4 shadow-md transition-all duration-300 ${
          isHovered ? "border-primary shadow-lg shadow-primary/20" : "border-border"
        } ${isLast && isHovered ? "ring-2 ring-green-500/50" : ""}`}
      >
        {/* Header dengan Icon dan Label */}
        <div className="flex items-center gap-3 mb-3">
          <div
            className={`w-10 h-10 flex-shrink-0 ${
              isLast
                ? "bg-gradient-to-br from-green-500 to-green-600"
                : "bg-gradient-to-br from-primary to-accent"
            } rounded-lg flex items-center justify-center text-primary-foreground shadow-md transition-transform duration-300 ${
              isHovered ? "scale-110" : ""
            }`}
          >
            <IconComponent className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <span className={`text-xs font-bold ${isLast ? "text-green-500" : "text-primary"}`}>
              Langkah {item.step}
            </span>
            <h3
              className={`text-sm font-semibold transition-colors duration-300 line-clamp-1 ${
                isHovered ? "text-primary" : "text-foreground"
              }`}
            >
              {item.title}
            </h3>
          </div>
        </div>

        {/* Deskripsi */}
        <p className="text-muted-foreground text-xs leading-relaxed flex-grow line-clamp-3">
          {item.description}
        </p>
      </div>
    </div>
  );
}

// ============================================
// Main Component
// ============================================
export default function BuildingStepsSection() {
  const ref = useScrollAnimation();
  const { data: steps, isLoading } = useBuildingSteps();
  const [hoveredStep, setHoveredStep] = useState<number | null>(null);

  if (!steps || steps.length === 0) {
    return null;
  }

  // Split steps: Row 1 = [1,2,3], Row 2 = [4,5,6]
  const firstRow = steps.slice(0, 3); // Steps 1, 2, 3
  const secondRow = steps.slice(3, 6); // Steps 4, 5, 6 (normal order)
  const secondRowReversed = [...secondRow].reverse(); // Steps 6, 5, 4 (for desktop display)

  return (
    <section ref={ref} className="py-10 lg:py-12 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-accent-2/20 via-background to-secondary/40 dark:from-primary/5 dark:via-background dark:to-accent/5" />
      </div>

      {/* Decorative */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-gradient-radial from-primary/5 to-transparent rounded-full" />

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <SectionHeader
          badge="Panduan Pembangunan"
          title="Bagaimana Tahapan Membangun Rumah?"
          description="Ikuti langkah-langkah berikut untuk membangun rumah impian Anda dengan terencana dan aman."
        />

        {/* Loading State */}
        {isLoading ? (
          <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <StepCardSkeleton key={i} />
            ))}
          </div>
        ) : (
          /* Steps Grid with Arrows */
          <div className="max-w-5xl mx-auto">
            {/* ==================== ROW 1: Steps 1→2→3 ==================== */}
            <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr_auto_1fr] gap-3 md:gap-0 items-stretch">
              {firstRow.map((item, index) => (
                <div key={item.id} className="contents">
                  {/* Step Card */}
                  <div
                    className="cursor-pointer"
                    onMouseEnter={() => setHoveredStep(item.step)}
                    onMouseLeave={() => setHoveredStep(null)}
                  >
                    <StepCard
                      item={item}
                      isHovered={hoveredStep === item.step}
                      isAnyHovered={hoveredStep !== null}
                    />
                  </div>

                  {/* Arrow between cards: 1→2, 2→3 */}
                  {index < 2 && (
                    <StepArrow
                      direction="right"
                      isActive={hoveredStep !== null && hoveredStep >= item.step + 1}
                      className="hidden md:flex items-center px-2"
                    />
                  )}

                  {/* Mobile: vertical arrow */}
                  {index < 2 && (
                    <div className="md:hidden flex justify-center py-2">
                      <StepArrow direction="down" isActive={hoveredStep !== null && hoveredStep >= item.step + 1} />
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* ==================== Arrow from Step 3 to Step 4 (DOWN) ==================== */}
            <div className="hidden md:flex justify-end pr-[calc(16.67%-8px)] py-3">
              <StepArrow direction="down" isActive={hoveredStep !== null && hoveredStep >= 4} />
            </div>
            {/* Mobile: arrow down after step 3 */}
            <div className="md:hidden flex justify-center py-2">
              <StepArrow direction="down" isActive={hoveredStep !== null && hoveredStep >= 4} />
            </div>

            {/* ==================== ROW 2 MOBILE: Steps 4→5→6 (normal order, vertical) ==================== */}
            <div className="md:hidden grid grid-cols-1 gap-3">
              {secondRow.map((item, index) => (
                <div key={`mobile-${item.id}`}>
                  <div
                    className="cursor-pointer"
                    onMouseEnter={() => setHoveredStep(item.step)}
                    onMouseLeave={() => setHoveredStep(null)}
                  >
                    <StepCard
                      item={item}
                      isHovered={hoveredStep === item.step}
                      isAnyHovered={hoveredStep !== null}
                    />
                  </div>
                  {index < 2 && (
                    <div className="flex justify-center py-2">
                      <StepArrow direction="down" isActive={hoveredStep !== null && hoveredStep >= item.step + 1} />
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* ==================== ROW 2 DESKTOP: Steps 6←5←4 (reversed order, horizontal left) ==================== */}
            <div className="hidden md:grid grid-cols-[1fr_auto_1fr_auto_1fr] gap-0 items-stretch">
              {secondRowReversed.map((item, index) => (
                <div key={`desktop-${item.id}`} className="contents">
                  <div
                    className="cursor-pointer"
                    onMouseEnter={() => setHoveredStep(item.step)}
                    onMouseLeave={() => setHoveredStep(null)}
                  >
                    <StepCard
                      item={item}
                      isHovered={hoveredStep === item.step}
                      isAnyHovered={hoveredStep !== null}
                    />
                  </div>
                  {index < 2 && (
                    <StepArrow
                      direction="left"
                      isActive={hoveredStep !== null && hoveredStep >= item.step + 1}
                      className="flex items-center px-2"
                    />
                  )}
                </div>
              ))}
            </div>

            {/* Progress Indicator */}
            <ProgressIndicator totalSteps={steps.length} hoveredStep={hoveredStep} />
          </div>
        )}

        {/* ==================== Instagram Section ==================== */}
        <div className="mt-16">
          <div className="text-center mb-8">
            <h3 className="text-xl lg:text-2xl font-bold text-foreground mb-2">
              Ikuti Kami di Instagram
            </h3>
            <p className="text-muted-foreground text-sm max-w-xl mx-auto">
              Dapatkan inspirasi desain rumah, tips pembangunan, dan update kegiatan sosialisasi terbaru
            </p>
          </div>

          {/* Instagram Embed */}
          <div className="max-w-6xl mx-auto">
            <div className="bg-card rounded-2xl overflow-hidden border border-border shadow-lg">
              <iframe
                src="https://www.instagram.com/bp3kp_sumatera2/embed"
                className="w-full h-[600px] md:h-[700px] border-0"
                loading="lazy"
                title="Instagram BP3KP Sumatera II"
                allow="encrypted-media"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
