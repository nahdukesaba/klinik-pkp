"use client";

import Image from "next/image";

import { CheckCircle2 } from "lucide-react";

import { SectionHeader } from "@/components/shared";
import { housingIndicatorsData } from "@/content/housing-indicators";
import { useScrollAnimation } from "@/hooks/use-scroll-animation";

export default function HousingIndicatorsSection() {
  const ref = useScrollAnimation();
  const indicators = housingIndicatorsData;

  if (indicators.length === 0) {
    return null;
  }

  return (
    <section ref={ref} className="py-4 lg:py-6 relative overflow-hidden animate-on-scroll visible">
      {/* Background Pattern */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-b from-secondary/60 via-background to-secondary/40 dark:from-background dark:via-primary/5 dark:to-background" />
        <div
          className="absolute top-0 left-0 w-full h-full opacity-30 dark:opacity-5"
          style={{
            backgroundImage: `radial-gradient(circle at 25% 25%, hsl(var(--primary) / 0.15) 0%, transparent 50%), radial-gradient(circle at 75% 75%, hsl(var(--accent-2) / 0.2) 0%, transparent 50%)`,
          }}
        />
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-1/4 left-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-0 w-96 h-96 bg-accent-2/10 rounded-full blur-3xl" />

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <SectionHeader
          badge="Indikator Kelayakan"
          title="Apakah Rumahmu Layak Huni?"
          description="Berikut adalah 6 indikator utama yang menentukan apakah sebuah rumah layak untuk dihuni."
        />

        {/* Indicators Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {indicators.map((indicator, index) => {
            const IconComponent = indicator.icon;
            const indicatorNumber = index + 1;
            return (
              <div
                key={indicator.id}
                className="group bg-card rounded-2xl border border-border overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 animate-on-scroll visible"
                style={{ transitionDelay: `${index * 0.1}s` }}
              >
                {/* Image Header with Number Badge */}
                <div className="relative h-44 overflow-hidden">
                  <Image
                    src={indicator.image}
                    alt={indicator.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-card/90 via-card/20 to-transparent" />

                  {/* Number Badge - Top Left */}
                  <div className="absolute top-3 left-3 w-9 h-9 bg-primary text-primary-foreground rounded-lg flex items-center justify-center font-bold text-base shadow-md z-10">
                    {indicatorNumber}
                  </div>

                  {/* Icon Badge - Bottom Right */}
                  <div className="absolute bottom-2 right-3 w-12 h-12 bg-gradient-to-br from-primary/40 to-accent/40 rounded-xl flex items-center justify-center text-primary-foreground/60 shadow-md z-10 group-hover:from-primary group-hover:to-accent group-hover:text-primary-foreground group-hover:scale-110 transition-all duration-300">
                    <IconComponent className="w-6 h-6" />
                  </div>
                </div>

                {/* Content */}
                <div className="p-5">
                  <h3 className="text-base font-semibold text-foreground group-hover:text-primary transition-colors mb-3">
                    {indicator.title}
                  </h3>
                  <ul className="space-y-1.5">
                    {indicator.checklist.map((item, i) => (
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
          })}
        </div>
      </div>
    </section>
  );
}