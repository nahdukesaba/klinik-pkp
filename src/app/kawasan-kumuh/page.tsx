/**
 * Route: /kawasan-kumuh
 *
 * Halaman Profil Kawasan Kumuh — peta dan data kawasan kumuh.
 * Page ini adalah Server Component agar bisa export metadata untuk SEO.
 * Komponen utama di-lazy-load melalui loader.tsx (Client Component).
 */

import KawasanKumuhLoader from "./loader";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Profil Kawasan Kumuh — Klinik PKP",
  description:
    "Peta dan data kawasan kumuh di Sumatera Utara. Filter berdasarkan lokasi dan status penanganan.",
};

export default function Page() {
  return <KawasanKumuhLoader />;
}
