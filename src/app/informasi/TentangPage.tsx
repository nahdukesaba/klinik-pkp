"use client";

import {
  Building2,
  ClipboardList,
  FileQuestion,
  FileText,
  Heart,
  Home,
  Mail,
  MapPin,
  Phone,
  Shield,
  Target,
  Users,
  Zap,
} from "lucide-react";

import { Footer, Navbar } from "@/components/layout";
import { PageBackground } from "@/components/shared";
import {
  aboutInfo,
  layananKlinik,
  nilaiNilai,
  sejarah,
  tugasPokok,
  visiMisi,
} from "@/data/tentang";
import { useScrollAnimation } from "@/hooks/use-scroll-animation";

import type { LucideIcon } from "lucide-react";

export const dynamic = "force-dynamic";

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
      <PageBackground />
      
      <main ref={ref} className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-16 animate-on-scroll">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium mb-4 border border-primary/20">
              <Building2 className="w-4 h-4" />
              <span>Tentang Kami</span>
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
                  <h3 className="font-semibold text-foreground mb-2">Alamat Kantor</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {aboutInfo.alamat.jalan}<br />
                    {aboutInfo.alamat.kota}, {aboutInfo.alamat.provinsi} {aboutInfo.alamat.kodePos}
                  </p>
                </div>
              </div>
              <div className="space-y-3 pl-16">
                <div className="flex items-center gap-3 text-sm">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">{aboutInfo.alamat.telp}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <a href={`mailto:${aboutInfo.alamat.email}`} className="text-primary hover:underline">
                    {aboutInfo.alamat.email}
                  </a>
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
                    {aboutInfo.wilayahKerja.map((wilayah, index) => (
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
                {sejarah.paragraphs.map((paragraph, index) => (
                  <p key={index} className="text-muted-foreground leading-relaxed text-justify">
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>
          </div>

          {/* Visi Misi */}
          <div className="grid md:grid-cols-2 gap-6 mb-16">
            {visiMisi.map((item, index) => (
              <div
                key={item.title}
                className="bg-card rounded-2xl border border-border p-8 shadow-lg animate-on-scroll"
                style={{ transitionDelay: `${index * 0.1}s` }}
              >
                <div className="mb-6">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/20 mb-4">
                    <Target className="w-6 h-6 text-primary" />
                  </div>
                  <h2 className="text-2xl font-bold text-foreground">{item.title}</h2>
                </div>
                <div className="space-y-3">
                  {item.content.map((text, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                      <p className="text-muted-foreground leading-relaxed">{text}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Tugas Pokok */}
          <div className="mb-16 animate-on-scroll">
            <div className="text-center mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
                Tugas Pokok dan Fungsi
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Tugas dan tanggung jawab BP3KP Sumatera II dalam melayani masyarakat
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tugasPokok.map((tugas, index) => (
                <div
                  key={tugas.id}
                  className="bg-card rounded-2xl border border-border p-6 hover:border-primary/30 transition-colors animate-on-scroll"
                  style={{ transitionDelay: `${index * 0.1}s` }}
                >
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
                      <span className="text-primary font-bold">{tugas.id}</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-2">{tugas.title}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {tugas.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Layanan Klinik PKP */}
          <div className="mb-16 animate-on-scroll">
            <div className="text-center mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
                Layanan Klinik PKP
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Berbagai layanan yang kami sediakan untuk membantu masyarakat
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
                Prinsip yang menjadi landasan dalam setiap pelayanan kami
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
