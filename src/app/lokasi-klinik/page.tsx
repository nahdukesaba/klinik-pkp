/**
 * Route: /lokasi-klinik
 *
 * Halaman Lokasi Klinik PKP - informasi lokasi dan kontak.
 * Data statis dari src/content/lokasi-klinik.content.ts
 * Page ini adalah Server Component agar bisa export metadata untuk SEO.
 * Komponen utama di-lazy-load melalui route client reusable.
 */

import { LokasiKlinikRouteClient } from "@/components/shared/AppRouteClients";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Lokasi Klinik PKP - Klinik PKP",
  description:
    "Informasi lokasi, jam layanan, dan kontak resmi Klinik PKP BP3KP Sumatera II.",
};

export default function Page() {
  return <LokasiKlinikRouteClient />;
}
