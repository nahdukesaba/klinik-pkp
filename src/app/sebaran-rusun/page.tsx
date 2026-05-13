/**
 * Route: /sebaran-rusun
 *
 * Halaman Sebaran Rusun - menampilkan peta lokasi rumah susun.
 * Page ini adalah Server Component agar bisa export metadata untuk SEO.
 * Komponen utama di-lazy-load melalui route client reusable.
 */

import { SebaranRusunRouteClient } from "@/components/route-clients/AppRouteClients";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sebaran Rusun - Klinik PKP",
  description:
    "Peta sebaran rumah susun di Sumatera Utara beserta detail lokasi, kapasitas, dan informasi bangunan.",
};

export default function Page() {
  return <SebaranRusunRouteClient />;
}
