"use client";

import {
  AlertTriangle,
  CheckCircle2,
  Hammer,
  Info,
  Layers,
  Ruler,
  ShieldCheck,
} from "lucide-react";

import { Footer, Navbar } from "@/components/layout";
import { materialCategories, materialTips } from "@/data/informasi";
import { useScrollAnimation } from "@/hooks/use-scroll-animation";

import type { LucideIcon } from "lucide-react";

export const dynamic = "force-dynamic";

const iconMap: Record<string, LucideIcon> = {
  Layers,
  Ruler,
  ShieldCheck,
  Hammer,
};

export default function BahanBangunanPage() {
  const ref = useScrollAnimation();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main ref={ref} className="pt-24 pb-16">
        {/* Background Pattern */}
        <div className="fixed inset-0 -z-10 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-secondary/60 via-background to-accent-2/20 dark:from-background dark:via-primary/5 dark:to-accent/5" />
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent-2/10 rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-12 animate-on-scroll">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium mb-4 border border-primary/20">
              <Hammer className="w-4 h-4" />
              <span>Informasi</span>
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
              Standar Bahan Bangunan
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              Panduan lengkap mengenai spesifikasi dan standar bahan bangunan
              untuk pembangunan rumah layak huni sesuai peraturan yang berlaku
            </p>
          </div>

          {/* Info Banner */}
          <div className="mb-12 p-6 bg-primary/10 rounded-2xl border border-primary/20 animate-on-scroll">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0">
                <Info className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-2">
                  Tentang Standar Material BSPS
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Seluruh material yang digunakan dalam program BSPS harus
                  memenuhi Standar Nasional Indonesia (SNI) untuk menjamin
                  kualitas dan keamanan konstruksi. Material berkualitas akan
                  menghasilkan bangunan yang kokoh, tahan lama, dan aman untuk
                  dihuni.
                </p>
              </div>
            </div>
          </div>

          {/* Material Categories */}
          <div className="space-y-8 mb-12">
            {materialCategories.map((category, index) => {
              const IconComponent = iconMap[category.iconName];
              return (
                <div
                  key={category.id}
                  className="bg-card rounded-2xl border border-border overflow-hidden shadow-lg animate-on-scroll"
                  style={{ transitionDelay: `${index * 0.1}s` }}
                >
                  <div className="p-6 bg-gradient-to-r from-primary/10 to-accent/10 border-b border-border">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center text-primary-foreground">
                        {IconComponent && <IconComponent className="w-6 h-6" />}
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-foreground">
                          {category.title}
                        </h2>
                        <p className="text-sm text-muted-foreground">
                          {category.description}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="grid md:grid-cols-2 gap-4">
                      {category.items.map((item, itemIndex) => (
                        <div
                          key={itemIndex}
                          className="p-4 bg-secondary/30 rounded-xl border border-border/50 hover:border-primary/30 transition-colors"
                        >
                          <div className="flex items-start gap-3">
                            <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                            <div>
                              <h4 className="font-semibold text-foreground mb-1">
                                {item.name}
                              </h4>
                              <p className="text-sm text-muted-foreground mb-2">
                                {item.specification}
                              </p>
                              <span className="inline-block px-2 py-1 bg-primary/10 text-primary text-xs rounded-md font-medium">
                                {item.standard}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Tips Section */}
          <div className="bg-card rounded-2xl border border-border p-6 shadow-lg animate-on-scroll">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-yellow-500/20 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-yellow-600" />
              </div>
              <h3 className="text-lg font-bold text-foreground">
                Tips Pemilihan Material
              </h3>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {materialTips.map((tip, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-4 bg-secondary/30 rounded-xl"
                >
                  <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm font-bold flex items-center justify-center flex-shrink-0">
                    {index + 1}
                  </span>
                  <p className="text-sm text-muted-foreground">{tip}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
