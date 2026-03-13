/**
 * Route: /sosialisasi-klinik-pkp
 *
 * Halaman Sosialisasi Klinik PKP — peta, jadwal, dan berita sosialisasi.
 * Page ini adalah Server Component agar bisa export metadata untuk SEO.
 * Komponen utama di-lazy-load melalui loader.tsx (Client Component).
 */

import SosialisasiLoader from "./loader";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sosialisasi Klinik PKP — Klinik PKP",
  description:
    "Informasi sosialisasi dan edukasi perumahan dan kawasan permukiman. Peta lokasi, jadwal kegiatan, dan berita terkini.",
};

export default function Page() {
  return <SosialisasiLoader />;
}