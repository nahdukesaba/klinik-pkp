"use client";

import Image from "next/image";
import Link from "next/link";

import { ArrowRight, Building2, MapPin, Users, Gift } from "lucide-react";

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  delay: string;
}

function FeatureCard({ icon, title, description, delay }: FeatureCardProps) {
  return (
    <div
      className="p-6 bg-card/80 backdrop-blur-sm rounded-2xl border border-border shadow-lg hover:shadow-xl hover:border-primary/30 transition-all duration-300 group animate-slide-up"
      style={{ animationDelay: delay }}
    >
      <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary mb-4 group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
        {icon}
      </div>
      <h3 className="font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
        {title}
      </h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center pt-20 overflow-hidden">
      {/* Background Image - Sumatera Map */}
      <div className="absolute inset-0">
        <Image
          src="/sumatera-map-bg.jpg"
          alt="Peta Sumatera"
          fill
          className="object-cover"
          priority
        />
      </div>

      {/* Gradient Overlays */}
      <div className="absolute inset-0 bg-gradient-to-br from-background/95 via-background/85 to-background/70 dark:from-background/98 dark:via-background/90 dark:to-background/80" />

      {/* Decorative Elements */}
      <div className="absolute top-1/4 right-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 left-10 w-96 h-96 bg-accent-2/20 rounded-full blur-3xl" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-radial from-primary/5 to-transparent rounded-full" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight animate-slide-up">
              Klinik Perumahan &
              <span className="text-primary block mt-2">Kawasan Permukiman</span>
              <span className="text-lg md:text-xl lg:text-2xl font-medium text-muted-foreground block mt-4">
                BP3KP Sumatera II
              </span>
            </h1>

            <p
              className="text-lg text-muted-foreground max-w-xl animate-slide-up"
              style={{ animationDelay: "0.1s" }}
            >
              Layanan konsultasi dan informasi terpadu untuk perumahan,
              permukiman, dan kawasan kumuh di wilayah Sumatera. Temukan solusi
              hunian yang tepat untuk Anda.
            </p>

            <div
              className="flex flex-col sm:flex-row gap-4 animate-slide-up"
              style={{ animationDelay: "0.2s" }}
            >
              <Link
                href="/lokasi-klinik"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary-hover transition-all shadow-lg hover:shadow-xl hover:shadow-primary/20 group"
              >
                <MapPin className="w-5 h-5" />
                Lihat Lokasi Klinik
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>

          {/* Right Content - Feature Cards */}
          <div className="relative">
            <div className="grid grid-cols-2 gap-4">
              <FeatureCard
                icon={<MapPin className="w-6 h-6" />}
                title="Sebaran Rusun"
                description="Lihat lokasi rusun di wilayah Sumatera"
                delay="0s"
              />
              <FeatureCard
                icon={<Building2 className="w-6 h-6" />}
                title="Kawasan Kumuh"
                description="Profil dan penanganan kawasan kumuh"
                delay="0.1s"
              />
              <FeatureCard
                icon={<Gift className="w-6 h-6" />}
                title="Penerima BSPS"
                description="Bantuan stimulan perumahan swadaya"
                delay="0.2s"
              />
              <FeatureCard
                icon={<Users className="w-6 h-6" />}
                title="Sosialisasi"
                description="Kegiatan edukasi dan sosialisasi"
                delay="0.3s"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
