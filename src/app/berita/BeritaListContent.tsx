"use client";

import Image from "next/image";
import Link from "next/link";

import { Calendar, MapPin, ArrowRight, Newspaper } from "lucide-react";

import { Navbar, Footer } from "@/components/layout";
import { beritaSosialisasiList } from "@/data/sosialisasi-klinik";

// ============================================
// BeritaListContent Component
// DESKRIPSI: Halaman list semua berita dengan theme-aware styling
//
// SAAT PAKAI API BACKEND:
// - Ganti beritaSosialisasiList dengan fetch dari API
// - Contoh: const { data } = useSWR('/api/berita')
// ============================================
export default function BeritaListContent() {
  // Sort berita by newest first (descending)
  const sortedBerita = [...beritaSosialisasiList].sort(
    (a, b) => new Date(b.rawDate).getTime() - new Date(a.rawDate).getTime()
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-16">
        {/* Background Pattern */}
        <div className="fixed inset-0 -z-10 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-secondary/60 via-background to-accent-2/20 dark:from-background dark:via-primary/5 dark:to-accent/5" />
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent-2/10 rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium mb-4 border border-primary/20">
              <Newspaper className="w-4 h-4" />
              <span>Berita</span>
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
              Berita Sosialisasi Klinik PKP
            </h1>
            <p className="text-muted-foreground max-w-3xl mx-auto text-base md:text-lg">
              Informasi terkini tentang kegiatan sosialisasi Klinik Perumahan dan Kawasan Permukiman
            </p>
          </div>

          {/* News Grid */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {sortedBerita.map((berita, index) => (
              <Link
                key={berita.id}
                href={`/berita/${berita.id}`}
                className="bg-card rounded-2xl border border-border overflow-hidden hover:border-primary/30 transition-all shadow-md hover:shadow-xl group opacity-0 animate-fade-in"
                style={{
                  animationDelay: `${index * 0.05}s`,
                  animationFillMode: "forwards",
                }}
              >
                <div className="relative h-48 sm:h-44 md:h-48 bg-secondary overflow-hidden">
                  <Image
                    src={berita.image}
                    alt={berita.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                </div>
                <div className="p-5">
                  <h3 className="text-lg font-semibold text-foreground mb-3 line-clamp-2 group-hover:text-primary transition-colors">
                    {berita.title}
                  </h3>
                  <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
                    {berita.description}
                  </p>
                  <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground mb-4">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-primary" />
                      <span>{berita.date}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-primary" />
                      <span className="truncate max-w-[120px]">{berita.kabupaten}</span>
                    </div>
                  </div>
                  <div className="flex items-center text-primary font-medium text-sm group-hover:gap-2 transition-all">
                    Baca Selengkapnya
                    <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
