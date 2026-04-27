/**
 * Route: /
 *
 * Landing page Klinik PKP.
 * Homepage difokuskan ke hero dan layanan utama.
 */

import HeroSection from "@/components/landing/HeroSection";
import InstagramSection from "@/components/landing/InstagramSection";
import ServicesSection from "@/components/landing/ServicesSection";
import { Footer, Navbar } from "@/components/layout";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Klinik PKP - Perumahan dan Kawasan Permukiman Sumatera Utara",
  description:
    "Portal layanan informasi, konsultasi, dan pendampingan teknis BP3KP Sumatera II untuk sektor perumahan dan kawasan permukiman.",
};

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <HeroSection />
        <ServicesSection />
        <InstagramSection />
      </main>
      <Footer />
    </div>
  );
}
