"use client";

import { CheckCircle, Target, Eye } from "lucide-react";

import useScrollAnimation from "@/hooks/use-scroll-animation";

export default function AboutSection() {
  const ref = useScrollAnimation();

  return (
    <section ref={ref} className="py-20 lg:py-32 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5" />
      <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-primary/5 to-transparent" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
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

          {/* Right Content - Vision & Mission Cards */}
          <div className="space-y-6">
            <div className="p-8 bg-card rounded-2xl border border-border shadow-lg animate-on-scroll hover:shadow-xl transition-shadow">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center text-primary-foreground shadow-lg">
                  <Eye className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-semibold text-foreground">Visi</h3>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                Mewujudkan penyediaan perumahan dan permukiman yang layak,
                terjangkau, dan berkelanjutan bagi seluruh masyarakat di wilayah
                Sumatera.
              </p>
            </div>

            <div
              className="p-8 bg-card rounded-2xl border border-border shadow-lg animate-on-scroll hover:shadow-xl transition-shadow"
              style={{ transitionDelay: "0.1s" }}
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-accent to-primary rounded-xl flex items-center justify-center text-primary-foreground shadow-lg">
                  <Target className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-semibold text-foreground">Misi</h3>
              </div>
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold">•</span>
                  Meningkatkan akses masyarakat terhadap informasi perumahan
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold">•</span>
                  Menyediakan layanan konsultasi yang berkualitas
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold">•</span>
                  Mendukung program penanganan kawasan kumuh
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
