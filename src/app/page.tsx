/**
 * Route: /
 *
 * Landing page Klinik PKP.
 * Homepage difokuskan ke hero, layanan utama, dan highlight Instagram terbaru.
 */

import { Suspense } from "react";

import HeroSection from "@/components/landing/HeroSection";
import InstagramSection, {
  InstagramSectionSkeleton,
} from "@/components/landing/InstagramSection";
import ServicesSection from "@/components/landing/ServicesSection";
import { Footer, Navbar } from "@/components/layout";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Klinik PKP - Perumahan dan Kawasan Permukiman Sumatera Utara",
  description:
    "Portal informasi perumahan dan kawasan permukiman Sumatera Utara. Sebaran rusun, kawasan kumuh, penerimaan BSPS, dan sosialisasi.",
};

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <HeroSection />
        <ServicesSection />
        <Suspense fallback={<InstagramSectionSkeleton />}>
          <InstagramSection />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
