/**
 * Route: /sebaran-rusun
 *
 * Halaman Sebaran Rusun — menampilkan peta lokasi rumah susun.
 * Page ini adalah Server Component agar bisa export metadata untuk SEO.
 * Komponen utama di-lazy-load melalui route client reusable.
 */

import { SebaranRusunRouteClient } from "@/components/shared/AppRouteClients";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sebaran Rusun — Klinik PKP",
  description:
    "Peta lokasi rumah susun (Rusun) di Sumatera Utara. Lihat sebaran, detail unit, dan informasi lainnya.",
};

export default function Page() {
  return <SebaranRusunRouteClient />;
}
