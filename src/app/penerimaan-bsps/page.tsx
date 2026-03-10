/**
 * Route: /penerimaan-bsps
 *
 * Halaman Penerimaan BSPS — peta lokasi penerima BSPS.
 * Page ini adalah Server Component agar bisa export metadata untuk SEO.
 * Komponen utama di-lazy-load melalui loader.tsx (Client Component).
 */

import PenerimaanBspsLoader from "./loader";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Penerimaan BSPS — Klinik PKP",
  description:
    "Peta lokasi penerima Bantuan Stimulan Perumahan Swadaya (BSPS) di Sumatera Utara. Persyaratan, prosedur, dan kriteria.",
};

export default function Page() {
  return <PenerimaanBspsLoader />;
}