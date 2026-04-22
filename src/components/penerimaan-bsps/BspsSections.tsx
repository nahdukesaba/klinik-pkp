"use client";

import { memo } from "react";
import type { ReactNode } from "react";

import Link from "next/link";

import {
  AlertCircle,
  ArrowRight,
  CheckCircle,
  ClipboardList,
  FileCheck,
  Gift,
  Search,
  Users,
} from "lucide-react";

import { ProgressIndicator } from "@/components/landing/ProgressIndicator";
import { StepArrow } from "@/components/landing/StepArrow";
import type { BspsProcessStep } from "@/services/bsps.service";

import type { LucideIcon } from "lucide-react";


// --- Background Pattern ---

export function BspsBackgroundPattern() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-secondary/80 via-background to-accent-2/20 dark:from-background dark:via-primary/5 dark:to-accent/5" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent-2/10 rounded-full blur-3xl" />
    </div>
  );
}

// --- Info Cards ---

interface InfoCardProps {
  id: string;
  icon: ReactNode;
  title: string;
  description: string;
  delay?: string;
}

function InfoCard({ id, icon, title, description, delay }: InfoCardProps) {
  const scrollTo = () => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <button
      onClick={scrollTo}
      className="p-6 bg-card rounded-2xl border border-border hover:border-primary/30 transition-all shadow-lg hover:shadow-xl animate-on-scroll group text-left"
      style={{ transitionDelay: delay }}
    >
      <div className="w-14 h-14 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center text-primary-foreground mb-4 group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <h3 className="font-semibold text-foreground text-lg mb-2">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </button>
  );
}

export function BspsInfoCards() {
  return (
    <div className="grid md:grid-cols-3 gap-6 mb-16">
      <InfoCard
        id="persyaratan"
        icon={<ClipboardList className="w-7 h-7" />}
        title="Persyaratan"
        description="Informasi lengkap persyaratan untuk mendaftar program BSPS."
      />
      <InfoCard
        id="prosedur"
        icon={<FileCheck className="w-7 h-7" />}
        title="Prosedur Pendaftaran"
        description="Langkah-langkah untuk mengajukan bantuan BSPS."
        delay="0.1s"
      />
      <InfoCard
        id="kriteria"
        icon={<Users className="w-7 h-7" />}
        title="Kriteria Penerima"
        description="Kriteria masyarakat yang berhak menerima BSPS."
        delay="0.2s"
      />
    </div>
  );
}

// --- Requirements ---

interface BspsRequirementsProps {
  requirements: string[];
}

export function BspsRequirements({ requirements }: BspsRequirementsProps) {
  return (
    <div id="persyaratan" className="mb-16 scroll-mt-24">
      <h2 className="text-2xl font-bold text-foreground mb-8 text-center">
        Persyaratan Penerima
      </h2>
      <div className="grid md:grid-cols-2 gap-4 max-w-4xl mx-auto">
        {requirements.map((req, index) => (
          <div
            key={index}
            className="flex items-start gap-3 p-4 bg-card rounded-xl border border-border animate-on-scroll"
            style={{ transitionDelay: `${index * 0.05}s` }}
          >
            <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
            <span className="text-foreground">{req}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// --- Process Steps ---

const stepIcons: Record<number, LucideIcon> = {
  1: ClipboardList,
  2: Search,
  3: Users,
  4: Gift,
  5: FileCheck,
  6: CheckCircle,
};

interface ProcessStepCardProps {
  step: { step: number; title: string; description: string };
  isHovered: boolean;
  isAnyHovered: boolean;
}

const ProcessStepCard = memo(function ProcessStepCard({ step, isHovered, isAnyHovered }: ProcessStepCardProps) {
  const IconComponent = stepIcons[step.step] || ClipboardList;
  const isLast = step.step === 6;
  const cardOpacity = isAnyHovered && !isHovered ? "opacity-50" : "opacity-100";
  const cardScale = isHovered ? "scale-[1.02]" : "scale-100";

  return (
    <div className={`h-full transition-all duration-300 ${cardOpacity} ${cardScale}`}>
      <div
        className={`flex flex-col h-full min-h-[160px] bg-card rounded-xl border p-4 shadow-md transition-all duration-300 ${
          isHovered ? "border-primary shadow-lg shadow-primary/20" : "border-border"
        } ${isLast && isHovered ? "ring-2 ring-green-500/50" : ""}`}
      >
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
              Langkah {step.step}
            </span>
            <h3
              className={`text-sm font-semibold transition-colors duration-300 line-clamp-1 ${
                isHovered ? "text-primary" : "text-foreground"
              }`}
            >
              {step.title}
            </h3>
          </div>
        </div>
        <p className="text-muted-foreground text-xs leading-relaxed flex-grow line-clamp-3">
          {step.description}
        </p>
      </div>
    </div>
  );
});

interface BspsProcessStepsProps {
  processSteps: BspsProcessStep[];
  hoveredStep: number | null;
  setHoveredStep: (value: number | null) => void;
  firstRow: BspsProcessStep[];
  secondRow: BspsProcessStep[];
  secondRowReversed: BspsProcessStep[];
}

export function BspsProcessSteps({
  processSteps,
  hoveredStep,
  setHoveredStep,
  firstRow,
  secondRow,
  secondRowReversed,
}: BspsProcessStepsProps) {
  const isAnyHovered = hoveredStep !== null;

  return (
    <div id="prosedur" className="mb-16 scroll-mt-24">
      <h2 className="text-2xl font-bold text-foreground mb-8 text-center">
        Prosedur Pendaftaran
      </h2>

      <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr_auto_1fr] gap-3 md:gap-0 items-stretch">
          {firstRow.map((item, index) => (
            <div key={item.step} className="contents">
              <div
                className="cursor-pointer"
                onMouseEnter={() => setHoveredStep(item.step)}
                onMouseLeave={() => setHoveredStep(null)}
              >
                <ProcessStepCard step={item} isHovered={hoveredStep === item.step} isAnyHovered={isAnyHovered} />
              </div>
              {index < 2 && (
                <StepArrow
                  direction="right"
                  isActive={hoveredStep !== null && hoveredStep >= item.step + 1}
                  className="hidden md:flex items-center px-2"
                />
              )}
              {index < 2 && (
                <div className="md:hidden flex justify-center py-2">
                  <StepArrow direction="down" isActive={hoveredStep !== null && hoveredStep >= item.step + 1} />
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="hidden md:flex justify-end pr-[calc(16.67%-8px)] py-3">
          <StepArrow direction="down" isActive={hoveredStep !== null && hoveredStep >= 4} />
        </div>
        <div className="md:hidden flex justify-center py-2">
          <StepArrow direction="down" isActive={hoveredStep !== null && hoveredStep >= 4} />
        </div>

        <div className="md:hidden grid grid-cols-1 gap-3">
          {secondRow.map((item, index) => (
            <div key={`mobile-${item.step}`}>
              <div
                className="cursor-pointer"
                onMouseEnter={() => setHoveredStep(item.step)}
                onMouseLeave={() => setHoveredStep(null)}
              >
                <ProcessStepCard step={item} isHovered={hoveredStep === item.step} isAnyHovered={isAnyHovered} />
              </div>
              {index < 2 && (
                <div className="flex justify-center py-2">
                  <StepArrow direction="down" isActive={hoveredStep !== null && hoveredStep >= item.step + 1} />
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="hidden md:grid grid-cols-[1fr_auto_1fr_auto_1fr] gap-0 items-stretch">
          {secondRowReversed.map((item, index) => (
            <div key={`desktop-${item.step}`} className="contents">
              <div
                className="cursor-pointer"
                onMouseEnter={() => setHoveredStep(item.step)}
                onMouseLeave={() => setHoveredStep(null)}
              >
                <ProcessStepCard step={item} isHovered={hoveredStep === item.step} isAnyHovered={isAnyHovered} />
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

        <ProgressIndicator totalSteps={processSteps.length} hoveredStep={hoveredStep} />
      </div>
    </div>
  );
}

// --- Kriteria ---

interface BspsKriteriaProps {
  kriteriaUtama: string[];
  prioritasPenerima: string[];
}

export function BspsKriteria({ kriteriaUtama, prioritasPenerima }: BspsKriteriaProps) {
  return (
    <div id="kriteria" className="mb-16 scroll-mt-24">
      <h2 className="text-2xl font-bold text-foreground mb-8 text-center">
        Kriteria Penerima
      </h2>
      <div className="max-w-4xl mx-auto bg-card rounded-2xl border border-border p-8 shadow-lg">
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              Kriteria Utama
            </h3>
            <ul className="space-y-3">
              {kriteriaUtama.map((item, index) => (
                <li key={index} className="flex items-start gap-2 text-muted-foreground">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-1 flex-shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <FileCheck className="w-5 h-5 text-primary" />
              Prioritas Penerima
            </h3>
            <ul className="space-y-3">
              {prioritasPenerima.map((item, index) => (
                <li key={index} className="flex items-start gap-2 text-muted-foreground">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-1 flex-shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- CTA ---

export function BspsCta() {
  return (
    <div className="p-8 bg-card rounded-2xl border border-border animate-on-scroll text-center">
      <AlertCircle className="w-12 h-12 text-primary mx-auto mb-4" />
      <h3 className="text-xl font-bold text-foreground mb-2">Butuh Bantuan?</h3>
      <p className="text-muted-foreground mb-6">
        Hubungi kami untuk informasi lebih lanjut tentang program BSPS
      </p>
      <Link
        href="/informasi/kontak"
        className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary-hover transition-colors"
      >
        Hubungi Kami
        <ArrowRight className="w-4 h-4" />
      </Link>
    </div>
  );
}
