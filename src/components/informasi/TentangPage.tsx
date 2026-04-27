"use client";

import {
  Building2,
  ClipboardList,
  FileQuestion,
  FileText,
  Heart,
  Home,
  MapPin,
  Shield,
  Target,
  Users,
  Zap,
} from "lucide-react";

import { Footer, Navbar } from "@/components/layout";
import {
  aboutInfo,
  layananKlinik,
  nilaiNilai,
  sejarah,
  tugasDanFungsi,
} from "@/content/tentang.content";
import { useScrollAnimation } from "@/hooks/use-scroll-animation";

import type { LucideIcon } from "lucide-react";

const iconMap: Record<string, LucideIcon> = {
  FileQuestion,
  ClipboardList,
  Home,
  Users,
  FileText,
  MapPin,
  Target,
  Heart,
  Zap,
  Shield,
};

export default function TentangPage() {
  const ref = useScrollAnimation();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-secondary/60 via-background to-accent-2/20 dark:from-background dark:via-primary/5 dark:to-accent/5" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-accent-2/10 blur-3xl" />
      </div>

      <main ref={ref} className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-16 animate-on-scroll">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium mb-4 border border-primary/20">
              <Building2 className="w-4 h-4" />
              <span>Tentang</span>
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
              {aboutInfo.shortTitle}
            </h1>
            <p className="text-muted-foreground max-w-3xl mx-auto text-lg leading-relaxed">
              {aboutInfo.description}
            </p>
          </div>

          {/* Info Cards */}
          <div className="grid md:grid-cols-2 gap-6 mb-16 animate-on-scroll">
            {/* Alamat Card */}
            <div className="bg-card rounded-2xl border border-border p-6 shadow-lg">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-2">Alamat Kantor BP3KP</h3>
                  <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
                    <div>
                      <span className="font-medium text-foreground">Kantor BP3KP</span>
                      <p>{aboutInfo.alamat.jalan}</p>
                    </div>
                    {aboutInfo.alamat.satker && (
                      <div>
                        <span className="font-medium text-foreground">{aboutInfo.alamat.satker.nama}</span>
                        <p>{aboutInfo.alamat.satker.jalan}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Wilayah Kerja Card */}
            <div className="bg-card rounded-2xl border border-border p-6 shadow-lg">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-3">Wilayah Kerja</h3>
                  <div className="space-y-2">
                    {aboutInfo.wilayahKerja.map((wilayah: string, index: number) => (
                      <div key={index} className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-accent" />
                        <span className="text-sm text-muted-foreground">{wilayah}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sejarah */}
          <div className="mb-16 animate-on-scroll">
            <div className="bg-card rounded-2xl border border-border p-8 shadow-lg">
              <h2 className="text-2xl font-bold text-foreground mb-6">{sejarah.title}</h2>
              <div className="space-y-4">
                {sejarah.paragraphs.map((paragraph: string, index: number) => (
                  <p key={index} className="text-muted-foreground leading-relaxed text-justify">
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>
          </div>

          {/* Tugas dan Fungsi */}
          <div className="mb-16 animate-on-scroll">
            <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-lg">
              <div className="grid md:grid-cols-3">
                {/* Tugas - Column 1 */}
                <div className="md:col-span-1 p-8 bg-primary/5 border-b md:border-b-0 md:border-r border-border">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                      <Target className="w-5 h-5 text-primary" />
                    </div>
                    <h2 className="text-xl font-bold text-foreground">Tugas</h2>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {tugasDanFungsi.tugas}
                  </p>
                </div>

                {/* Fungsi - Column 2 & 3 */}
                <div className="md:col-span-2 p-8 lg:p-10">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center">
                      <Shield className="w-5 h-5 text-accent" />
                    </div>
                    <h2 className="text-xl font-bold text-foreground">Fungsi</h2>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-x-8 gap-y-4">
                    {tugasDanFungsi.fungsi.map((item, idx) => (
                      <div key={idx} className="flex items-start gap-3 group/item">
                        <div className="w-6 h-6 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0 mt-0.5 border border-accent/20 transition-colors group-hover/item:bg-accent/20">
                          <span className="text-xs font-bold text-accent uppercase">{String.fromCharCode(97 + idx)}</span>
                        </div>
                        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                          {item}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Layanan Klinik PKP */}
          <div className="mb-16 animate-on-scroll">
            <div className="text-center mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
                Layanan Klinik PKP
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Rangkaian layanan yang kami sediakan untuk membantu masyarakat
                memahami kebutuhan perumahan secara lebih terarah.
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {layananKlinik.map((layanan, index) => {
                const IconComponent = iconMap[layanan.icon];
                return (
                  <div
                    key={layanan.id}
                    className="bg-card rounded-2xl border border-border p-6 hover:shadow-xl transition-shadow animate-on-scroll"
                    style={{ transitionDelay: `${index * 0.1}s` }}
                  >
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center mb-4">
                      {IconComponent && <IconComponent className="w-6 h-6 text-primary-foreground" />}
                    </div>
                    <h3 className="font-semibold text-foreground mb-2">{layanan.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {layanan.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Nilai-Nilai */}
          <div className="animate-on-scroll">
            <div className="text-center mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
                Nilai-Nilai Kami
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Prinsip yang menjadi landasan dalam setiap layanan yang kami
                berikan.
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {nilaiNilai.map((nilai, index) => {
                const IconComponent = iconMap[nilai.icon];
                return (
                  <div
                    key={nilai.title}
                    className="bg-card rounded-2xl border border-border p-6 text-center hover:border-primary/30 transition-colors animate-on-scroll"
                    style={{ transitionDelay: `${index * 0.1}s` }}
                  >
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                      {IconComponent && <IconComponent className="w-8 h-8 text-primary" />}
                    </div>
                    <h3 className="font-semibold text-foreground mb-2">{nilai.title}</h3>
                    <p className="text-sm text-muted-foreground">{nilai.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
