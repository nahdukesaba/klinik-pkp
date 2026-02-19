"use client";

import { useState } from "react";

import { CheckCircle, ChevronDown, ChevronUp, ClipboardList, ListChecks } from "lucide-react";

import { tugasDanFungsi } from "@/data/tentang";
import useScrollAnimation from "@/hooks/use-scroll-animation";

const INITIAL_ITEMS = 5;

export default function AboutSection() {
  const ref = useScrollAnimation();
  const [showAllFungsi, setShowAllFungsi] = useState(false);
  const totalFungsi = tugasDanFungsi.fungsi.length;
  const displayedFungsi = showAllFungsi
    ? tugasDanFungsi.fungsi
    : tugasDanFungsi.fungsi.slice(0, INITIAL_ITEMS);

  return (
    <section ref={ref} className="py-20 lg:py-32 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5" />
      <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-primary/5 to-transparent" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-start">
          {/* Left Content */}
          <div className="space-y-6 animate-on-scroll">
            <span className="inline-block px-4 py-1.5 bg-primary/10 text-primary rounded-full text-sm font-medium border border-primary/20">
              Tentang Kami
            </span>
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground">
              Balai Pelaksana Penyediaan Perumahan
              <span className="text-primary block">Sumatera II</span>
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              BP3KP Sumatera II adalah unit pelaksana teknis di bawah
              Kementerian Perumahan dan Kawasan Permukiman yang bertugas
              melaksanakan penyediaan perumahan dan pengembangan kawasan
              permukiman di wilayah Sumatera.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Klinik PKP hadir untuk memberikan layanan konsultasi dan informasi
              terpadu kepada masyarakat terkait program-program perumahan,
              rusun, penanganan kawasan kumuh, dan bantuan perumahan lainnya.
            </p>

            <ul className="space-y-4 pt-4">
              {[
                "Penyediaan data sebaran rusun yang akurat",
                "Profil kawasan kumuh dan program penanganan",
                "Penerima bantuan BSPS per desa",
                "Bank desain untuk referensi pembangunan",
              ].map((item, index) => (
                <li
                  key={index}
                  className="flex items-center gap-3 animate-on-scroll"
                  style={{ transitionDelay: `${index * 0.1}s` }}
                >
                  <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                  <span className="text-foreground">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Right Content - Tugas & Fungsi Cards */}
          <div className="space-y-6">
            <div className="p-8 bg-card rounded-2xl border border-border shadow-lg animate-on-scroll hover:shadow-xl transition-shadow">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center text-primary-foreground shadow-lg">
                  <ClipboardList className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-semibold text-foreground">Tugas</h3>
              </div>
              <p className="text-muted-foreground leading-relaxed capitalize">
                {tugasDanFungsi.tugas}
              </p>
            </div>

            <div
              className="p-8 bg-card rounded-2xl border border-border shadow-lg animate-on-scroll hover:shadow-xl transition-shadow"
              style={{ transitionDelay: "0.1s" }}
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-accent to-primary rounded-xl flex items-center justify-center text-primary-foreground shadow-lg">
                  <ListChecks className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-semibold text-foreground">
                  Fungsi
                </h3>
              </div>
              <ul className="space-y-2.5 text-muted-foreground">
                {displayedFungsi.map((item, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <span className="text-primary font-bold mt-0.5 flex-shrink-0">
                      {index + 1}.
                    </span>
                    <span className="capitalize leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
              {totalFungsi > INITIAL_ITEMS && (
                <button
                  onClick={() => setShowAllFungsi(!showAllFungsi)}
                  className="mt-4 w-full flex items-center justify-center gap-2 py-2 px-4 text-sm font-medium text-primary hover:bg-primary/10 rounded-lg transition-colors border border-primary/20"
                >
                  {showAllFungsi ? (
                    <>
                      <ChevronUp className="w-4 h-4" />
                      Tampilkan Lebih Sedikit
                    </>
                  ) : (
                    <>
                      <ChevronDown className="w-4 h-4" />
                      Lihat Semua ({totalFungsi - INITIAL_ITEMS} lainnya)
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
