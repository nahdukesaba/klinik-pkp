/**
 * Route: /lokasi-klinik
 *
 * Halaman Lokasi Klinik PKP — informasi lokasi dan kontak.
 * Data statis dari src/content/lokasi-klinik.ts
 * Page ini adalah Server Component agar bisa export metadata untuk SEO.
 * Komponen utama di-lazy-load melalui loader.tsx (Client Component).
 */

import LokasiKlinikLoader from "./loader";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Lokasi Klinik PKP — Klinik PKP",
  description:
    "Informasi lokasi dan kontak Klinik Perumahan dan Kawasan Permukiman Sumatera Utara.",
};

export default function Page() {
  return <LokasiKlinikLoader />;
}
