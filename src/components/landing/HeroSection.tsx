/**
 * HeroSection — Server Component
 * Banner utama landing page. Tidak menggunakan hooks React,
 * sehingga bisa di-render di server untuk performa lebih baik.
 */

import Image from "next/image";
import Link from "next/link";

import {
  ArrowRight,
  BadgeAlert,
  BookOpenText,
  MapPin,
  MessageCircleQuestionMark,
  Palette,
} from "lucide-react";

import { KONSULTASI_HREF } from "@/lib/constants";

import type { LucideIcon } from "lucide-react";

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  delay: string;
  href: string;
}

const heroFeatureCards: FeatureCardProps[] = [
  {
    icon: Palette,
    title: "Bank Desain",
    description:
      "Akses referensi desain hunian untuk kebutuhan perencanaan dan pembangunan.",
    delay: "0s",
    href: "/bank-desain",
  },
  {
    icon: BookOpenText,
    title: "Sosialisasi",
    description:
      "Lihat kegiatan, materi, dan agenda sosialisasi bidang perumahan dan permukiman.",
    delay: "0.1s",
    href: "/sosialisasi-klinik-pkp",
  },
  {
    icon: MessageCircleQuestionMark,
    title: "Konsultasi",
    description:
      "Pilih alur konsultasi online atau rencanakan kunjungan langsung sesuai kebutuhan Anda.",
    delay: "0.2s",
    href: KONSULTASI_HREF,
  },
  {
    icon: BadgeAlert,
    title: "Aduan",
    description:
      "Pilih kanal pengaduan resmi yang sesuai dengan jenis laporan dan tindak lanjut yang dibutuhkan.",
    delay: "0.3s",
    href: "/informasi/kanal-pengaduan",
  },
];

function FeatureCard({
  icon: Icon,
  title,
  description,
  delay,
  href,
}: FeatureCardProps) {
  const cardClassName =
    "group block h-full cursor-pointer rounded-2xl border border-border bg-card/80 p-4 shadow-lg backdrop-blur-sm transition-all duration-300 animate-slide-up hover:border-primary/30 hover:shadow-xl sm:p-6";

  const cardContent = (
    <>
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors duration-300 group-hover:scale-110 group-hover:bg-primary group-hover:text-primary-foreground">
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="mb-2 font-semibold text-foreground transition-colors group-hover:text-primary">
        {title}
      </h3>
      <p className="text-sm text-muted-foreground">{description}</p>
      <div className="mt-3 flex items-center text-xs text-primary opacity-0 transition-opacity group-hover:opacity-100">
        <span>Lihat Detail</span>
        <ArrowRight className="ml-1 h-3 w-3 transition-transform group-hover:translate-x-1" />
      </div>
    </>
  );

  return (
    <Link href={href} className={cardClassName} style={{ animationDelay: delay }}>
      {cardContent}
    </Link>
  );
}

export default function HeroSection() {
  return (
    <section className="relative flex min-h-[100svh] items-center overflow-hidden pb-12 pt-24 sm:pb-16 lg:pt-28">
      {/* Background Image - Sumatera Map */}
      <div className="absolute inset-0">
        <Image
          src="/sumatera-map-bg.jpg"
          alt="Peta Sumatera"
          fill
          sizes="100vw"
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

      <div className="container relative z-10 mx-auto px-4 sm:px-6">
        <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1.08fr)_minmax(0,0.92fr)] lg:gap-16 xl:gap-20 2xl:gap-24">
          {/* Left Content */}
          <div className="space-y-6 sm:space-y-8">
            <h1 className="text-4xl font-bold leading-tight text-foreground animate-slide-up sm:text-5xl lg:text-6xl 2xl:text-7xl">
              Klinik Perumahan &
              <span className="text-primary block mt-2">Kawasan Permukiman</span>
              <span className="mt-4 block text-lg font-medium text-muted-foreground sm:text-xl lg:text-2xl">
                BP3KP Sumatera II
              </span>
            </h1>

            <p
              className="max-w-2xl text-base text-muted-foreground animate-slide-up sm:text-lg"
              style={{ animationDelay: "0.1s" }}
            >
              Klinik PKP merupakan layanan informasi, konsultasi, serta
              pendampingan teknis yang diselenggarakan oleh BP3KP Sumatera II
              untuk membantu masyarakat memahami layanan perumahan dan kawasan
              permukiman secara lebih mudah.
            </p>

            <div
              className="flex flex-col gap-4 animate-slide-up sm:flex-row"
              style={{ animationDelay: "0.2s" }}
            >
              <Link
                href="/lokasi-klinik"
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-8 py-4 font-semibold text-primary-foreground shadow-lg transition-all hover:bg-primary-hover hover:shadow-xl hover:shadow-primary/20 sm:w-auto"
              >
                <MapPin className="w-5 h-5" />
                Lihat Lokasi Klinik
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>

          {/* Right Content - Feature Cards */}
          <div className="relative mx-auto w-full max-w-2xl lg:max-w-none">
            <div className="grid grid-cols-1 gap-4 min-[480px]:grid-cols-2">
              {heroFeatureCards.map((card) => (
                <FeatureCard key={card.title} {...card} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
