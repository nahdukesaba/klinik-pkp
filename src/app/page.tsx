/**
 * Route: / (Home)
 *
 * Landing page Klinik PKP — Server Component.
 * Sections di-lazy-load untuk performa (code-splitting).
 */

import dynamic from "next/dynamic";

import HeroSection from "@/components/landing/HeroSection";
import { Footer, Navbar } from "@/components/layout";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Klinik PKP — Perumahan dan Kawasan Permukiman Sumatera Utara",
  description:
    "Portal informasi perumahan dan kawasan permukiman Sumatera Utara. Sebaran rusun, kawasan kumuh, penerimaan BSPS, dan sosialisasi.",
};

function SectionSkeleton({ height }: { height: string }) {
  return (
    <div className="w-full">
      <div
        className="w-full rounded-2xl bg-muted animate-pulse"
        style={{ height }}
      />
    </div>
  );
}

const ServicesSection = dynamic(
  () => import("@/components/landing/ServicesSection"),
  { loading: () => <SectionSkeleton height="280px" /> }
);

const HousingIndicatorsSection = dynamic(
  () => import("@/components/landing/HousingIndicatorsSection"),
  { loading: () => <SectionSkeleton height="320px" /> }
);

const BuildingStepsSection = dynamic(
  () => import("@/components/landing/BuildingStepsSection"),
  { loading: () => <SectionSkeleton height="360px" /> }
);

const AboutSection = dynamic(
  () => import("@/components/landing/AboutSection"),
  { loading: () => <SectionSkeleton height="280px" /> }
);

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <HeroSection />
        <ServicesSection />
        <HousingIndicatorsSection />
        <BuildingStepsSection />
        <AboutSection />
      </main>
      <Footer />
    </div>
  );
}
