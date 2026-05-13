/**
 * Route: /penerimaan-bsps
 *
 * Halaman Penerimaan BSPS - peta lokasi penerima BSPS.
 * Page ini adalah Server Component agar bisa export metadata untuk SEO.
 * Komponen utama di-lazy-load melalui route client reusable.
 */

import { PenerimaanBspsRouteClient } from "@/components/route-clients/AppRouteClients";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Penerimaan BSPS - Klinik PKP",
};

export default function Page() {
  return <PenerimaanBspsRouteClient />;
}
