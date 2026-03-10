"use client";

import Link from "next/link";

import {
  Scale,
  BookOpen,
  ExternalLink,
  Download,
  ChevronRight,
  Info,
  Building,
  Users,
  Shield,
} from "lucide-react";

import { Navbar, Footer } from "@/components/layout";
import {
  regulations,
  regulationCategories,
  relatedLinks,
} from "@/content/informasi";
import { useScrollAnimation } from "@/hooks/use-scroll-animation";

import type { LucideIcon } from "lucide-react";

const iconMap: Record<string, LucideIcon> = {
  Building,
  Users,
  Shield,
};

export default function PeraturanPage() {
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
              <Scale className="w-4 h-4" />
              <span>Peraturan</span>
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
              Peraturan & Kebijakan
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              Kumpulan peraturan dan kebijakan terkait perumahan, bangunan
              gedung, dan program BSPS
            </p>
          </div>

          {/* Categories */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {regulationCategories.map((category, index) => {
              const IconComponent = iconMap[category.iconName];
              return (
                <div
                  key={index}
                  className="bg-card rounded-2xl border border-border p-6 shadow-lg hover:shadow-xl hover:border-primary/30 transition-all animate-on-scroll cursor-pointer"
                  style={{ transitionDelay: `${index * 0.1}s` }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground">
                      {IconComponent && <IconComponent className="w-5 h-5" />}
                    </div>
                    <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
                      {category.count} Dokumen
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-foreground mb-2">
                    {category.name}
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    {category.description}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Regulations List */}
          <div className="mb-12 animate-on-scroll">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">
                Daftar Peraturan
              </h2>
            </div>

            <div className="space-y-4">
              {regulations.map((reg, index) => (
                <div
                  key={index}
                  className="bg-card rounded-2xl border border-border overflow-hidden shadow-lg hover:shadow-xl hover:border-primary/30 transition-all animate-on-scroll"
                  style={{ transitionDelay: `${index * 0.05}s` }}
                >
                  <div className="flex flex-col md:flex-row">
                    {/* Year Badge */}
                    <div className="md:w-24 bg-gradient-to-br from-primary to-accent flex items-center justify-center p-4 md:p-6">
                      <span className="text-2xl md:text-3xl font-bold text-primary-foreground">
                        {reg.year}
                      </span>
                    </div>

                    {/* Content */}
                    <div className="flex-1 p-5 md:p-6">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="px-2.5 py-0.5 bg-secondary rounded-lg text-xs font-medium text-muted-foreground">
                              {reg.category}
                            </span>
                            <span className="text-sm font-semibold text-primary">
                              {reg.number}
                            </span>
                          </div>
                          <h3 className="text-base md:text-lg font-bold text-foreground mb-1">
                            {reg.title}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            Tentang: {reg.about}
                          </p>
                        </div>

                        {reg.link && (
                          <a
                            href={reg.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-xl text-sm font-medium hover:bg-primary/20 transition-colors flex-shrink-0"
                          >
                            <Download className="w-4 h-4" />
                            Unduh
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Related Links */}
          <div className="mb-12 animate-on-scroll">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                <ExternalLink className="w-5 h-5 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">
                Portal Peraturan Terkait
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {relatedLinks.map((link, index) => (
                <a
                  key={index}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-card rounded-2xl border border-border p-6 shadow-lg hover:shadow-xl hover:border-primary/30 transition-all group animate-on-scroll"
                  style={{ transitionDelay: `${index * 0.1}s` }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors">
                      {link.title}
                    </h3>
                    <ExternalLink className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {link.description}
                  </p>
                </a>
              ))}
            </div>
          </div>

          {/* Info Banner */}
          <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-2xl p-6 border border-primary/20 animate-on-scroll">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0">
                <Info className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-foreground mb-1">
                  Perlu Informasi Lebih Lanjut?
                </h3>
                <p className="text-muted-foreground">
                  Untuk informasi lebih detail mengenai peraturan dan
                  kebijakan, silakan hubungi Klinik PKP atau kunjungi portal
                  JDIH Kementerian PUPR.
                </p>
              </div>
              <Link
                href="/informasi/kontak"
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl font-semibold hover:bg-primary-hover transition-colors flex-shrink-0"
              >
                Hubungi Kami
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
